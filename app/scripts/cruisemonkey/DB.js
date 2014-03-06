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

		var __syncing = {},
			__onSyncStart = null,
			__onSyncEnd = null,
			__onChange = null;

		var __replicate = function(from, to) {
			var deferred = $q.defer();
			from.replicate.to(to, {
				batch_size: 500,
				complete: function(err, response) {
					$rootScope.$apply(function() {
						if (err) {
							deferred.reject(err);
						} else {
							//log.debug('__replicate:response=',response);
							deferred.resolve(response.docs_written);
						}
					});
				}
			});
			return deferred.promise;
		};

		var __sync = function(from, to) {
			if (__syncing[from] && __syncing[from][to]) {
				log.debug('Already syncing!');
				return;
			}

			if (!__syncing[from]) {
				__syncing[from] = [];
			}
			__syncing[from][to] = true;

			if (__onSyncStart) {
				__onSyncStart(from, to);
			}

			var change = function() {};
			if (__onChange) {
				change = __onChange;
			}

			PouchDB.sync(from, to, {
				continuous: true,
				onChange: function(change) {
					if (__onChange) {
						$rootScope.$apply(function() {
							__onChange(change);
						});
					}
				},
				complete: function(err, response) {
					if (__onSyncEnd) {
						$rootScope.$apply(function() {
							__onSyncEnd(err, response, from, to);
						});
					}
				}
			});
		};

		var __initialize = function() {
			var deferred = $q.defer();
			if (__userDatabase === null || __remoteDatabase === null) {
				log.debug('You must set a user and remote database!');
				$timeout(function() {
					deferred.reject();
				});
				return deferred.promise;
			}

			__pouchUser = new PouchDB(__userDatabase);
			__pouchRemote = new PouchDB(__remoteDatabase);

			__pouchUser.info(function(err,info) {
				var numDocs = 0;
				if (info && info.doc_count) {
					numDocs = info.doc_count;
				}

				if (numDocs === 0) {
					//log.debug('No documents in user (local) database: initializing.');
					__pouchRemote.allDocs({include_docs:true}, function(err, response) {
						//log.debug('allDocs:response=',response);
						if (err) {
							$rootScope.$apply(function() {
								deferred.reject(err);
							});
							return;
						}
						var newdocs = [];
						for (var i=0; i < response.rows.length; i++) {
							newdocs.push(response.rows[i].doc);
						}
						//log.debug('newdocs=',newdocs);
						__pouchUser.bulkDocs({
							docs: newdocs,
							new_edits: false
						}, function(err, response) {
							//log.debug('bulkDocs:err=',err);
							//log.debug('bulkDocs:response=',response);
							$rootScope.$apply(function() {
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
					//log.debug('User (local) database has ' + numDocs + ' documents: fetching changes.');
					// first, fetch all known IDs
					__pouchUser.allDocs(function(err,res) {
						if (err) {
							$rootScope.$apply(function() {
								deferred.reject(err);
								return;
							});
						}

						var existingKeys = [];
						for (var i=0; i < res.rows.length; i++) {
							existingKeys.push(res.rows[i].id);
						}
						//log.debug('existingKeys=',existingKeys);
						
						__pouchRemote.allDocs(function(err,res) {
							if (err) {
								$rootScope.$apply(function() {
									deferred.reject(err);
									return;
								});
							}

							var allKeys = [];
							for (var i=0; i < res.rows.length; i++) {
								allKeys.push(res.rows[i].id);
							}
							//log.debug('allKeys=',allKeys);
							
							var index;
							for (var e=0; e < existingKeys.length; e++) {
								index = allKeys.indexOf(existingKeys[e]);
								if (index !== -1) {
									allKeys.splice(index, 1);
								}
							}
							//log.debug(allKeys.length + ' new documents remaining');
							
							__pouchRemote.allDocs({
								include_docs: true,
								keys: allKeys
							}, function(err,res) {
								if (err) {
									$rootScope.$apply(function() {
										deferred.reject(err);
										return;
									});
								}

								//log.debug('got ' + res.rows.length + ' documents');
								var updatedDocs = [], row;
								for (var i=0; i < res.rows.length; i++) {
									row = res.rows[i];
									//log.debug('row:',row);
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
									$rootScope.$apply(function() {
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
						});
					});
				}
			});

			return deferred.promise;
		};

		var __query = function(db, view, options) {
			var deferred = $q.defer();
			db.query('cruisemonkey/' + view, options, function(err, response) {
				$rootScope.$apply(function() {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(response);
					}
				});
			});
			return deferred.promise;
		};

		var __remote = function() {
			return {
				'query': function(view, options) {
					return __query(__pouchRemote, view, options);
				}
			};
		};
		
		var __local = function() {
			return {
				'query': function(view, options) {
					return __query(__pouchUser, view, options);
				}
			};
		};

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
			'local': __local
		};
	}]);
}());