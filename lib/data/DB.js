(function() {
	'use strict';

    require('lokijs');
    require('lokijs/src/loki-angular');
    require('angular-uuid4');

	angular.module('cruisemonkey.DB', [
		'ionic',
		'lokijs',
		'uuid4'
	]).factory('db', function($ionicPlatform, $log, $q, $rootScope, $window, Loki, uuid4) {
		$log.info('DB: Initializing.');

		var dbs = {};

		var options = {
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

        var jsonSyncAdapter = require('./lokijs-storage-adapter');
		if (jsonSyncAdapter) {
			options.adapter = new jsonSyncAdapter({
				prefix: 'cruisemonkey.',
				suffix: '.lokidb'
			});
		} else {
			$log.warn('jsonSyncAdapter is missing.');
		}

		var getDb = function(dbname) {
			if (!dbs[dbname]) {
				var deferred = $q.defer(), db;
				dbs[dbname] = deferred.promise;

				var opts = angular.extend({}, options);
				opts.autoloadCallback = function() {
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

		var getCollection = function(dbname, collectionName, options) {
            $log.debug('DB.getCollection(' + dbname + ', ' + collectionName + ', ' + angular.toJson(options) + ')');
			return getDb(dbname).then(function(db) {
                //$log.debug('DB.getCollection: got database: ' + angular.toJson(db));
				var collection = db.getCollection(collectionName);
				if (!collection) {
					collection = db.addCollection(collectionName, options);
				}
				return collection;
			});
		};

		return {
			get: getDb,
			collection: getCollection
		};
	}).factory('kv', function($log, $q, db) {
		var kvdb = db.collection('kv', 'kv', {transactional:true});

        var _keys = function() {
        	return kvdb.then(function(d) {
        		return d.where(function() { return true; }).map(function(obj) {
        			return obj.key;
        		});
        	});
        };

        var _get = function(key) {
        	return kvdb.then(function(d) {
                //$log.debug('kv._get: ' + key);
                var ret = d.findObject({key: key});
                if (ret && ret.hasOwnProperty('value')) {
                    return ret.value;
                } else {
                    return null;
                }
        	});
        };

        var _getAll = function(keys) {
        	var promises = [];
        	for (var i=0, len=keys.length; i < len; i++) {
        		promises.push(_get(keys[i]));
        	}
        	return $q.all(promises);
        };

        var _set = function(key, value) {
        	return kvdb.then(function(d) {
                $log.debug('kv._set: ' + key + '=' + angular.toJson(value));
                var existing = d.findObject({key: key});
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

        var _remove = function(key) {
        	return kvdb.then(function(d) {
                $log.debug('kv._delete: ' + key);
                var existing = d.findObject({key:key});
                d.removeWhere({key:key});
                if (existing) {
                	return existing.value;
                } else {
                	return null;
                }
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
        	remove: _remove
        };
	});

}());
