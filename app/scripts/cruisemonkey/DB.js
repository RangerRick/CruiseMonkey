(function() {
	'use strict';

	/*global PouchDB: true*/
	angular.module('cruisemonkey.DB', [
	])
	.factory('_db', ['$log', '$q', '$rootScope', '$timeout', function(log, $q, $rootScope, $timeout) {
		var __userDatabase = null,
			__remoteDatabase = null;

		var __pouchUser = null,
			__pouchRemote = null;

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

		var ready = function() {
			var deferred = $q.defer();
			if (__ready === null) {
				$timeout(function() {
					deferred.reject('Database not initialized!');
				});
				return;
			} else {
				__ready.then(function(res) {
					deferred.resolve(res);
				}, function(err) {
					deferred.reject(err);
				});
			}
			return deferred.promise;
		};

		// don't wrap this in ready() since it's called during init
		var __replicate = function(from, to) {
			var deferred = $q.defer();
			from.replicate.to(to, {
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
			});
			return deferred.promise;
		};

		var __startSync = function(from, to) {
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

				__syncing = from.replicate.sync(to, {
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
				});
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

			console.log(__syncing);
			__syncing.cancel();
			__syncing = null;
		};

		var __initialize = function() {
			var deferred = $q.defer();
			__ready = deferred.promise;
			if (__userDatabase === null || __remoteDatabase === null) {
				log.debug('You must set a user and remote database!');
				$timeout(function() {
					deferred.reject();
				});
				return deferred.promise;
			}

			if (__syncing) {
				__stopSync();
			}

			$timeout(function() {
				__pouchUser = new PouchDB(__userDatabase);
				__pouchRemote = new PouchDB(__remoteDatabase);

				__pouchUser.info(function(err,info) {
					var numDocs = 0;
					if (info && info.doc_count) {
						numDocs = info.doc_count;
					}

					if (numDocs === 0) {
						log.debug('No documents in user (local) database: initializing.');
						__pouchRemote.allDocs({include_docs:true}, function(err, response) {
							if (err) {
								$rootScope.safeApply(function() {
									deferred.reject(err);
								});
								return;
							}
							var newdocs = [];
							for (var i=0; i < response.rows.length; i++) {
								newdocs.push(response.rows[i].doc);
							}
							__pouchUser.bulkDocs({
								docs: newdocs,
								new_edits: false
							}, function(err, response) {
								$rootScope.safeApply(function() {
									if (err) {
										deferred.reject(err);
									} else {
										__replicate(__pouchRemote, __pouchUser).then(function(changes) {
											deferred.resolve(changes);
										});
									}
								});
							});
						});
					} else {
						log.debug('User (local) database has ' + numDocs + ' documents: fetching changes.');
						// first, fetch all known IDs
						__pouchUser.allDocs(function(err,res) {
							if (err) {
								$rootScope.safeApply(function() {
									deferred.reject(err);
								});
								return;
							}

							var existingKeys = [];
							for (var i=0; i < res.rows.length; i++) {
								existingKeys.push(res.rows[i].id);
							}

							__pouchRemote.allDocs(function(err,res) {
								if (err) {
									$rootScope.safeApply(function() {
										deferred.reject(err);
									});
									return;
								}

								if (!res || !res.rows) {
									$rootScope.safeApply(function() {
										deferred.reject('No results.');
									});
									return;
								}

								var allKeys = [];
								for (var i=0; i < res.rows.length; i++) {
									allKeys.push(res.rows[i].id);
								}

								var index;
								for (var e=0; e < existingKeys.length; e++) {
									index = allKeys.indexOf(existingKeys[e]);
									if (index !== -1) {
										allKeys.splice(index, 1);
									}
								}

								__pouchRemote.allDocs({
									include_docs: true,
									keys: allKeys
								}, function(err,res) {
									if (err) {
										$rootScope.safeApply(function() {
											deferred.reject(err);
										});
										return;
									}

									var updatedDocs = [], row;
									for (var i=0; i < res.rows.length; i++) {
										row = res.rows[i];
										if (row.doc._deleted) {
											log.debug('deleted: ', row);
										} else {
											updatedDocs.push(row.doc);
										}
									}

									__pouchUser.bulkDocs({
										docs: updatedDocs,
										new_edits: false
									}, function(err, response) {
										if (err) {
											$rootScope.safeApply(function() {
												deferred.reject(err);
											});
											return;
										}

										__replicate(__pouchRemote, __pouchUser).then(function(changes) {
											log.debug('finished replication:', changes);
											$rootScope.safeApply(function() {
												deferred.resolve(changes);
											});
										});
									});
								});
							});
						});
					}
				});
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

		var __db = function(db) {
			return {
				'query': function(view, options) {
					return __query(db, view, options);
				},
				'get': function(id, options) {
					return __get(db, id, options);
				},
				'put': function(doc, options) {
					return __put(db, doc, options);
				},
				'post': function(doc, options) {
					return __post(db, doc, options);
				},
				'bulk': function(docs) {
					return __bulk(db, docs);
				},
				'remove': function(doc) {
					return __remove(db, doc);
				}
			};
		};
		var __remote = function() {
			return __db(__pouchRemote);
		};
		
		var __local = function() {
			return __db(__pouchUser);
		};

		var __destroy = function(db) {
			var deferred = $q.defer();
			db.destroy(function(err,info) {
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
		var __reset = function(db) {
			var deferred = $q.defer();
			__destroy(db).then(function(results) {
				log.debug('destroyed:',results);
				__ready = null;
				__initialize().then(function(init) {
					deferred.resolve(init);
				}, function(err) {
					log.debug('failed to initialize: ' + err);
					deferred.reject(err);
				})
			}, function(err) {
				log.debug('failed to destroy existing database: ' + err);
				deferred.reject(err);
			});
			return deferred.promise;
		};

		$rootScope.$on('cm.online', function(ev, isOnline) {
			if (isOnline) {
				__startSync(__pouchRemote, __pouchUser);
			} else {
				__stopSync();
			}
		});
		$rootScope.$on('$destroy', function() {
			log.debug('Destroying root scope; stopping sync.');
			__stopSync();
		});

		return {
			'setUserDatabase': function(db) {
				__userDatabase = db;
			},
			'setRemoteDatabase': function(db) {
				__remoteDatabase = db;
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
			'local': __local,
			'reset': function() {
				return __reset(__local());
			},
			'restartSync': function() {
				__stopSync();
				__startSync(__pouchRemote, __pouchUser);
			}
		};
	}]);
}());