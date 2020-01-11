import { Plugins } from '@capacitor/core';
import * as CapacitorSQLPlugin from 'capacitor-data-storage-sqlite';
const { CapacitorDataStorageSqlite, Device } = Plugins;

import deepEqual from 'deep-equal';

angular.module('cruisemonkey.DB', [
]).factory('kv', function($q, $log) {
  const _db = $q.when(CapacitorDataStorageSqlite.openStore({
    database: 'cruisemonkey',
    table: 'kv',
  })).then((ret) => {
    if (!ret.result) {
      return $q.reject('Failed to open CruiseMonkey database.');
    }
    return CapacitorDataStorageSqlite;
  });

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
    return _db.then((db) => {
      return $q.when(db.keys()).then((ret) => {
        return ret.keys;
      });
    })
  };

  const _get = (key) => {
    return _db.then((db) => {
      $q.when(db.get({ key:key })).then((doc) => {
        $log.debug('_get:', doc);
        return _getValue(doc);
      });
    }).catch((err) => {
      $log.warn('Failed to get ' + key, err);
      return $q.reject(err);
    });
  };

  const _getAll = (keys) => {
    return _db.then((db) => {
      return $q.when(db.keysvalues()).then((ret) => {
        const entries = ret.keysvalues;
        const all = keys.map((key) => {
          return _getValue(entries[key]);
        });
        $log.debug('_getAll returning:', all);
        return all;
      });
    });
  };

  const _set = function(key, value) {
    const entry = {
      key: key,
      value: angular.toJson(value),
    };
    return _db.then((db) => {
      return $q.when(db.set(entry)).then(() => {
        return value;
      });
    });
  };

  const _remove = function(key) {
    return _db.then((db) => {
      return $q.when(db.remove(key)).then((ret) => {
        return ret.result;
      });
    })
  };

  const _wipe = function() {
    return _db.then((db) => {
      return $q.when(db.clear()).then((ret) => {
        return ret.result;
      });
    });
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
