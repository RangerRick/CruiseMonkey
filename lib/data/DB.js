import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

angular.module('cruisemonkey.DB', [
]).factory('kv', function($q, $log) {
  /*
  const _db = $q.when(CapacitorDataStorageSqlite.openStore({
    database: 'cruisemonkey',
    table: 'kv',
  })).then((ret) => {
    if (!ret.result) {
      return $q.reject('Failed to open CruiseMonkey database.');
    }
    return CapacitorDataStorageSqlite;
  });
  */

  const _getValue = (doc) => {
    if (doc && Object.prototype.hasOwnProperty.call(doc, 'value')) {
      try {
        return angular.fromJson(doc.value);
      } catch (err) {
        $log.warn('Failed to parse as JSON:', doc.value);
        throw err;
      }
    }
    $log.warn('Unable to return value from:', doc);
    return undefined;
  };

  const _keys = () => {
    return $q.when(Storage.keys());
  };

  const _get = (key) => {
    return $q.when(Storage.get({key:key})).then((doc) => {
      $log.debug('_get:', doc);
      return _getValue(doc);
    }).catch((err) => {
      $log.warn('Failed to get ' + key, err);
      return $q.reject(err);
    });
  };

  const _getAll = (keys) => {
    const all = keys.map((key) => {
      return _get(key);
    });
    return $q.all(all).then((ret) => {
      $log.debug('_getAll returning:', ret);
      return ret;
    });
  };

  const _set = function(key, value) {
    const entry = {
      key: key,
      value: angular.toJson(value),
    };
    return $q.when(Storage.set(entry)).then(() => {
      return entry;
    });
  };

  const _remove = function(key) {
    return $q.when(Storage.remove({key}));
  };

  const _wipe = function() {
    return $q.when(Storage.clear());
  };

  return {
    get: (k) => {
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
