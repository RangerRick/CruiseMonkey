(function() {
	'use strict';

	/*global PouchDB: true*/
	/*global Connection: true*/
	angular.module('cruisemonkey.Database', [
		'angularLocalStorage',
		'cruisemonkey.Cordova',
		'cruisemonkey.Logging',
		'cruisemonkey.Config',
		'cruisemonkey.Settings'
	])
	.factory('Database', ['$q', '$location', '$interval', '$timeout', '$rootScope', '$window', 'LoggingService', 'storage', 'config.database.replicate', 'SettingsService', 'CordovaService', function($q, $location, $interval, $timeout, $rootScope, $window, log, storage, replicate, SettingsService, CordovaService) {
		log.info('Initializing CruiseMonkey database: ' + SettingsService.getDatabaseName());

		storage.bind($rootScope, '_seq', {
			'defaultValue': 0,
			'storeName': 'cm.db.sync'
		});
		log.info('last sequence: ' + $rootScope._seq);
		var _lastSeq = $rootScope._seq;

		if ($rootScope._seq === 0) {
			$rootScope.notificationText = 'Downloading CruiseMonkey events from the server...';
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
			watchingChanges = false,
			replicating = null,
			ready = $q.defer();

		var initializeDatabase = function() {
			db = new PouchDB(SettingsService.getDatabaseName());
			timeout = null;
			watchingChanges = false;

			db.compact();

			log.info('Database.initializeDatabase(): Database initialization complete.');
			$rootScope.$broadcast('cm.databaseInitialized');
		};

		var databaseReady = function() {
			if (watchingChanges) {
				log.warn('Already watching for document changes.');
				return;
			}

			watchingChanges = true;
			
			log.info('Watching for document changes.');
			var seq = $rootScope._seq;
			if (!seq) {
				seq = 0;
			}
			
			/*jshint camelcase: false */
			db.changes({
				since: seq,
				onChange: function(change) {
					//console.log('change: ', change);
					if (change.seq) {
						_lastSeq = change.seq;
					}
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

			log.info('Database.databaseReady(): Database ready for change updates.');
			ready.resolve(true);
			$rootScope.$broadcast('cm.databaseReady');
		};

		var doReplicate = function() {
			if (replicate) {
				if (replicating) {
					return;
				}

				replicating = $q.defer();
				$rootScope.$broadcast('cm.replicationStarting');
				log.info('Replicating from ' + getHost());
				db.replicate.from(getHost(), {
					'complete': function() {
						$rootScope._seq = _lastSeq;
						$rootScope.$broadcast('cm.localDatabaseSynced');

						log.info('Replicating to ' + getHost());
						db.replicate.to(getHost(), {
							'complete': function() {
								log.info('Replication complete.');
								$rootScope.$broadcast('cm.remoteDatabaseSynced');
								$rootScope.$broadcast('cm.replicationComplete');
								replicating.resolve(false);
								replicating = null;
							}
						});
					}
				});
			} else {
				log.warn('Replication disabled.');
				$rootScope._seq = _lastSeq;
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

		var getDatabase = function() {
			var deferred = $q.defer();
			$q.when(ready).then(function() {
				deferred.resolve(db);
			});
			return deferred.promise;
		};

		var resetDatabase = function() {
			$rootScope.safeApply(function() {
				tearDown();
				watchingChanges = false;
				$rootScope._seq = 0;
				_lastSeq = 0;
				$timeout.cancel(timeout);
				timeout = undefined;
				ready.reject('resetting');
				ready = $q.defer();
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
						// $window.location = reloadHref;
						$window.open(reloadHref, '_self');
						/*
						CordovaService.ifCordova(function() {
							$window.open(reloadHref, '_self');
						},
						function() {
							$window.open(reloadHref);
						});
						*/
					}
				});
			});
		};

		/* start everything up */
		initializeDatabase();
		setUp();

		$rootScope.$on('cm.settingsChanged', function() {
			log.info('Database: Settings changed.  Restarting replication.');
			stopReplication();
			startReplication();
		});

		return {
			'reset': resetDatabase,
			'getDatabase': getDatabase,
			'replicateNow': doReplicate,
			'startReplication': startReplication,
			'stopReplication': stopReplication
		};
	}]);
}());
