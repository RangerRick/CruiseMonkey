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
		'cruisemonkey.Upgrades',
		'cruisemonkey.User'
	])
	.factory('Database', ['$q', '$location', '$interval', '$timeout', '$rootScope', '$window', '$http', 'LoggingService', 'UpgradeService', 'storage', 'config.database.replicate', 'SettingsService', 'CordovaService', 'NotificationService', 'UserService', function($q, $location, $interval, $timeout, $rootScope, $window, $http, log, upgrades, storage, replicate, SettingsService, cor, notifications, UserService) {
		var isAndroid = function() {
			return $window.navigator && $window.navigator.userAgent && $window.navigator.userAgent.indexOf('Android') >= 0;
		};

		var getDatabaseName = function(dbname) {
			if (!dbname) {
				dbname = SettingsService.getDatabaseName();
			}
			return (isAndroid()? 'websql://':'') + dbname;
		};

		log.info('Initializing CruiseMonkey database: ' + getDatabaseName());

		upgrades.register('3.9.5', 'Reset Event Cache', function() {
			var deferred = $q.defer();
			PouchDB.destroy(getDatabaseName('cruisemonkey'), function(err) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject('Failed to destroy cruisemonkey: ' + err);
					} else {
						PouchDB.destroy(getDatabaseName('cmtest'), function(err) {
							if (err) {
								deferred.reject('Failed to destroy cmtest: ' + err);
							} else {
								deferred.resolve(true);
							}
						});
					}
				});
			});
			return deferred.promise;
		});

		storage.bind($rootScope, 'lastSequence', {
			'defaultValue': 0,
			'storeName': 'cm.lastSequence'
		});

		var getHost = function() {
			var host = SettingsService.getDatabaseHost();
			if (!host) {
				host = 'http://' + $location.host();
			}

			if (!host.endsWith('/')) {
				host += '/';
			}
			if (!host.startsWith('http')) {
				host = 'http://' + host;
			}

			return host + SettingsService.getDatabaseName();
		};

		var db = null,
			remoteDb = null,
			api = null,
			replicating = null,
			replicated = false,
			replicationTo = null,
			replicationFrom = null,
			resetting = false,
			ready = $q.defer();

		var initializeFromRemote = function() {
			var host = getHost();
			var deferred = $q.defer();

			if (resetting) {
				$timeout(function() {
					deferred.reject(false);
				});
				return deferred.promise;
			}

			$q.when(ready).then(function() {
				if (host && replicate) {
					/*jshint camelcase: false */
					log.debug('Database.initializeFromRemote(): Getting all docs.');
					remoteDb.allDocs({
						include_docs: true
					}, function(err, response) {
						if (err) {
							console.log('Database.initializeFromRemote(): error:',err);
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

						//console.log('newDocs=',newDocs);
						deferred.reject(err);
						db.bulkDocs({
							docs: newDocs,
							new_edits: false
						}, function(err, response) {
							if (err) {
								console.log('Database.initializeFromRemote(): error:',err);
								deferred.reject(err);
								return;
							} else {
								console.log('Database.initializeFromRemote(): response=',response);
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

			if (resetting) {
				$timeout(function() {
					deferred.reject(false);
				});
				return deferred.promise;
			}

			db = new PouchDB(getDatabaseName());
			if (replicate) {
				log.debug('Database.initialize(): Replication enabled, initializing remoteDb.');
				remoteDb = new PouchDB(getHost());
			}

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
									$rootScope.lastUpdated = moment();
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
			if (resetting) {
				return false;
			}

			if (!replicate) {
				return false;
			}

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
								if (resetting) {
									return;
								}
								if (err) {
									log.error('Replication from remote DB ended: ' + err);
									console.log('Details:',details);
									if (db && replicationFrom) {
										try {
											replicationFrom.cancel();
										} catch (err) {
											console.log('Cancel failed.');
										}
										replicationFrom = null;
									}
								} else {
									console.log('Replication from remote DB complete:',details);
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
								if (resetting) {
									return;
								}
								if (err) {
									log.error('Replication to remote DB ended: ' + err);
									console.log('Details:',details);
									if (db && replicationTo) {
										try {
											replicationTo.cancel();
										} catch (err) {
											console.log('Cancel failed.');
										}
										replicationTo = null;
									}
								} else {
									console.log('Replication to remote DB complete:',details);
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
				replicationFrom = null;
			} else {
				log.warn('Database.stopReplication(): Replication from the remote DB has already been stopped!');
			}
			if (replicationTo) {
				log.info('Database.stopReplication(): Stopping replication to the remote DB...');
				replicationTo.cancel();
				replicationTo = null;
			} else {
				log.warn('Database.stopReplication(): Replication to the remote DB has already been stopped!');
			}
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
				resetting = true;
				if (replicationFrom) {
					replicationFrom.cancel();
				}
				if (replicationTo) {
					replicationTo.cancel();
				}
				db = null;
				remoteDb = null;
				storage.set('cm.lasturl', '/events/official');
				storage.set('cm.lastSequence', 0);
				storage.set('cm.firstInitialization', true);

				PouchDB.destroy(getDatabaseName(), function(err) {
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
		
		$rootScope.$on('cm.settingsChanged', function(evt, settings) {
			var reset = false;
			if (settings.before.databaseHost !== settings.after.databaseHost) {
				log.debug('Database host has changed!  Resetting database!');
				reset = true;
			} else if (settings.before.databaseName !== settings.after.databaseName) {
				log.debug('Database name has changed!  Resetting database!');
				reset = true;
			}
			if (reset) {
				resetDatabase();
			}
		});

		api = {
			'reset': resetDatabase,
			'initialize': initialize,
			'getDatabase': getDatabase,
			'syncRemote': initializeFromRemote,
			'online': startReplication,
			'offline': stopReplication,
			'restartReplication': function() {
				stopReplication();
				startReplication();
			}
		};

		return api;
	}]);
}());
