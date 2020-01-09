import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

import deepEqual from 'deep-equal';

import PouchDB from 'pouchdb';
window.PouchDB = PouchDB;

import 'angular-pouchdb';

angular.module('cruisemonkey.DB', [
  'pouchdb'
]).factory('kv', function($q, $log, pouchDB) {
  const db = pouchDB('cruisemonkey', {
    'auto_compaction': true,
  });

  /*
  const _keys = () => {
    return $q.when(Storage.keys());
  };
  */

  const _getValue = (doc) => {
    if (doc && Object.prototype.hasOwnProperty.call(doc, 'value')) {
      try {
        return doc.value;
      } catch (err) {
        $log.warn('Failed to parse as JSON:', doc.value);
        throw err;
      }
    }
    return doc.value;
  };

  const _get = (key) => {
    return db.get(key).then((doc) => {
      $log.debug('_get:', doc);
      return _getValue(doc);
    }).catch((err) => {
      if (err.status === 404) {
        return undefined;
      }
      $log.warn('Failed to get ' + key, err);
      return $q.reject(err);
    });
  };

  const _getAll = (keys) => {
    return db.allDocs({
      include_docs:true,
    }).then((docs) => {
      $log.debug('_getAll:', keys, docs);
      const ret = docs.rows.filter((row) => {
        return keys.indexOf(row.doc._id) !== -1;
      }).map((row) => {
        return row.doc;
      });
      $log.debug('_getAll returning:', ret);
      return ret;
    });
//    return $q.all(keys.map((key) => _get(key)));
  };

  const _set = function(key, value) {
    /*
    return $q.when(Storage.set({
      key: key,
      value: JSON.stringify(value),
    }));
    */
    const newDoc = {
      _id: key,
      value: value,
    };

    return db.get(key).then((existing) => {
      newDoc._rev = existing._rev;

      $log.debug('_set (existing):', key, newDoc, existing);

      if (!deepEqual(newDoc, existing)) {
        return db.put({
          _id: key,
          _rev: existing._rev,
          value: value,
        });
      }
      $log.warn('_set: documents are identical:', existing);
    }).catch(() => {
      $log.debug('_set (new):', key, value);
      return db.put({
        _id: key,
        value: value,
      });
    });
  };

  const _remove = function(key) {
    return db.get(key).then((existing) => {
      $log.debug('_remove:', key, existing);
      return db.remove(existing);
    }).catch(() => {
      return undefined;
    });
  };

  const _wipe = function() {
    return db.allDocs().then((result) => {
      return db.bulkDocs(result.rows.map((row) => {
        row._deleted = true;
      }));
    })
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
    // keys: _keys,
    remove: _remove,
    wipe: _wipe
  };
});
