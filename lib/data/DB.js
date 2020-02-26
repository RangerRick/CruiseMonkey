import localforage from 'localforage';
import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

angular.module('cruisemonkey.DB', [
  'ionic',
  'cruisemonkey.Initializer',
]).factory('kv', function($log, $q) {
  const ready = $q.when(localforage.defineDriver(cordovaSQLiteDriver)).then(() => {
    return $q.when(localforage.setDriver([
      cordovaSQLiteDriver._driver,
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE,
    ]));
  }).then(() => {
    $log.info('$localForage driver: ' + localforage.driver());
    return localforage;
  }).catch((err) => {
    $log.error('localforage configuration failed: ' + angular.toJson(err));
    return $q.reject(err);
  });

  const _keys = function() {
    return ready.then((lf) => {
      return $q.when(lf.keys());
    });
  };

  const _get = function(key) {
    return ready.then((lf) => {
      return $q.when(lf.getItem(key)).catch(() => {
        return null;
      });
    /*
    }).then((value) => {
      $log.debug(`kv._get: ${key}=` + angular.toJson(value));
      return value;
    */
    });
  };

  const _getAll = function(keys) {
    const promises = keys.map(key => _get(key));
    return $q.all(promises);
  };

  const _set = function(key, value) {
    return ready.then((lf) => {
      return $q.when(lf.setItem(key, value));
    }).then(() => {
      // $log.debug(`kv._set: ${key}=` + angular.toJson(value));
      return value;
    });
  };

  const _remove = function(key) {
    return ready.then((lf) => {
      return $q.when(lf.removeItem(key));
    /*
    }).then((ret) => {
      $log.debug(`kv._remove: ${key}`);
      return ret;
    */
    });
  };

  const _wipe = function() {
    return ready.then((lf) => {
      return $q.when(lf.clear());
    });
  };

  return {
    get: function(k) {
      if (angular.isArray(k)) {
        return _getAll(k);
      } else {
        return _get(k);
      }
    },
    set: _set,
    keys: _keys,
    remove: _remove,
    wipe: _wipe
  };
});
