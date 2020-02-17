/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { IBeaconRegion } from 'capacitor-ibeacon';
import { Plugins, AppState } from '@capacitor/core';
const {
  App,
  IBeacon,
  LocalNotifications,
} = Plugins;

import moment from 'moment-timezone';
import { Moment, Duration } from 'moment';
import { IQService, IPromise, IRootScopeService, ILogService, ITimeoutService } from 'angular';

const debugMode = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const angular: any;
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

const sendNotification = async (title: string, message: string) => {
  if (debugMode) {
    try {
      const enabled = await LocalNotifications.areEnabled();
      if (enabled) {
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title: title,
            body: message,
          }],
        });
      }
    } catch (err) {
      console.debug(`BackgroundManager event: title="${title}", message="${message}"`);
    }
  }
};

type errorHandler = (err: Error) => void;

export class BackgroundManager {
  private _minUpdate = moment.duration(5, 'minutes');

  protected lastRegion = null as IBeaconRegion | null;
  protected lastUpdateTime = null as Moment | null;

  private _updateCallbacks = [] as Array<Function | null>;
  private _isActive = true;
  private _enabled = false;
  private _scanRegionCount = 4;
  private _scanUUIDs = [] as string[];
  private _seenUUIDs = new Map<string, Moment>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _callbackInterval = undefined as any;
  private _lastCallbackTime = moment(0);

  private _errorListeners = [] as Array<errorHandler>;

  public get minUpdate() {
    return this._minUpdate;
  }
  public set minUpdate(duration: Duration) {
    this._minUpdate = duration;
    this.initializeCallback();
  }

  public get maxUpdate() {
    return moment.duration(this.minUpdate.asMilliseconds() * 6, 'milliseconds');
  }

  public constructor() {
    // set default update interval
    this._minUpdate = moment.duration(5, 'minutes');
  }

  private initializeCallback() {
    if (this._callbackInterval) {
      clearInterval(this._callbackInterval);
    }
    this._callbackInterval = setInterval(() => {
      console.info(`BackgroundManager: calling ${this._updateCallbacks.length} callbacks (interval: ${this.minUpdate.asMinutes()} minutes)`);
      this.triggerCallbacks();
    }, this.minUpdate.asMilliseconds());
  }

  public async init() {
    // @ts-ignore
    if (window.BackgroundFetch) {
      // @ts-ignore
      const BackgroundFetch = window.BackgroundFetch;

      const fetchCallback = async () => {
        try {
          console.info('BackgroundManager: initiating background fetch.');
          this.triggerCallbacks();
          BackgroundFetch.finish();
        } catch (err) {
          BackgroundFetch.finish();
          console.error('BackgroundManager: background fetch failed: ' + JSON.stringify(err));
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fetchErrorCallback = (err: any) => {
        console.error('BackgroundManager: background fetch failed: ' + JSON.stringify(err));
      };

      console.info('BackgroundManager: configuring background fetch.');
      BackgroundFetch.configure(fetchCallback, fetchErrorCallback, {
        minimumFetchInterval: 15, // minutes
      });
    }

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
    IBeacon.addListener('enteredRegion', (result: { region: IBeaconRegion }) => {
      return this.enteredRegion(result.region);
    });
    await IBeacon.requestAlwaysAuthorization();
  }

  public get isActive() {
    return this._isActive;
  }

  public async setActive() {
    console.info('BackgroundManager.setActive()');
    this._isActive = true;
    if (!this.enabled) {
      await this.disable();
    }
  }

  public async setInactive() {
    console.info('BackgroundManager.setActive()');
    this._isActive = false;
    if (!this.enabled) {
      await this.disable();
    }
  }

  public get enabled() {
    return this._enabled;
  }

  public async enable() {
    this._enabled = true;
    await this.startScanning();
    return this._enabled;
  }

  public async disable() {
    this._enabled = false;
    await this.stopScanning();
    return this._enabled;
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

  protected async startScanning() {
    console.debug('BackgroundManager.startScanning()');
    if (!this.enabled) {
      console.warn('BackgroundManager.startScanning() called, but we are disabled; skipping.');
      return;
    }

    return this.enableScan();
  }

  protected async enableScan() {
    console.info(`BackgroundManager.enableScan(): scanning ${this.scanUUIDs.length} regions.`);
    sendNotification('Starting Scanning', `Starting scanning ${this.scanUUIDs.length} regions.`);
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

    if (regions.length === 0) {
      return;
    }

    console.info(`BackgroundManager.disableScan(): stopping scanning ${regions.length} regions.`);
    sendNotification('Stopping Scanning', `Stopping scanning ${regions.length} regions.`);

    const ret = regions.map((region: IBeaconRegion) => {
      return IBeacon.stopMonitoringForRegion(region);
    });
    return Promise.all(ret);
  }

  protected async resetScanning() {
    await this.stopScanning();
    await this.startScanning();
  }

  protected async ping() {
    console.warn('BackgroundManager.ping()');
    const uuids = this.getPingableUUIDs();
    if (uuids.length === 0) {
      console.warn('BackgroundManager.ping(): no pingable UUIDs; skipping.');
      return;
    }

    const isAdvertising = await IBeacon.isAdvertising();
    if (isAdvertising) {
      console.warn('BackgroundManager.ping(): already advertising; stopping and restarting.');
      await IBeacon.stopAdvertising();
    }

    const index = randomInteger(0, uuids.length);
    const uuid = uuids[index];
    console.warn(`BackgroundManager.ping(): pinging ${uuid}`);

    sendNotification('Pinging', `Pinging ${uuid}.`);

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
    // trim seen to things within the maxUpdate time
    const cutoff = moment().subtract(this.maxUpdate);
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
    console.debug(`BackgroundManager.doUpdate(): ${region.uuid}`);
    const now = moment();
    this.lastUpdateTime = now;
    const index = this.getIndex(region.uuid);
    if (index > this._scanRegionCount) {
      console.warn(`Received ping outside of expected scan range: ${region.uuid}`);
    }
    // simple LRU, `add` always appends, first in the list is oldest
    this._seenUUIDs.delete(region.uuid);
    this._seenUUIDs.set(region.uuid, now);
    this.triggerCallbacks();
  }

  protected triggerCallbacks() {
    const now = moment();
    const threshold = this._lastCallbackTime.add(this.minUpdate);
    if (now.isBefore(threshold)) {
      console.warn(`BackgroundManager.triggerCallbacks: too soon (${now.format()} < ${threshold.format()}); skipping.`);
      return;
    }

    sendNotification('Triggering Callbacks', `Triggering ${this._updateCallbacks.length} callbacks.`);

    for (const callback of this._updateCallbacks) {
      if (callback !== null) {
        callback();
      }
    }

    if (this.isActive) {
      this.ping();
    }
  }

  protected slowDown() {
    const oldCount = this._scanRegionCount;
    this._scanRegionCount = Math.max(1, this._scanRegionCount - 1);
    console.debug(`BackgroundManager.slowDown(): ${oldCount} => ${this._scanRegionCount}`);
  }

  protected speedUp() {
    const oldCount = this._scanRegionCount;
    this._scanRegionCount++;
    console.debug(`BackgroundManager.speedUp(): ${oldCount} => ${this._scanRegionCount}`);
  }

  public onUpdate(callback: () => void) {
    this._updateCallbacks.push(callback);
    return this._updateCallbacks.length - 1;
  }

  public cancelUpdate(index: number) {
    this._updateCallbacks[index] = null;
  }

  protected enteredRegion(region: IBeaconRegion) {
    console.debug(`BackgroundManager.enteredRegion(): ${region.uuid}`);
    if (this.lastUpdateTime === null) {
      this.doUpdate(region);
      return;
    }

    const now = moment();
    const minTime = this.lastUpdateTime.clone().add(this.minUpdate);
    const maxTime = this.lastUpdateTime.clone().add(this.maxUpdate);

    console.debug(`BackgroundManager.enteredRegion(): now=${now.format()}`);
    console.debug(`BackgroundManager.enteredRegion(): minTime=${minTime.format()}`);
    console.debug(`BackgroundManager.enteredRegion(): maxTime=${maxTime.format()}`);

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

if (window.angular) {
  window.angular.module('cruisemonkey.util.BackgroundManager', [
    'ng',
    'cruisemonkey.Settings',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]).factory('BackgroundManager', /* @ngInject */ ($ionicPlatform: any, $log: ILogService, $q: IQService, $rootScope: IRootScopeService, $timeout: ITimeoutService, SettingsService: any) => {
    $log.info('AngularBackgroundManager: initializing.');
    const manager = new BackgroundManager();
    $ionicPlatform.ready(() => {
      $log.debug('AngularBackgroundManager: Ionic is ready.');
      manager.init();
    });

    App.addListener('appStateChange', (state: AppState) => {
      console.debug(`BackgroundManager.appStateChange: isActive=${state.isActive}`);
      sendNotification(`App state changed: ${state.isActive}`, `App state changed: ${manager.isActive} => ${state.isActive}`);
      state.isActive ? manager.setActive() : manager.setInactive();
    });

    let enabled = true;
    SettingsService.getEnableAdvancedSync().then((enableAdvancedSync: boolean) => {
      enabled = enableAdvancedSync;
    });

    const enable = () => {
      if ($rootScope.isSectionEnabled('advanced_sync')) {
        $log.debug('AngularBackgroundManager.enable()');
        return $q.when(manager.enable() as IPromise<boolean>);
      } else {
        $log.warn('AngularBackgroundManager.enable(): advanced_sync has been disabled by the Twit-Arr admins.');
        return $q.reject();
      }
    };

    const disable = () => {
      $log.debug('AngularBackgroundManager.disable()');
      return $q.when(manager.disable() as IPromise<boolean>);
    };

    const setInterval = (interval: Duration) => {
      manager.minUpdate = interval;
      return interval;
    };

    const onUpdate = (callback: () => void) => {
      return $q.when(manager.onUpdate(() => {
        $rootScope.$evalAsync(callback);
      }));
    };

    const cancelUpdate = (id: number) => {
      manager.cancelUpdate(id);
    };

    let initialized = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $rootScope.$watch('sections', (newValue: any) => {
      if (newValue['cruise_monkey_advanced_sync'] === undefined) {
        return;
      }
      $timeout(() => {
        if (!initialized) {
          SettingsService.getEnableAdvancedSync().then((advancedSyncEnabled: boolean) => {
            return SettingsService.getBackgroundInterval().then((backgroundInterval: number) => {
              setInterval(moment.duration(backgroundInterval, 'seconds'));
              if (advancedSyncEnabled) {
                return enable();
              } else {
                return disable();
              }
            });
          }).finally(() => {
            initialized = true;
          });
        }

        if (!$rootScope.isSectionEnabled('advanced_sync')) {
          disable();
        }
      }, 10);
    });

  $rootScope.$on('cruisemonkey.user.settings-changed', async (ev, settings) => {
      console.debug('AngularBackgroundManager.settings-changed:', angular.toJson(settings));

      let shouldRestart = false;
      const actions = [] as Function[];

      if (settings.old) {
        if (settings.new.backgroundInterval !== settings.old.backgroundInterval) {
          $log.debug(`AngularBackgroundManager: background interval refresh has changed from ${settings.old.backgroundInterval} seconds to ${settings.new.backgroundInterval} seconds.`);
          shouldRestart = true;
          actions.push(() => {
            setInterval(moment.duration(settings.new.backgroundInterval, 'seconds'));
          });
        }
        if (settings.new.enableAdvancedSync !== settings.old.enableAdvancedSync) {
          $log.debug(`AngularBackgroundManager: advanced sync has changed from ${settings.old.enableAdvancedSync} to ${settings.new.enableAdvancedSync}.`);
          shouldRestart = true;
          enabled = settings.new.enableAdvancedSync;
        }
      }

      if (shouldRestart) {
        return disable().then(() => {
          for (const action of actions) {
            action();
          }
          if (enabled) {
            return enable().then(() => {
              return enabled;
            });
          } else {
            $log.warn(`AngularBackgroundManager: restart requested, but advanced sync is disabled.`);
          }
          return enabled;
        }).catch((err) => {
          $log.error('Failed to restart AngularBackgroundManager: ' + angular.toJson(err));
          return $q.reject(err);
        });
      }
    });

    return {
      isEnabled: () => {
        return manager.enabled;
      },
      isActive: () => {
        return manager.isActive;
      },
      enable: enable,
      disable: disable,
      setInterval: setInterval,
      onUpdate: onUpdate,
      cancelUpdate: cancelUpdate,
    };
  });
} else {
  console.warn('Angular not available: skipping declaration of cruisemonkey.util.BackgroundManager.');
}