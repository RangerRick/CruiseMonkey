/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */

import moment, { Moment, Duration } from 'moment-timezone';
import { IQService, IPromise, IRootScopeService, ILogService, ITimeoutService } from 'angular';

declare type UUID = string;

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IBeaconRegion {
  identifier: string;
  uuid: UUID;
  major: number;
  minor: number;
}

const debugMode = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const angular: any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const ionic: any;

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sendNotification = async (title: string, message: string) => {
  console.warn('BackgroundManager event: ' + message);
  if (debugMode) {
    /*
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
      console.debug(`LocalNotification: title="${title}", message="${message}"`);
    }
    */
  }
};

type errorHandler = (err: Error) => void;

const inPlugin = async (callback: Function) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (window && window.cordova && window.cordova.plugins && window.cordova.plugins.locationManager) {
      try {
        // @ts-ignore
        const result = callback(window.cordova.plugins.locationManager);
        // console.debug('returning: ' + JSON.stringify(result));
        return resolve(result);
      } catch (err) {
        return reject(err);
      }
    }

    console.warn('cordova.plugins.locationManager NOT found');
    return reject();
  });
};

export class BackgroundManager {
  public minUpdate = moment.duration(5, 'minutes');

  protected lastRegion = null as IBeaconRegion | null;
  protected lastUpdateTime = null as Moment | null;

  private _updateCallbacks = [] as Array<Function | null>;
  private _isActive = true;
  private _enabled = false;
  private _scanRegionCount = 4;
  private _scanUUIDs = [] as string[];
  private _seenUUIDs = new Map<string, Moment>();

  private _pingInterval = null as number | null;
  private _callbackInterval = null as number | null;

  private _errorListeners = [] as Array<errorHandler>;

  public get maxUpdate() {
    return moment.duration(this.minUpdate.asMilliseconds() * 6, 'milliseconds');
  }

  public async init() {
    return inPlugin(async (IBeacon: any) => {
      console.info('BackgroundManager: initializing.');
      const delegate = new IBeacon.Delegate();

      delegate.monitoringDidFailForRegionWithError = (result: { region: IBeaconRegion }, err?: Error) => {
        for (const handler of this._errorListeners) {
          try {
            handler(err || new Error('Unknown error.'));
          } catch (subErr) {
            console.error(`BackgroundManager.error(): failed while running error handler callback: ${subErr.message}`);
          }
        }
      };
      delegate.didEnterRegion = (result: { region: IBeaconRegion }) => {
        return this.enteredRegion(result.region);
      };

      await IBeacon.setDelegate(delegate);

      console.debug('BackgroundManager.init: requesting authorization');
      await IBeacon.requestAlwaysAuthorization();
    });
  }

  public get isActive() {
    return this._isActive;
  }

  public async setActive() {
    console.info('BackgroundManager.setActive()');
    this._isActive = true;
    if (this.enabled) {
      await this.onActive();
    } else {
      await this.disable();
    }

    this._callbackInterval = setInterval(() => {
      console.info(`BackgroundManager: calling ${this._updateCallbacks.length} callbacks (interval: ${this.minUpdate.asMinutes()} minutes)`);
      this.triggerCallbacks();
    }, this.minUpdate.asMilliseconds());
  }

  public async setInactive() {
    console.info('BackgroundManager.setActive()');
    this._isActive = false;
    if (this.enabled) {
      await this.onInactive();
    } else {
      await this.disable();
    }
    if (this._callbackInterval != null) {
      clearInterval(this._callbackInterval);
      this._callbackInterval = null;
    }
  }

  public get enabled() {
    return this._enabled;
  }

  public async enable() {
    this._enabled = true;
    if (this.isActive) {
      await this.onActive();
    } else {
      await this.onInactive();
    }
    return this._enabled;
  }

  public async disable() {
    this._enabled = false;
    await this.stopScanning();
    await this.stopPing();
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

  protected async onActive() {
    console.info('BackgroundManager.onActive()');
    await this.stopScanning();
    await this.startPing();
  }

  protected async onInactive() {
    console.info('BackgroundManager.onInactive()');
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
    console.info(`BackgroundManager.enableScan(): scanning ${this.scanUUIDs.length} regions.`);
    sendNotification('Starting Scanning', `Starting scanning ${this.scanUUIDs.length} regions.`);
    const ret = this.scanUUIDs.map((uuid, index) => {
      inPlugin(async (IBeacon: any) => {
        const beaconRegion = new IBeacon.BeaconRegion(`JoCo-${index}`, uuid);
        await IBeacon.startMonitoringForRegion(beaconRegion);
      })
    });
    return Promise.all(ret);
  }

  protected async stopScanning() {
    console.debug('BackgroundManager.stopScanning()');
    return this.disableScan();
  }

  protected async disableScan() {
    return inPlugin(async (IBeacon: any) => {
      const { regions } = await IBeacon.getMonitoredRegions();
      console.info(`BackgroundManager.disableScan(): stopping scanning ${regions.length} regions.`);
      sendNotification('Stopping Scanning', `Stopping scanning ${regions.length} regions.`);
  
      const ret = regions.map((region: IBeaconRegion) => {
        return IBeacon.stopMonitoringForRegion(region);
      });
      return Promise.all(ret);
    });
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

    await this.ping();
    this._pingInterval = setInterval(() => {
      this.ping();
    }, this.minUpdate.asMilliseconds());
  }

  protected async stopPing() {
    console.info('BackgroundManager.stopPing()');
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

    return inPlugin(async (IBeacon: any) => {
      const isAdvertising = await IBeacon.isAdvertising();
      if (isAdvertising) {
        console.warn('BackgroundManager.ping(): already advertising; stopping and restarting.');
        await IBeacon.stopAdvertising();
      }
  
      const index = randomInteger(0, uuids.length);
      const uuid = uuids[index];
      console.warn(`BackgroundManager.ping(): pinging ${uuid}`);
  
      sendNotification('Pinging', `Pinging ${uuid}.`);

      const advertisedPeripheralData = new IBeacon.BeaconRegion(`JoCo-${index}`, uuid);
  
      setTimeout(async () => {
        console.debug('BackgroundManager.ping(): stopping advertisement.');
        await IBeacon.stopAdvertising();
      }, 10 * 1000);
  
      await IBeacon.startAdvertising(advertisedPeripheralData);
    });
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
    sendNotification('Triggering Callbacks', `Triggering ${this._updateCallbacks.length} callbacks.`);

    for (const callback of this._updateCallbacks) {
      if (callback !== null) {
        callback();
      }
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
  ]).factory('BackgroundManager', ($log: ILogService, $q: IQService, $rootScope: IRootScopeService, $timeout: ITimeoutService, $ionicPlatform: any, SettingsService: any) => {
    $log.info('AngularBackgroundManager: initializing.');
    const manager = new BackgroundManager();
    $ionicPlatform.ready(() => {
      $log.debug('AngularBackgroundManager: Ionic is ready.');
      manager.init();
    });

    /*
    App.addListener('appStateChange', (state: AppState) => {
      console.debug(`BackgroundManager.appStateChange: isActive=${state.isActive}`);
      sendNotification(`App state changed: ${state.isActive}`, `App state changed: ${this._isActive} => ${state.isActive}`);
      state.isActive ? this.setActive() : this.setInactive();
    });
    */

    $ionicPlatform.on('pause', () => {
      manager.setInactive();
    });
    $ionicPlatform.on('resign', () => {
      manager.setInactive();
    });
    $ionicPlatform.on('resume', () => {
      $timeout(() => {
        manager.setActive();
      });
    });

    let enabled = true;
    SettingsService.getEnableAdvancedSync().then((enableAdvancedSync: boolean) => {
      enabled = enableAdvancedSync;
    });

    const enable = () => {
      $log.debug('AngularBackgroundManager.enable()');
      return $q.when(manager.enable() as IPromise<boolean>);
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
        return disable().then(async () => {
          for (const action of actions) {
            await action();
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
          $log.error(`Failed to restart AngularBackgroundManager: ${err.message}`);
          return $q.reject(err.message);
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