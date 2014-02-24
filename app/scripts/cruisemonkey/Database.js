(function() {
	'use strict';

	/*global PouchDB: true*/
	/*global Connection: true*/
	/*global moment: true*/

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
	.factory('Database', ['$q', '$location', '$interval', '$timeout', '$rootScope', '$window', 'LoggingService', 'UpgradeService', 'storage', 'config.database.replicate', 'SettingsService', 'CordovaService', 'NotificationService', 'UserService', function($q, $location, $interval, $timeout, $rootScope, $window, log, upgrades, storage, replicate, SettingsService, cor, notifications, UserService) {
		var isAndroid = function() {
			return $window.navigator && $window.navigator.userAgent && $window.navigator.userAgent.indexOf('Android') >= 0;
		};

		storage.bind($rootScope, 'lastSent', {
			'storeName': 'cm.lastSent'
		});

		var getDatabaseName = function(dbname) {
			var deferred = $q.defer();
			if (!dbname) {
				dbname = SettingsService.getDatabaseName();
			}
			return (isAndroid()? 'websql://':'') + dbname;
		};

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

			if (SettingsService.getDirect()) {
				host = host.replace('http://', 'http://admin:ppjND8kuoU4YQG@');
			}

			return host + SettingsService.getDatabaseName();
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

		var db = null,
			remoteDb = null,
			api = null,
			compactTimer = null,
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
					db.info(function(err, info) {
						$rootScope.safeApply(function() {
							if (err || !info || info.doc_count === 0) {
								log.info('Database.initializeFromRemote(): found nothing in the database, requesting a full dump.');

								remoteDb.allDocs({
									include_docs: true
								}, function(err, response) {
									$rootScope.safeApply(function() {
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
											if (doc.type === 'event') {
												newDocs.push(doc);
											}
											if (doc.type === 'favorite' && doc._id.indexOf('favorite-') === 0) {
												newDocs.push(doc);
											}
										});

										console.log('newDocs=',newDocs);
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
								});
							} else {
								$rootScope.safeApply(function() {
									log.debug('Database.initializeFromRemote(): initialize from remote unnecessary.');
									deferred.resolve({});
								});
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

			if (SettingsService.getDirect()) {
				db = new PouchDB(getHost());
				replicate = false;
			} else {
				db = new PouchDB(getDatabaseName());
			}
			if (replicate) {
				log.debug('Database.initialize(): Replication enabled, initializing remoteDb.');
				remoteDb = new PouchDB(getHost());
			}

			log.info('Database.initializeDatabase(): Watching for document changes.');
			/*jshint camelcase: false */
			db.changes({
				since: $rootScope.lastSequence,
				onChange: function(change) {
					console.log('local change:',change);
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

			return deferred.promise;
		};

		var doCompact = function() {
			var deferred = $q.defer();

			log.debug('Database.initialize(): Compacting database.');
			var compact = $q.defer();
			$timeout(function() {
				try {
					db.compact(function() {
						$rootScope.safeApply(function() {
							log.info('Database.initializeDatabase(): Compaction complete.');
							deferred.resolve(true);
						});
					});
				} catch (ex) {
					log.error('Failed to compact database!');
					console.log(ex);
					deferred.reject(ex);
				}
			});

			return deferred.promise;
		};

		var startReplication = function() {
			if (resetting) {
				return false;
			}

			if (!replicate) {
				return false;
			}

			$q.when(ready).then(function() {
				var filter, params;

				if (compactTimer) {
					log.info('Database.startReplication(): Scheduling compaction...');
					compactTimer = $interval(function() {
						doCompact();
					}, 10 * 60 * 1000); // 10 minutes
				}

				$timeout(function() {
					if (replicationFrom) {
						log.warn('Database.startReplication(): Replication from the remote DB has already been started!');
					} else {
						log.info('Database.startReplication(): Starting replication from the remote DB...');
						$interval(function() {
							replicationFrom = db.replicate.from(remoteDb, {
								'continuous': false,
								'onChange': function(change) {
									$rootScope.safeApply(function() {
										console.log('remote change to local:',change);
										$rootScope.lastUpdated = moment();
									});
								},
								filter: function(doc, req) {
									if (doc.type === 'event') {
										return true;
									}

									if (doc.type === 'favorite') {
										if (doc._id && doc._id.indexOf('favorite-') === 0) {
											return true;
										} else {
											return false;
										}
									}

									// anything else, sync
									return true;
								},
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
											$rootScope.lastUpdated = moment();
										}
									});
								}
							});
						}, 10000);
					}

					if (replicationTo) {
						log.warn('Database.startReplication(): Replication to the remote DB has already been started!');
					} else {
						log.info('Database.startReplication(): Starting replication to the remote DB...');

						if (UserService.loggedIn()) {
							filter = function(doc, req) {
								var ret=false;
								if (doc.username === req.query.username) {
									// if it's ours, sync it back
									ret=true;
								} else if (doc._deleted === true) {
									// or if we've deleted it
									ret=true;
								} else {
									// otherwise, don't
									ret=false;
								}
								return ret;
							};
							params = {
								username: UserService.getUsername()
							};
						} else {
							// if we're not logged in, there is nothing local to sync
							filter = function() {
								return false;
							};
							params = {};
						}

						/*jshint camelcase: false */
						replicationTo = db.replicate.to(remoteDb, {
							'continuous': true,
							'onChange': function(change) {
								$rootScope.safeApply(function() {
									console.log('local change to remote:',change);
									$rootScope.lastUpdated = moment();
								});
							},
							filter: filter,
							query_params: params,
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
										$rootScope.lastUpdated = moment();
									}
								});
							}
						});
					}
				}, 3000);
			});

			return true;
		};

		var stopReplication = function() {
			if (compactTimer) {
				log.info('Database.stopReplication(): Canceling compaction timer...');
				$interval.cancel(compactTimer);
			}
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

			$q.when(ready.promise).then(function() {
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
				storage.set('cm.seamail.count', 0);
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
		
		$rootScope.$on('cm.loggedIn', function(evt) {
			stopReplication();
			startReplication();
		});

		$rootScope.$on('cm.loggedOut', function(evt) {
			stopReplication();
			startReplication();
		});

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
