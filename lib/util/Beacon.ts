import 'capacitor-ibeacon';
import { Plugins } from '@capacitor/core';
const { IBeacon } = Plugins;

const ln = Plugins.LocalNotifications;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const angular: any;

const uuids = '0123456789abcdef'.split('').map((digit) => {
  return 'DEADBEEF-0000-0000-0000-00000000000' + digit;
}).concat('DEDC76CE-0C1A-45B5-80A4-75F96C839FC5', '0A339C06-A224-4BEC-BA1B-81B1146CEAA5', '2B56A867-B5A8-41F0-8692-0CE6142FEBF2');

angular.module('cruisemonkey.util.Beacon', [
  'ng',
  'ionic',
  'cruisemonkey.Notifications',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
]).factory('Beacon', ($interval: any, $ionicPlatform: any, $log: any, $q: any, $rootScope: any, $timeout: any /*, LocalNotifications */) => {
  $log.info('Initializing Beacon tracker.');

//  const Beacon = getBeaconImpl();
  // Beacon.enableDebug();

  let notificationCount = 1;

  const sendNotification = (title: string, message: string) => {
    /*
    LocalNotifications.send({
      id: notificationCount++,
      title: title,
      message: message,
    });
    */

    ln.schedule({
      notifications: [
        {
          id: notificationCount++,
          title: title,
          body: message,
        }
      ]
    });
  };

  const authorizationStatusChanged = (result) => {
    $log.debug(`Beacon: authorizationStatusChanged => ${result.state}`);
    sendNotification('Change Authorization Status', `Authorization status changed to ${result.state}`);
  };

  const ranged = (result) => {
    $log.debug(`Beacon: ranged: ${result.regions.length} beacons.`);
    sendNotification(
      `Ranged ${result.regions.length} regions`,
      'Ranged regions:\n' + result.regions.map((region) => `* ${region.uuid}`).join('\n'),
    );
  };

  const didStartMonitoringForRegion = (result) => {
    $log.debug(`Beacon: didStartMonitoringForRegion: ${result.region.uuid} (${result.region.identifier})`);
    /*
    */
  };

  const didEnterRegion = (result) => {
    $log.debug(`Beacon: didEnterRegion: ${result.region.uuid} (${result.region.identifier})`);
    sendNotification(
      `Entered region ${result.region.identifier}`,
      `Entered region ${result.region.uuid} (${result.region.identifier})`,
    );
  };

  const didExitRegion = (result) => {
    $log.debug(`Beacon: didExitRegion: ${result.region.uuid} (${result.region.identifier})`);
    sendNotification(
      `Left region ${result.region.identifier}`,
      `Left region ${result.region.uuid} (${result.region.identifier})`,
    );
  };

  const onError = (err) => {
    $log.error(`Beacon: ${err.type} error: ${err.message}`);
  };

  const deferred = $q.defer();
  const init = deferred.promise;

  const wrap = (cb: Function) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res: any) => {
      $rootScope.$evalAsync(() => {
        cb(res);
      });
    };
  };

  $ionicPlatform.ready(() => {
    return $q.all(
      $q.when(IBeacon.addListener('error', wrap(onError))),
      $q.when(IBeacon.addListener('authorizationStatusChanged', wrap(authorizationStatusChanged))),
      $q.when(IBeacon.addListener('ranged', wrap(ranged))),
      $q.when(IBeacon.addListener('startedMonitoring', wrap(didStartMonitoringForRegion))),
      $q.when(IBeacon.addListener('enteredRegion', wrap(didEnterRegion))),
      $q.when(IBeacon.addListener('leftRegion', wrap(didExitRegion))),
    );
  }).then(() => {
    return $q.all(
      $q.when(IBeacon.requestAlwaysAuthorization()),
    );
  }).then(() => {
    deferred.resolve();
  }).catch((err: Error) => {
    deferred.reject(err);
  });

//  const init = $q.when(Beacon.init());

  const startMonitoring = () => {
    return init.then(() => {
      return $q.all(uuids.map((uuid, index) => {
        return $q.when(IBeacon.startMonitoringForRegion({
          uuid: uuid,
          identifier: 'JoCo' + index,
        }));
      }));
    });
  };

  const stopMonitoring = () => {
    return init.then(() => {
      return $q.all(uuids.map((uuid, index) => {
        return $q.when(IBeacon.stopMonitoringForRegion({
          uuid: uuid,
          identifier: 'JoCo' + index,
        }));
      }));
    });
  };

  const ping = () => {
    return init.then(() => {
      const index = Math.floor(Math.random()*uuids.length);
      const uuid = uuids[index];

      const advertisedPeripheralData = {
        uuid: uuid,
        identifier: 'JoCo' + index,
      };

      $timeout(() => {
        $log.debug('Beacon.ping: stopping.');
        IBeacon.stopAdvertising();
      }, 10 * 1000);

      $q.when(IBeacon.isAdvertising()).then((isAdvertising) => {
        if (isAdvertising) {
          $log.debug('Beacon.ping: starting:', angular.fromJson(advertisedPeripheralData));
          sendNotification(`Ping! ${advertisedPeripheralData.identifier}`, `Pinging: ${advertisedPeripheralData.uuid} (${advertisedPeripheralData.identifier})`);
          return $q.when(IBeacon.startAdvertising(advertisedPeripheralData));
        } else {
          $log.debug('Beacon.ping: skipping:', angular.fromJson(advertisedPeripheralData));
        }
      });
    });
  };

  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const randomPing = () => {
    // 0-30 seconds
    const time = getRandomInt(15, 40);
    $log.debug(`Beacon.ping: next ping in ${time} seconds.`);
    $timeout(() => {
      ping();
      randomPing();
    }, time * 1000);
  };

  randomPing();

  startMonitoring();


  return {
    start: startMonitoring,
    stop: stopMonitoring,
  };
});