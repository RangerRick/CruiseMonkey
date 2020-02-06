import 'capacitor-ibeacon';
import { IBeaconRegion } from 'capacitor-ibeacon';
import { Plugins, AppState } from '@capacitor/core';
const {
  App,
  IBeacon,
} = Plugins;

import moment, { Moment } from 'moment';

const BEACON_PREFIX = 'DEADBEEF-0000-0000-0000-';

const randomInteger = (min: number, max: number, inclusive = false) => {
  return Math.floor(Math.random() * (max - min + (inclusive? 1 : 0))) + min;
};

const zeroPad = (input: string, length: number): string => {
  const value = String(input);
  // never truncate, just return if it's bigger
  if (value.length >= length) {
    return String(input);
  }
  return ('0'.repeat(length) + value).substr(0 - length);
};

type errorHandler = (err: Error) => void;

export class BackgroundManager {
  public minUpdate = moment.duration(5, 'minutes');
  public maxUpdate = moment.duration(30, 'minutes');
  public pingAttemptInterval = moment.duration(20, 'minutes');
  public updateTimeoutThreshold = moment.duration(60, 'minutes');

  protected lastRegion = null as IBeaconRegion | null;
  protected lastUpdateTime = null as Moment | null;

  private _updateCallbacks = [] as Array<Function | null>;
  private _isActive = true;
  private _enabled = true;
  private _scanRegionCount = 4;
  private _scanUUIDs = [] as string[];
  private _seenUUIDs = new Map<string, Moment>();

  private _pingInterval = null as number | null;

  private _errorListeners = [] as Array<errorHandler>;

  constructor() {
    App.addListener('appStateChange', (state: AppState) => {
      this.isActive = state.isActive;
    });

    this.init();

  }

  protected async init() {
    IBeacon.addListener('error', (err: Error) => {
      console.error(`BackgroundManager.error(): ${err.message}`);
      for (const handler of this._errorListeners) {
        try {
          handler(err);
        } catch (subErr) {
          console.error(`BackgroundManager.error(): failed while running error handler callback: ${subErr.message}`);
        }
      }
    });
    IBeacon.addListener('enteredRegion', this.enteredRegion);
    await IBeacon.requestAlwaysAuthorization();
  }

  public get isActive() {
    return this._isActive;
  }

  public set isActive(active: boolean) {
    this._isActive = active;
    if (active) {
      if (this.enabled) {
        this.startPing();
        this.stopScanning();
      } else {
        this.stopPing();
        this.stopScanning();
      }
    } else {
      if (this.enabled) {
        this.stopPing();
        this.startScanning();
      } else {
        this.stopPing();
        this.stopScanning();
      }
    }
  }

  public get enabled() {
    return this._enabled;
  }

  public set enabled(enabled: boolean) {
    this._enabled = enabled;
    if (enabled) {
      if (this.isActive) {
        this.onActive();
      } else {
        this.onInactive();
      }
    } else {
      this.stopScanning();
      this.stopPing();
    }
  }

  protected get scanRegionCount() {
    return this._scanRegionCount;
  }

  protected set scanRegionCount(count: number) {
    const oldCount = this._scanRegionCount;
    // must be at least one region
    const newCount = Math.max(count, 1);

    this._scanRegionCount = newCount;

    if (newCount !== oldCount) {
      this.resetScanning();
    }
  }

  protected async onActive() {
    await this.stopScanning();
    await this.startPing();
  }

  protected async onInactive() {
    await this.startScanning();
    await this.stopPing();
  }

  protected async startScanning() {
    console.debug('BackgroundManager.startScanning()');
    if (this.isActive) {
      console.warn('BackgroundManager.startScanning() called, but we are currently active; skipping.');
      return;
    }
    if (!this.enabled) {
      console.warn('BackgroundManager.startScanning() called, but we are disabled; skipping.');
      return;
    }

    return this.enableScan();
  }

  protected async enableScan() {
    console.debug(`BackgroundManager.enableScan(): scanning ${this.scanUUIDs.length} regions.`);
    const ret = this.scanUUIDs.map((uuid, index) => {
      return IBeacon.startMonitoringForRegion({
        uuid: uuid,
        identifier: 'JoCo-' + index,
      });
    });
    return Promise.all(ret);
  }

  protected async stopScanning() {
    console.debug('BackgroundManager.stopScanning()');
    return this.disableScan();
  }

  protected async disableScan() {
    const { regions } = await IBeacon.getMonitoredRegions();
    console.debug(`BackgroundManager.disableScan(): stopping scanning ${regions.length} regions.`);
    const ret = regions.map((region: IBeaconRegion) => {
      return IBeacon.stopMonitoringForRegion(region);
    });
    return Promise.all(ret);
  }

  protected async resetScanning() {
    await this.stopScanning();
    await this.startScanning();
  }

  protected async startPing() {
    console.debug('BackgroundManager.startPing()');
    if (!this.isActive) {
      console.warn('BackgroundManager.startPing() called, but we are not active; skipping.');
      return;
    }
    if (!this.enabled) {
      console.warn('BackgroundManager.startPing() called, but we are disabled; skipping.');
      return;
    }

    if (this._pingInterval !== null) {
      console.warn('BackgroundManager.startPing(): ping is already running!');
      return;
    }

    this._pingInterval = setInterval(() => {
      this.ping();
    }, this.pingAttemptInterval.asMilliseconds());
  }

  protected async stopPing() {
    console.debug('BackgroundManager.stopPing()');
    if (this._pingInterval !== null) {
      clearInterval(this._pingInterval);
    }
    this._pingInterval = null;
  }

  protected async ping() {
    const uuids = this.getPingableUUIDs();
    if (uuids.length === 0) {
      console.warn('BackgroundManager.ping(): no pingable UUIDs; skipping.');
      return;
    }

    const isAdvertising = await IBeacon.isAdvertising();
    if (isAdvertising) {
      console.warn('BackgroundManager.ping(): already advertising; skipping.');
      return;
    }

    const index = randomInteger(0, uuids.length);
    const uuid = uuids[index];
    console.warn(`BackgroundManager.ping(): pinging ${uuid}`);

    const advertisedPeripheralData = {
      uuid: uuid,
      identifier: 'JoCo-' + index,
    };

    setTimeout(async () => {
      console.debug('BackgroundManager.ping(): stopping advertisement.');
      await IBeacon.stopAdvertising();
    }, 10 * 1000);

    await IBeacon.startAdvertising(advertisedPeripheralData);
  }

  public get scanUUIDs() {
    return this.updateScanUUIDs();
  }

  private updateScanUUIDs() {
    if (this._scanUUIDs.length !== this._scanRegionCount) {
      this._scanUUIDs = this.getRegionUUIDs(this._scanRegionCount);
    }
    return this._scanUUIDs;
  }

  private getRegionUUIDs(count: number): Array<string> {
    // eslint-disable-next-line prefer-spread
    return ((Array.apply(null, {length: Math.floor(count)} as number[]) as number[]).map(Number.call, Number) as number[]).map((index: number) => {
      return this.getUUID(index);
    });
  }


  public get seenUUIDs() {
    return Array.from(this._seenUUIDs.keys());
  }

  private updateSeenUUIDs() {
    // trim seen to things within the maxBroadcast time
    const cutoff = moment().subtract(this.updateTimeoutThreshold);
    for (const entry of this._seenUUIDs.entries()) {
      const time = entry[1];
      if (time.isBefore(cutoff)) {
        this._seenUUIDs.delete(entry[0]);
      }
    }
    return this._seenUUIDs;
  }

  protected getPingableUUIDs() {
    const seenUUIDs = this.updateSeenUUIDs();
    return this.getRegionUUIDs(this._scanRegionCount).filter((uuid) => {
      return !seenUUIDs.get(uuid);
    });
  }

  protected getIndex(uuid: string) {
    const chunks = uuid.split('-');
    const lastChunk = chunks[chunks.length - 1];
    return parseInt(lastChunk, 16);
  }

  protected getUUID(id: string | number) {
    const value = parseInt(String(id), 10).toString(16);
    return `${BEACON_PREFIX}${zeroPad(value, 12)}`;
  }

  protected doUpdate(region: IBeaconRegion) {
    const now = moment();
    this.lastUpdateTime = now;
    const index = this.getIndex(region.uuid);
    if (index > this._scanRegionCount) {
      console.warn(`Received ping outside of expected scan range: ${region.uuid}`);
    }
    // simple LRU, `add` always appends, first in the list is oldest
    this._seenUUIDs.delete(region.uuid);
    this._seenUUIDs.set(region.uuid, now);

    for (const callback of this._updateCallbacks) {
      if (callback !== null) {
        callback();
      }
    }
  }

  protected slowDown() {
    this._scanRegionCount = Math.max(1, this._scanRegionCount - 1);
  }

  protected speedUp() {
    this._scanRegionCount++;
  }

  public onUpdate(callback: () => void) {
    this._updateCallbacks.push(callback);
    return this._updateCallbacks.length - 1;
  }

  public cancelUpdate(index: number) {
    this._updateCallbacks[index] = null;
  }

  protected enteredRegion(region: IBeaconRegion) {
    if (this.lastUpdateTime === null) {
      this.doUpdate(region);
      return;
    }

    const now = moment();
    const minTime = this.lastUpdateTime.clone().add(this.minUpdate);
    const maxTime = this.lastUpdateTime.clone().add(this.maxUpdate);

    if (now.isBefore(minTime)) {
      // it's not time to trigger yet, we should listen and broadcast slower
      this.slowDown();
    } else if (now.isAfter(maxTime)) {
      // should have triggered before now, we should listen and broadcast faster
      this.speedUp();
      this.doUpdate(region);
    } else {
      // all good
      this.doUpdate(region);
    }
  }
}