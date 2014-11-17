(function() {
	'use strict';

	/*global PouchDB: true*/
	angular.module('cruisemonkey.DB', [
	])
	.factory('_db', ['$q', '$rootScope', '$timeout', function($q, $rootScope, $timeout) {
		var __pouchEvents = null,
			__pouchFavorites = null,
			__pouchRemote = null;

		var __api = 1;

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
				return deferred.promise;
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
			console.debug('__replicate:',opts);
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
				console.info('Starting sync.');

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
				console.debug('Already stopped!');
				return;
			}
			console.info('Stopping sync.');

			__syncing.cancel();
			__syncing = null;
		};

		var __call = function() {
			var self = this;
			var args = Array.prototype.slice.call(arguments);
			var deferred = $q.defer();
			var db = args.shift();
			var method = args.shift();
			args.push(function(err,res) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(res);
					}
				});
			});
			db[method].apply(db, args);
			return deferred.promise;
		};

		var __get = function(db, id, options) {
			return __call(db, 'get', id, options);
		};

		var __put = function(db, doc, options) {
			return __call(db, 'put', doc, options);
		};

		var __query = function(db, view, options) {
			return __call(db, 'query', view, options);
		};

		var __allDocs = function(db, options) {
			return __call(db, 'allDocs', options);
		};

		var __bulkDocs = function(db, options) {
			return __call(db, 'bulkDocs', options);
		};

		var __syncInfo = function(db) {
			return __call(db, 'get', 'syncInfo');
		};

		var __initializeDatabase = function(from, to, viewOptions, replicationOptions) {
			var deferred = $q.defer();

			__allDocs(to).then(function(res) {
				var existingIds = [], i, existingId;
				for (i=0; i < res.rows.length; i++) {
					existingIds.push(res.rows[i].id);
				}

				var opts = {};
				if (viewOptions.key) {
					opts.key = viewOptions.key;
				}
				__query(from, viewOptions.view, opts).then(function(res) {
					var newIds = [];
					for (i=0; i < res.rows.length; i++) {
						var id = res.rows[i].id;
						if (existingIds.indexOf(id) === -1) {
							// we don't already have this ID
							newIds.push(id);
						}
					}
					if (newIds.length > 0) {
						console.debug('existing items found, fetching only new documents');
						__allDocs(from, {
							include_docs: true,
							keys: newIds
						}).then(function(res) {
							var newDocs = [];
							for (i=0; i < res.rows.length; i++) {
								if (res.rows[i].doc._deleted) {
									// skip deleted documents, let them get caught by replication
								} else {
									newDocs.push(res.rows[i].doc);
								}
							}

							console.debug('bulk-saving ' + newDocs.length + ' documents');
							__bulkDocs(to, {
								docs: newDocs,
								new_edits: false
							}).then(function(res) {
								console.debug('bulk-save complete. replicating:',replicationOptions);
								__replicate(from, to, replicationOptions).then(function(res) {
									console.debug('replication complete: ' + res);
									deferred.resolve(res);
								}, function(err) {
									deferred.reject(err);
								});
							}, function(err) {
								console.error('bulkDocs(to) query failed:',err);
								deferred.reject(err);
							});
						}, function(err) {
							console.error('allDocs(from) query failed:',err);
							deferred.reject(err);
						});
					} else {
						console.debug('no new items found. replicating:',replicationOptions);
						__replicate(from, to, replicationOptions).then(function(res) {
							console.debug('replication complete: ' + res);
							deferred.resolve(res);
						}, function(err) {
							deferred.reject(err);
						});
					}
				}, function(err) {
					console.error(viewOptions.view + ' query failed:',err);
					deferred.reject(err);
				});
			}, function(err) {
				console.error('allDocs(to) query failed:',err);
			});

			return deferred.promise;
		};

		var __initialize = function() {
			var deferred = $q.defer();
			__ready = deferred.promise;
			if (__pouchRemote === null) {
				console.debug('You must set a remote database!');
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

				var syncinfoready = $q.defer();

				__syncInfo(__pouchEvents)['finally'](function(res) {
					console.log('finally args:',arguments);
					var dirty = false;
					var _syncInfo = {
						'_id': 'syncInfo',
						'api': __api,
						'url': __pouchEvents.url
					};

					console.log('res=',res);
					if (res) {
						_syncInfo._rev = res._rev;
						if (res.api !== __api) {
							dirty = true;
						}
						if (res.url !== __pouchEvents.url) {
							dirty = true;
						}
					} else {
						dirty = true;
					}
					console.log('dirty=',dirty,'original=',__pouchRemote.url,'syncinfo=',_syncInfo);
					if (dirty) {
						__put(__pouchEvents, _syncInfo).then(function(res) {
							console.log(res);
							syncinfoready.resolve(res);
						}, function(err) {
							syncinfoready.reject(err);
						});
					} else {
						syncinfoready.resolve(true);
					}
				});

				syncinfoready.promise.then(function() {
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
				}, function(err) {
					console.log('failed to create syncInfo!',err);
					deferred.reject(err);
				});
			}, 10);

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
						if (view.indexOf('cruisemonkey/') === -1) {
							view = 'cruisemonkey/' + view;
						}
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

			var doDestroy = function(info) {
				var def = $q.defer();

				if (info.length === 0) {
					def.resolve();
				} else {
					var db = info.shift();
					PouchDB.destroy(db.db_name, function(err,res) {
						$rootScope.safeApply(function() {
							if (err) {
								def.reject(err);
							} else {
								doDestroy(info).then(function() {
									def.resolve();
								}, function(err) {
									def.reject(err);
								});
							}
						});
					});
				}

				return def.promise;
			};

			$q.all([__remote.info(), __events.info(), __favorites.info()]).then(function(res) {
				doDestroy(res).then(function() {
					deferred.resolve();
				}, function(err) {
					deferred.reject(err);
				});
			});

			return deferred.promise;
		};
		var __reset = function() {
			var deferred = $q.defer();
			__destroy().then(function(results) {
				console.debug('destroyed:',results);
				__ready = null;
				__initialize().then(function(init) {
					deferred.resolve(init);
				}, function(err) {
					console.debug('failed to initialize: ' + err);
					deferred.reject(err);
				});
			}, function(err) {
				console.debug('failed to destroy existing database: ' + err);
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
			console.debug('Destroying root scope; stopping sync.');
			__stopSync();
		});

		return {
			'setRemoteDatabase': function(db) {
				if (typeof db === 'string' || db instanceof String) {
					__pouchRemote = new PouchDB(db);
					__pouchRemote.url = db;
				} else if (db === null || db === undefined) {
					__pouchRemote = null;
				} else {
					throw('setRemoteDatabase: Expected a database string, but got: ' + db);
				}
			},
			'setEventsDatabase': function(db) {
				if (typeof db === 'string' || db instanceof String) {
					__pouchEvents = new PouchDB(db);
					__pouchEvents.url = db;
				} else if (db === null || db === undefined) {
					__pouchEvents = null;
				} else {
					throw('setEventsDatabase: Expected a database string, but got: ' + db);
				}
			},
			'setFavoritesDatabase': function(db) {
				if (typeof db === 'string' || db instanceof String) {
					__pouchFavorites = new PouchDB(db);
					__pouchFavorites.url = db;
				} else if (db === null || db === undefined) {
					__pouchFavorites = null;
				} else {
					throw('setFavoritesDatabase: Expected a database string, but got: ' + db);
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
