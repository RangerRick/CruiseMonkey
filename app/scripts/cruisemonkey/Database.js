(function() {
	'use strict';

	/*global PouchDB: true*/
	/*global Connection: true*/
	angular.module('cruisemonkey.Database', [
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Cordova',
		'cruisemonkey.Logging',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.User'
	])
	.factory('Database', ['$q', '$location', '$interval', '$timeout', '$rootScope', '$window', '$http', 'LoggingService', 'storage', 'config.database.replicate', 'SettingsService', 'CordovaService', 'NotificationService', 'UserService', function($q, $location, $interval, $timeout, $rootScope, $window, $http, log, storage, replicate, SettingsService, cor, notifications, UserService) {
		log.info('Initializing CruiseMonkey database: ' + SettingsService.getDatabaseName());

		storage.bind($rootScope, 'lastSequence', {
			'defaultValue': 0,
			'storeName': 'cm.lastSequence'
		});

		var getHost = function() {
			var host = SettingsService.getDatabaseHost();
			if (!host) {
				host = $location.host();
			}
			return 'http://' + SettingsService.getDatabaseHost() + ':5984/' + SettingsService.getDatabaseName();
		};

		var db = null,
			remoteDb = null,
			api = null,
			replicating = null,
			replicated = false,
			replicationTo = null,
			replicationFrom = null,
			ready = $q.defer();

		var initializeFromRemote = function() {
			var host = getHost();
			var deferred = $q.defer();

			$q.when(ready).then(function() {
				if (host && replicate) {
					log.debug('Database.initializeFromRemote(): Getting all docs.');
					remoteDb.allDocs({
						include_docs: true
					}, function(err, response) {
						if (err) {
							log.error('Database.initializeFromRemote(): ' + err);
							deferred.reject(err);
							return;
						}

						var newDocs = [];
						angular.forEach(response.rows, function(doc) {
							while (doc.doc) {
								doc = doc.doc;
							}
							newDocs.push(doc);
						});

						db.bulkDocs({
							docs: newDocs,
							new_edits: false
						}, function(err, response) {
							if (err) {
								log.error('Database.initializeFromRemote(): ' + err);
								deferred.reject(err);
								return;
							} else {
								log.info('Database.initializeFromRemote(): ' + response);
								deferred.resolve(response);
							}

						});
					});
				} else {
					$timeout(function() {
						log.warn('Database.initializeFromRemote(): replication disabled, resolving with empty object');
						deferred.resolve({});
					});
				}
			});

			return deferred.promise;
		};

		var initialize = function() {
			log.info('Database.initialize(): Initializing database.');

			var deferred = $q.defer();

			db = new PouchDB(SettingsService.getDatabaseName());
			remoteDb = new PouchDB(getHost());

			$timeout(function() {
				log.debug('Database.initialize(): Compacting database.');
				db.compact(function() {
					$rootScope.safeApply(function() {
						log.info('Database.initializeDatabase(): Compaction complete.');

						/*jshint camelcase: false */
						log.info('Database.initializeDatabase(): Watching for document changes.');
						db.changes({
							since: $rootScope.lastSequence,
							onChange: function(change) {
								$rootScope.safeApply(function() {
									$rootScope.lastSequence = change.seq;
									$timeout(function() {
										$rootScope.$broadcast('cm.database.documentchanged', change);
									});
								});
							},
							complete: function() {
								$rootScope.safeApply(function() {
									$timeout(function() {
										$rootScope.$broadcast('cm.database.changesprocessed');
									});
								});
							},
							continuous: true,
							conflicts: true,
							include_docs: true
						});

						ready.resolve(api);
						deferred.resolve(api);
					});
				});
			});

			return deferred.promise;
		};

		var replicationFilter = function(doc, req) {
			if (doc.type === 'event') {
				return true;
			}
			if (doc.type === 'favorite') {
				if (req.query.username && doc.username !== req.query.username) {
					return false;
				} else {
					return true;
				}
			}
			return true;
		};

		var startReplication = function() {
			$q.when(ready).then(function() {
				if (replicationFrom) {
					log.warn('Database.startReplication(): Replication from the remote DB has already been started!');
				} else {
					log.info('Database.startReplication(): Starting replication from the remote DB...');
					replicationFrom = db.replicate.from(remoteDb, {
						'continuous': true,
						/*
						'onChange': function(change) {
							console.log('db.replicate.from.onChange:',change);
						},
						*/
						'complete': function(err, details) {
							$rootScope.safeApply(function() {
								log.error('Stopped replication from remote DB: ' + err);
								log.error('Details: ' + details);
								if (db) {
									replicationFrom.cancel();
									replicationFrom = null;
								}
							});
						}
					});
				}

				if (replicationTo) {
					log.warn('Database.startReplication(): Replication to the remote DB has already been started!');
				} else {
					log.info('Database.startReplication(): Starting replication to the remote DB...');
					replicationTo = db.replicate.to(remoteDb, {
						'continuous': true,
						/*
						'onChange': function(change) {
							console.log('db.replicate.to.onChange:',change);
						},
						*/
						'complete': function(err, details) {
							$rootScope.safeApply(function() {
								log.error('Stopped replication to remote DB: ' + err);
								log.error('Details: ' + details);
								if (db) {
									replicationTo.cancel();
									replicationTo = null;
								}
							});
						}
					});
				}
			});

			return true;
		};

		var stopReplication = function() {
			if (replicationFrom) {
				log.info('Database.stopReplication(): Stopping replication from the remote DB...');
				replicationFrom.cancel();
			} else {
				log.warn('Database.stopReplication(): Replication from the remote DB has already been stopped!');
			}
			if (replicationTo) {
				log.info('Database.stopReplication(): Stopping replication to the remote DB...');
				replicationTo.cancel();
			} else {
				log.warn('Database.stopReplication(): Replication to the remote DB has already been stopped!');
			}
		};

		var handleConnectionTypeChange = function(ev) {
			if (navigator.connection.type !== undefined) {
				log.info('Connection type is: ' + navigator.connection.type);
				if (navigator.connection.type === Connection.NONE) {
					stopReplication();
				} else {
					startReplication();
				}
				return true;
			} else if (navigator.connection.bandwidth !== undefined) {
				log.info('Connection bandwidth is: ' + navigator.connection.bandwidth);
				if (navigator.connection.bandwidth > 0) {
					startReplication();
				} else {
					stopReplication();
				}
				return true;
			} else {
				log.info('Ignoring connection change event.');
				console.log(ev);
			}
			return false;
		};

		var _getDatabase = null;
		var getDatabase = function() {
			if (_getDatabase) {
				return _getDatabase;
			}

			var deferred = $q.defer();
			_getDatabase = deferred.promise;

			$q.when(ready).then(function() {
				deferred.resolve(db);
			});

			return _getDatabase;
		};

		var resetDatabase = function() {
			$rootScope.safeApply(function() {
				stopReplication();
				db = null;
				remoteDb = null;
				storage.set('cm.lasturl', '/events/official');
				storage.set('cm.lastSequence', 0);
				storage.set('cm.firstInitialization', true);

				PouchDB.destroy(SettingsService.getDatabaseName(), function(err) {
					$rootScope.safeApply(function() {
						if (err) {
							$window.alert('Failed to destroy existing database!');
						} else {
							var reloadHref = $window.location.href;
							if (reloadHref.indexOf('#') > -1) {
								reloadHref = reloadHref.split('#')[0];
							}
							log.info('Reloading CruiseMonkey Database at ' + reloadHref);
							$window.open(reloadHref, '_self');
						}
					});
				});
			});
		};

		api = {
			'reset': resetDatabase,
			'initialize': initialize,
			'getDatabase': getDatabase,
			'syncRemote': initializeFromRemote,
			'online': startReplication,
			'offline': stopReplication
		};

		return api;
	}]);
}());
