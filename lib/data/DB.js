require('lokijs');
require('lokijs/src/loki-angular');
require('angular-uuid4');

angular.module('cruisemonkey.DB', [
  'ionic',
  'lokijs',
  'uuid4',
      'cruisemonkey.Initializer'
]).factory('db', function($ionicPlatform, $log, $q, $rootScope, $window, Cordova, Loki /*, uuid4 */) {
  $log.info('DB: Initializing.');

  const dbs = {};

  const options = {
          persistenceMethod: 'localStorage',
    autosave: true,
    autosaveInterval: 5000,
    autoload: true,
    autoloadCallback: function(data) {
      $rootScope.$eval(function() {
        $log.debug('autoload callback data = ' + angular.toJson(data));
        //$log.info('DB.getDb: Database "' + dbname + '" autoloaded.');
        $rootScope.$broadcast('cruisemonkey.db.loaded');
        //deferred.resolve(db);
      });
    }
  };

      Cordova.inCordova().then(function inCordova(inCordova) {
          if (inCordova) {
              const fileAdapter = require('loki-cordova-fs-adapter');
              if (fileAdapter) {
                  options.adapter = new fileAdapter({
                      prefix: 'cruisemonkey.'
                  });
              } else {
                  $log.warn('loki-cordova-fs-adapter is missing');
              }
          }
      });

  const getDb = function(dbname) {
    if (!dbs[dbname]) {
              const deferred = $q.defer();
              // eslint-disable-next-line prefer-const
              let db;

              dbs[dbname] = deferred.promise;

      const opts = angular.extend({}, options);
      opts.autoloadCallback = () => {
        $rootScope.$eval(function() {
          $log.info('DB.getDb: Database "' + dbname + '" autoloaded.');
          $rootScope.$broadcast('cruisemonkey.db.loaded');
          deferred.resolve(db);
        });
      };

      db = new Loki(dbname, opts);
    }
    return dbs[dbname];
  };

  const getCollection = function(dbname, collectionName, options) {
          $log.debug('DB.getCollection(' + dbname + ', ' + collectionName + ', ' + angular.toJson(options) + ')');
    return getDb(dbname).then(function(db) {
              //$log.debug('DB.getCollection: got database: ' + angular.toJson(db));
      const collection = db.getCollection(collectionName);
      if (!collection) {
        return db.addCollection(collectionName, options);
      }
      return collection;
    });
  };

  return {
    get: getDb,
    collection: getCollection
  };
}).factory('kv', function($log, $q, db) {
  const kvdb = db.collection('kv', 'kv', {transactional:true});

      const _keys = function() {
          return kvdb.then(function(d) {
              return d.where(function() { return true; }).map(function(obj) {
                  return obj.key;
              });
          });
      };

      const _get = function(key) {
          return kvdb.then(function(d) {
              //$log.debug('kv._get: ' + key);
              const ret = d.findObject({key: key});
              if (ret && Object.prototype.hasOwnProperty.call(ret, 'value')) {
                  return ret.value;
              } else {
                  return null;
              }
          });
      };

      const _getAll = function(keys) {
          const promises = [];
          for (let i=0, len=keys.length; i < len; i++) {
              promises.push(_get(keys[i]));
          }
          return $q.all(promises);
      };

      const _set = function(key, value) {
          return kvdb.then(function(d) {
              $log.debug('kv._set: ' + key + '=' + angular.toJson(value));
              const existing = d.findObject({key: key});
              if (!existing) {
                  d.insert({key: key, value: value});
              } else {
                  if (existing.value !== value) {
                      existing.value = value;
                      d.update(existing);
                  }
              }
              return value;
          });
      };

      const _remove = function(key) {
          return kvdb.then(function(d) {
              $log.debug('kv._delete: ' + key);
              const existing = d.findObject({key:key});
              d.removeWhere({key:key});
              if (existing) {
                  return existing.value;
              } else {
                  return null;
              }
          });
      };

      const _wipe = function() {
          return kvdb.then(function(d) {
              d.removeDataOnly();
              return true;
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
