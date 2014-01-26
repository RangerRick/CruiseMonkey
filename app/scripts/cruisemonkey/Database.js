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
		'cruisemonkey.Settings'
	])
	.factory('Database', ['$q', '$location', '$interval', '$timeout', '$rootScope', '$window', '$http', 'LoggingService', 'storage', 'config.database.replicate', 'SettingsService', 'CordovaService', 'NotificationService', function($q, $location, $interval, $timeout, $rootScope, $window, $http, log, storage, replicate, SettingsService, CordovaService, NotificationService) {
		log.info('Initializing CruiseMonkey database: ' + SettingsService.getDatabaseName());

		storage.bind($rootScope, '_firstSync', {
			'defaultValue': true,
			'storeName': 'cm.db.firstSync'
		});

		var syncComplete = $q.defer();
		if ($rootScope._firstSync) {
			NotificationService.status('Downloading CruiseMonkey events from the server...', syncComplete.promise);
		}

		var getHost = function() {
			var host = SettingsService.getDatabaseHost();
			if (!host) {
				host = $location.host();
			}
			return 'http://' + SettingsService.getDatabaseHost() + ':5984/' + SettingsService.getDatabaseName();
		};

		var db = null,
			timeout = null,
			replicating = null,
			ready = $q.defer();

		var initializeFromRemote = function() {
			var host = getHost();
			var deferred = $q.defer();

			if (host && replicate) {
				log.debug('Database.initializeFromRemote(): Getting all docs.');
				$http.get(host + '/_all_docs?include_docs=true', { 'headers': { 'Accept': 'application/json' } })
					.success(function(data, status, headers, config) {
						/*jshint camelcase: false */
						if (data && data.total_rows) {
							deferred.resolve(true);
							angular.forEach(data.rows, function(row, index) {
								db.put(row.doc);
							});
							deferred.resolve(true);
							syncComplete.resolve(true);
						}
					})
					.error(function(data, status, headers, config) {
						log.error('Database.initializeFromRemote(): failed to get all_docs from remote host = ', status);
						deferred.reject(status);
					});
			} else {
				$timeout(function() {
					log.warn('Database.initializeFromRemote(): replication disabled, resolving with empty object');
					deferred.resolve(false);
				});
			}
			return deferred.promise;
		};

		var initialize = function() {
			log.info('Database.initialize(): Initializing database.');

			var deferred = $q.defer();

			db = new PouchDB(SettingsService.getDatabaseName());

			$timeout(function() {
				log.debug('Database.initialize(): Compacting database.');
				db.compact(function() {
					log.info('Database.initializeDatabase(): Compaction complete.');

					/*jshint camelcase: false */
					log.info('Database.initializeDatabase(): Watching for document changes.');
					db.changes({
						onChange: function(change) {
							//console.log('change: ', change);
							if (change.deleted) {
								$rootScope.$broadcast('cm.documentDeleted', change);
							} else {
								$rootScope.$broadcast('cm.documentUpdated', change.doc);
							}
						},
						continuous: true,
						conflicts: true,
						include_docs: true
					});

					ready.resolve(true);
					deferred.resolve(true);
				});
			});

			return deferred.promise;
		};

		var doReplicate = function() {
			if (replicate) {
				if (replicating) {
					return;
				}

				replicating = $q.defer();
				
				$timeout(function() {
					$rootScope.$broadcast('cm.replicationStarting');
					log.info('Replicating from ' + getHost());
					db.replicate.from(getHost(), {
						'complete': function() {
							log.info('Finished replicating from ' + getHost());
							$rootScope.$broadcast('cm.localDatabaseSynced');
							syncComplete.resolve(true);

							log.info('Replicating to ' + getHost());
							$timeout(function() {
								log.info('Replicating to ' + getHost());
								db.replicate.to(getHost(), {
									'complete': function() {
										log.info('Finished replicating to ' + getHost());
										$rootScope.$broadcast('cm.remoteDatabaseSynced');
										$rootScope.$broadcast('cm.replicationComplete');
										replicating.resolve(false);
										replicating = null;
									}
								});
							});
						}
					});
				});
			} else {
				log.warn('Replication disabled.');
				syncComplete.resolve(false);
			}
		};

		var startReplication = function() {
			if (replicate) {
				if (timeout !== null) {
					log.warn('Replication has already been started!  Timeout ID = ' + timeout);
					return false;
				} else {
					var refresh = SettingsService.getDatabaseRefresh();
					log.info('Enabling replication with ' + getHost() + ' (refresh = ' + refresh + ')');

					timeout = $interval(function() {
						doReplicate();
					}, refresh);
					doReplicate();

					return true;
				}
			} else {
				log.warn('startReplication() called, but replication is not enabled!');
				syncComplete.resolve(false);
			}
			return false;
		};

		var stopReplication = function() {
			if (replicate) {
				if (timeout !== null) {
					log.info('Stopping replication with ' + getHost());
					$interval.cancel(timeout);
					timeout = null;
					return true;
				} else {
					log.info('Replication is already stopped!');
					return false;
				}
			} else {
				log.warn('stopReplication() called, but replication is not enabled!');
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

		/*
		var setUp = function() {
			CordovaService.ifCordova(function() {
				// is cordova
				document.addEventListener('online', startReplication, false);
				document.addEventListener('offline', stopReplication, false);
				document.addEventListener('resume', startReplication, false);
				document.addEventListener('pause', stopReplication, false);

				databaseReady();
				startReplication();
			}, function() {
				$timeout(function() {
					if (navigator && navigator.connection) {
						if (navigator.connection.addEventListener) {
							log.info("Database.setUp(): Browser has native navigator.connection support.");
							navigator.connection.addEventListener('change', handleConnectionTypeChange, false);

							databaseReady();
							handleConnectionTypeChange();
						} else {
							log.info("Database.setUp(): Browser does not have native navigator.connection support.  Trying with online/offline events.");
							document.addEventListener('online', startReplication, false);
							document.addEventListener('offline', stopReplication, false);
							document.addEventListener('resume', startReplication, false);
							document.addEventListener('pause', stopReplication, false);

							databaseReady();
							if (!handleConnectionTypeChange()) {
								startReplication();
							}
						}
					} else {
						log.warn("Database.setUp(): Unsure how to handle connection management; starting replication and hoping for the best.");
						databaseReady();
						startReplication();
					}

				}, 0);
			});
		};

		var tearDown = function() {
			stopReplication();
			if (navigator && navigator.connection && navigator.connection.removeEventListener) {
				navigator.connection.removeEventListener('change', handleConnectionTypeChange, false);
			} else {
				document.removeEventListener('online', handleConnectionTypeChange, false);
				document.removeEventListener('offline', handleConnectionTypeChange, false);
			}
		};
		*/

		var getDatabase = function() {
			var deferred = $q.defer();
			$q.when(ready).then(function() {
				log.debug('Database.getDatabase(): Database is ready.');
				deferred.resolve(db);
			});
			return deferred.promise;
		};

		var resetDatabase = function() {
			$rootScope.safeApply(function() {
				$timeout.cancel(timeout);
				$rootScope._firstSync = true;
				storage.set('cm.lasturl', '/events/official');

				PouchDB.destroy(SettingsService.getDatabaseName(), function(err) {
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
		};

		/*
		$rootScope.$on('cm.settingsChanged', function() {
			log.info('Database: Settings changed.  Restarting replication.');
			stopReplication();
			startReplication();
		});
		*/

		return {
			'reset': resetDatabase,
			'initialize': initialize,
			'getDatabase': getDatabase,
			'replicateNow': doReplicate,
			'syncRemote': initializeFromRemote,
			'online': startReplication,
			'offline': stopReplication
		};
	}]);
}());
