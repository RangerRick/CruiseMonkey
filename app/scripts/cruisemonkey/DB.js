(function() {
	'use strict';

	/*global PouchDB: true*/
	angular.module('cruisemonkey.DB', [
	])
	.factory('_db', ['$log', '$q', '$rootScope', '$timeout', function(log, $q, $rootScope, $timeout) {
		var __pouchEvents = null,
			__pouchFavorites = null,
			__pouchRemote = null;

		var __username = null;

		var __syncing = null,
			__onSyncStart = null,
			__onSyncEnd = null,
			__onChange = null;
			
		var __ready = null;

		if (!$rootScope.safeApply) {
			$rootScope.safeApply = function(fn) {
				var phase = this.$root.$$phase;
				if(phase === '$apply' || phase === '$digest') {
					if(fn && (typeof(fn) === 'function')) {
						fn();
					}
				} else {
					this.$apply(fn);
				}
			};
		}

		var ready = function(dbtype) {
			var deferred = $q.defer();
			if (__ready === undefined || __ready === null) {
				$timeout(function() {
					deferred.reject('Database not initialized!');
				});
				return;
			} else {
				__ready.then(function(res) {
					if (dbtype === 'favorites') {
						deferred.resolve(__pouchFavorites);
					} else if (dbtype === 'events') {
						deferred.resolve(__pouchEvents);
					} else if (dbtype === 'remote') {
						deferred.resolve(__pouchRemote);
					} else {
						deferred.resolve(undefined);
					}
				}, function(err) {
					deferred.reject(err);
				});
			}
			return deferred.promise;
		};

		// don't wrap this in ready() since it's called during init
		var __replicate = function(from, to, options) {
			var deferred = $q.defer();
			var opts = angular.extend({}, {
				batch_size: 500,
				complete: function(err, response) {
					$rootScope.safeApply(function() {
						if (err) {
							deferred.reject(err);
						} else {
							deferred.resolve(response.docs_written);
						}
					});
				}
			}, options);
			log.debug('__replicate:',opts);
			from.replicate.to(to, opts);
			return deferred.promise;
		};

		var __startSync = function(from, to, options) {
			var deferred = $q.defer();

			ready().then(function() {
				if (from === to) {
					deferred.reject('Cannot sync to itself!');
					return;
				}
				if (__syncing !== null) {
					deferred.reject('Already syncing!');
					return;
				}
				log.info('Starting sync.');

				if (__onSyncStart) {
					__onSyncStart(from, to);
				}

				var opts = angular.extend({}, {
					live: true,
					onChange: function(change) {
						if (__onChange) {
							$rootScope.safeApply(function() {
								__onChange(change);
							});
						}
					},
					complete: function(err, response) {
						if (__onSyncEnd) {
							$rootScope.safeApply(function() {
								__onSyncEnd(err, response, from, to);
								__syncing = null;
							});
						}
					}
				}, options);
				__syncing = from.replicate.sync(to, opts);
				deferred.resolve(true);
			});
			return deferred.promise;
		};

		var __stopSync = function() {
			if (__syncing === null) {
				log.debug('Already stopped!');
				return;
			}
			log.info('Stopping sync.');

			__syncing.cancel();
			__syncing = null;
		};

		var __initializeDatabase = function(from, to, viewOptions, replicationOptions) {
			var deferred = $q.defer();

			to.allDocs(function(err,res) {
				if (err) {
					$rootScope.safeApply(function() {
						deferred.reject(err);
					});
					return;
				}

				var existingIds = [], i;
				for (i=0; i < res.rows.length; i++) {
					existingIds.push(res.rows[i].id);
				}

				var opts = {};
				if (viewOptions.key) {
					opts.key = viewOptions.key;
				}
				from.query(viewOptions.view, opts, function(err,res) {
					if (err) {
						$rootScope.safeApply(function() {
							deferred.reject(err);
						});
						return;
					}

					var newIds = [];
					for (i=0; i < res.rows.length; i++) {
						var id = res.rows[i].id;
						if (existingIds.indexOf(id) === -1) {
							// we don't already have this ID
							newIds.push(id);
						}
					}
					if (newIds.length > 0) {
						log.debug('existing items found, fetching only new documents');
						from.allDocs({
							include_docs: true,
							keys: newIds
						}, function(err,res) {
							if (err) {
								$rootScope.safeApply(function() {
									deferred.reject(err);
								});
								return;
							}

							var newDocs = [];
							for (i=0; i < res.rows.length; i++) {
								if (res.rows[i].doc._deleted) {
									// skip deleted documents, let them get caught by replication
								} else {
									newDocs.push(res.rows[i].doc);
								}
							}

							log.debug('bulk-saving ' + newDocs.length + ' documents');
							to.bulkDocs({
								docs: newDocs,
								new_edits: false
							}, function(err,res) {
								if (err) {
									$rootScope.safeApply(function() {
										deferred.reject(err);
									});
									return;
								}

								log.debug('bulk-save complete. replicating:',replicationOptions);
								__replicate(from, to, replicationOptions).then(function(res) {
									log.debug('replication complete: ' + res);
									deferred.resolve(res);
								}, function(err) {
									deferred.reject(err);
								});
							});
						});
					} else {
						log.debug('no new items found. replicating:',replicationOptions);
						__replicate(from, to, replicationOptions).then(function(res) {
							log.debug('replication complete: ' + res);
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}
				});
			});
			return deferred.promise;
		};

		var __initialize = function() {
			var deferred = $q.defer();
			__ready = deferred.promise;
			if (__pouchRemote === null) {
				log.debug('You must set a remote database!');
				$timeout(function() {
					deferred.reject();
				});
				return deferred.promise;
			}

			if (__syncing) {
				__stopSync();
			}

			$timeout(function() {
				if (__pouchEvents === null || __pouchEvents === undefined) {
					__pouchEvents = new PouchDB('events');
				}

				var promises = [
					__initializeDatabase(__pouchRemote, __pouchEvents, {
						'view': 'cruisemonkey/events-replication'
					}, {
						'filter':'cruisemonkey/events'
					})
				];

				if (__username && __pouchFavorites) {
					promises.push(
						__initializeDatabase(__pouchRemote, __pouchFavorites, {
							'view': 'cruisemonkey/favorites-all',
							'key': __username
						}, {
							'filter':'cruisemonkey/favorites',
							'query_params': {
								'username': __username
							}
						})
					);
				}

				$q.all(promises).then(function(results) {
					var count = 0, r;
					for (r=0; r < results.length; r++) {
						count += results[r];
					}
					deferred.resolve(count);
				}, function(err) {
					deferred.reject(err);
				});
				/*
				$q.all([
					__initializeDatabase(__pouchRemote, __pouchEvents,    'cruisemonkey/events-replication',    'cruisemonkey/events'),
					__initializeDatabase(__pouchRemote, __pouchFavorites, 'cruisemonkey/favorites-replication', 'cruisemonkey/favorites')
				}).then(function(results) {
					deferred.resolve(results);
				}, function(err) {
					deferred.reject(err);
				});
				*/
			}, 10);

			return deferred.promise;
		};

		var __query = function(db, view, options) {
			var deferred = $q.defer();
			db.query('cruisemonkey/' + view, options, function(err, response) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(response);
					}
				});
			});
			return deferred.promise;
		};

		var __get = function(db, id, options) {
			var deferred = $q.defer();
			db.get(id, options, function(err, response) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(response);
					}
				});
			});
			return deferred.promise;
		};

		var __put = function(db, doc, options) {
			var deferred = $q.defer();
			db.put(doc, options, function(err, response) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(response);
					}
				});
			});
			return deferred.promise;
		};
		
		var __post = function(db, doc, options) {
			var deferred = $q.defer();
			db.post(doc, options, function(err, response) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(response);
					}
				});
			});
			return deferred.promise;
		};
		
		var __bulk = function(db, docs) {
			var deferred = $q.defer();
			db.bulkDocs({
				docs: docs
			}, function(err, res) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(res);
					}
				});
			});
			return deferred.promise;
		};
		
		var __remove = function(db, doc) {
			var deferred = $q.defer();
			db.remove(doc, function(err,res) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(res);
					}
				});
			});
			return deferred.promise;
		};

		var __info = function(db) {
			var deferred = $q.defer();
			db.info(function(err, info) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(info);
					}
				});
			});
			return deferred.promise;
		};

		var __db = function(dbtype) {
			return {
				'query': function(view, options) {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						__query(db, view, options).then(function(res) {
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				},
				'get': function(id, options) {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						__get(db, id, options).then(function(res) {
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				},
				'put': function(doc, options) {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						__put(db, doc, options).then(function(res) {
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				},
				'post': function(doc, options) {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						__post(db, doc, options).then(function(res) {
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				},
				'bulk': function(docs) {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						__bulk(db, docs).then(function(res) {
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				},
				'remove': function(doc) {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						__remove(db, doc).then(function(res) {
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				},
				'info': function() {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						__info(db).then(function(res) {
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				},
				'ready': function() {
					var deferred = $q.defer();
					ready(dbtype).then(function(db) {
						if (db === undefined || db === null) {
							deferred.reject();
						} else {
							deferred.resolve(true);
						}
					}, function(err) {
						deferred.reject(err);
					});
					return deferred.promise;
				}
			};
		};
		var __remote = function() {
			return __db('remote');
		};
		
		var __events = function() {
			return __db('events');
		};

		var __favorites = function() {
			return __db('favorites');
		};

		var __destroy = function() {
			var deferred = $q.defer();
			__local().info().then(function(info) {
				PouchDB.destroy(info.db_name, function(err,res) {
					$rootScope.safeApply(function() {
						if (err) {
							deferred.reject(err);
						} else {
							deferred.resolve(info);
						}
					});
				});
			}, function(err) {
				deferred.reject(err);
			});
			return deferred.promise;
		};
		var __reset = function() {
			var deferred = $q.defer();
			__destroy().then(function(results) {
				log.debug('destroyed:',results);
				__ready = null;
				__initialize().then(function(init) {
					deferred.resolve(init);
				}, function(err) {
					log.debug('failed to initialize: ' + err);
					deferred.reject(err);
				});
			}, function(err) {
				log.debug('failed to destroy existing database: ' + err);
				deferred.reject(err);
			});
			return deferred.promise;
		};

		$rootScope.$on('cm.online', function(ev, isOnline) {
			if (isOnline) {
				__startSync(__pouchRemote, __pouchEvents, {filter:'cruisemonkey/events'});
			} else {
				__stopSync();
			}
		});
		$rootScope.$on('$destroy', function() {
			log.debug('Destroying root scope; stopping sync.');
			__stopSync();
		});

		return {
			'setRemoteDatabase': function(db) {
				if (typeof db === 'string' || db instanceof String) {
					__pouchRemote = new PouchDB(db);
				} else if (db === undefined || db === null) {
					__pouchRemote = db;
				} else {
					__pouchRemote = db;
				}
			},
			'setEventsDatabase': function(db) {
				if (typeof db === 'string' || db instanceof String) {
					__pouchEvents = new PouchDB(db);
				} else if (db === undefined || db === null) {
					__pouchEvents = db;
				} else {
					__pouchEvents = db;
				}
			},
			'setFavoritesDatabase': function(db) {
				if (typeof db === 'string' || db instanceof String) {
					__pouchFavorites = new PouchDB(db);
				} else if (db === undefined || db === null) {
					__pouchFavorites = db;
				} else {
					__pouchFavorites = db;
				}
			},
			'setUsername': function(username) {
				__username = username;
			},
			'onSyncStart': function(callback) {
				__onSyncStart = callback;
			},
			'onSyncEnd': function(callback) {
				__onSyncEnd = callback;
			},
			'onChange': function(callback) {
				__onChange = callback;
			},
			'init': __initialize,
			'remote': __remote,
			'events': __events,
			'favorites': __favorites,
			'reset': __reset,
			'restartSync': function() {
				__stopSync();
				__startSync(__pouchRemote, __pouchEvents, {filter:'cruisemonkey/events'});
			}
		};
	}]);
}());