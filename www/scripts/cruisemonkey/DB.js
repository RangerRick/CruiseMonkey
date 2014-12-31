(function() {
	'use strict';

	/*global PouchDB: true*/
	/*global CMEvent: true*/
	/*global CMFavorite: true*/

	angular.module('cruisemonkey.DB', [
		'pouchdb',
		'cruisemonkey.Config'
	])
	.service('dbutils', ['$q', '$rootScope', function($q, $rootScope) {
		var slice = Array.prototype.slice;
		return {
			qify: function(fn) {
				return function() {
					var args, deferred;
					deferred = $q.defer();
					args = arguments != null ? slice.call(arguments) : [];
					fn.apply(this, args).then(function(res) {
						$rootScope.$evalAsync(function() {
							return deferred.resolve(res);
						});
						return $rootScope.$apply();
					})["catch"](function(err) {
						$rootScope.$evalAsync(function() {
							return deferred.reject(err);
						});
						return $rootScope.$apply();
					});
					return deferred.promise;
				};
			},
			getPersist: function(prefix, fromUrl, toDb) {
				toDb.info().then(function(info) {
					console.debug('getPersist(' + prefix + ', ' + fromUrl + ', ' + info.db_name + ')');
				});
				var listeners = [
					{ method: 'on', event: 'uptodate', listener: function () {
						$rootScope.$evalAsync(function() {
							$rootScope.$broadcast(prefix + '.sync.uptodate');
						});
					}},
					{ method: 'on', event: 'connect', listener: function () {
						$rootScope.$evalAsync(function() {
							$rootScope.$broadcast(prefix + '.sync.connect');
						});
					}},
					{ method: 'on', event: 'disconnect', listener: function () {
						$rootScope.$evalAsync(function() {
							$rootScope.$broadcast(prefix + '.sync.disconnect');
						});
					}}
				];
				toDb.deltaInit();
				return toDb.persist({
					url: fromUrl,
					manual: true,
					/* to: { listeners: listeners }, */
					from: { listeners: listeners },
					changes: {
						opts: { live: true }
					}
				});
			}
		};
	}])
	.factory('eventsdb', ['$q', '$rootScope', '$timeout', 'dbutils', 'config.database.replicate', 'SettingsService', function($q, $rootScope, $timeout, dbutils, replicate, settings) {
		var pouchOptions = {};
		if (settings.getDatabaseAdapter()) {
			console.debug('eventsdb: using alternative database adapter: ' + settings.getDatabaseAdapter());
			pouchOptions.adapter = settings.getDatabaseAdapter();
		}

		console.info('Creating local events database: ' + settings.getLocalEventsDatabaseUrl());
		var db = new PouchDB(settings.getLocalEventsDatabaseUrl(), pouchOptions);

		var __db_all = dbutils.qify(db.all.bind(db));

		var started = false;
		var persist;

		var startSync = function() {
			var remoteDb = settings.getRemoteEventsDatabaseUrl();
			$rootScope.$broadcast('eventsdb.sync.starting', remoteDb);

			if (persist) {
				console.debug('eventsdb: Existing persistence configured. Resetting.');
				persist.stop();
				persist.removeAllListeners();
			}
			persist = dbutils.getPersist('eventsdb', remoteDb, db);

			persist.start().then(function() {
				started = true;
			});
		};

		var stopSync = function() {
			$rootScope.$broadcast('eventsdb.sync.stopping');
			console.info('eventsdb: database sync stopping');
			if (persist) {
				persist.stop();
				persist.removeAllListeners();
				console.debug('eventsdb: stopped');
				started = false;
			} else {
				console.debug('eventsdb: already stopped');
				started = false;
			}
		};

		$rootScope.$on('state.online', function(evt, from, data) {
			if (replicate) {
				startSync();
			} else {
				console.info('eventsdb: replication is disabled');
			}
		});

		$rootScope.$on('state.offline', function(evt, from, data) {
			if (replicate) {
				stopSync();
			}
		});

		return {
			isStarted: function() { return started; },
			count: function() {
				var deferred = $q.defer();
				__db_all().then(function(docs) {
					var count = 0;
					angular.forEach(docs, function() {
						count++;
					});
					deferred.resolve(count);
				}, function(err) {
					deferred.reject(err);
				});
				return deferred.promise;
			},
			all: __db_all
		};
	}])
	.factory('favoritesdb', ['$q', '$rootScope', '$timeout', 'dbutils', 'config.database.replicate', 'SettingsService', function($q, $rootScope, $timeout, dbutils, replicate, settings) {
		var pouchOptions = {};
		if (settings.getDatabaseAdapter()) {
			console.debug('favoritesdb: using alternative database adapter: ' + settings.getDatabaseAdapter());
			pouchOptions.adapter = settings.getDatabaseAdapter();
		}

		console.info('Creating local favorites database: ' + settings.getLocalFavoritesDatabaseUrl());
		var db = new PouchDB(settings.getLocalFavoritesDatabaseUrl(), pouchOptions);

		var __db_all = dbutils.qify(db.all.bind(db));

		var started = false;
		var persist;

		var startSync = function() {
			var remoteDb = settings.getRemoteFavoritesDatabaseUrl();
			$rootScope.$broadcast('favoritesdb.sync.starting', remoteDb);

			if (persist) {
				console.debug('favoritesdb: Existing persistence configured. Resetting.');
				persist.stop();
				persist.removeAllListeners();
			}
			persist = dbutils.getPersist('favoritesdb', remoteDb, db);

			persist.start().then(function() {
				started = true;
			});
		};

		var stopSync = function() {
			$rootScope.$broadcast('favoritesdb.sync.stopping');
			console.info('favoritesdb: database sync stopping');
			if (persist) {
				persist.stop();
				persist.removeAllListeners();
				console.debug('favoritesdb: stopped');
				started = false;
			} else {
				console.debug('favoritesdb: already stopped');
				started = false;
			}
		};

		$rootScope.$on('state.loggedin', function(evt, from, to, data) {
			console.debug('favoritesdb: received loggedin event');
			if (replicate) {
				startSync();
			}
		});
		$rootScope.$on('state.loggedout', function(evt, from, to, data) {
			console.debug('favoritesdb: received loggedout event');
			if (replicate) {
				stopSync();
			}
		});

		return {
			isStarted: function() { return started; },
			count: function() {
				var deferred = $q.defer();
				__db_all().then(function(docs) {
					var count = 0;
					angular.forEach(docs, function() {
						count++;
					});
					deferred.resolve(count);
				}, function(err) {
					deferred.reject(err);
				});
				return deferred.promise;
			},
			all: __db_all
		};
	}]);
}());
