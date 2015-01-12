(function() {
	'use strict';

	/*global PouchDB: true*/
	angular.module('cruisemonkey.Database', [
		'cruisemonkey.Initializer'
	])
	/* Initializer is in here to make sure permissive SSL is set up before we try a database connection */
	.factory('_database', ['$q', '$rootScope', '$timeout', '$interval', 'Initializer', function($q, $rootScope, $timeout, $interval, Initializer) {
		var databases = {};

		var makeEventHandler = function(eventName, db) {
			return function(obj) {
				$rootScope.$broadcast(eventName, db, obj);
			};
		};

		function Database(name, view, replication) {
			var self         = this;

			self.name        = name;
			self.view        = view;
			self.replication = replication;

			self.createDb();
		}

		Database.prototype.pouch = function() {
			return this.db;
		};

		Database.prototype.__call = function() {
			var self = this;
			var args = Array.prototype.slice.call(arguments);
			var deferred = $q.defer();
			var db = self.pouch();

			var method = args.shift();
			args.push(function(err,res) {
				$rootScope.$evalAsync(function() {
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

		Database.prototype.createDb = function() {
			var self = this;
			self.db = new PouchDB(self.name, {size:50});
			self.db.setMaxListeners(30);

			console.log('Database.createDb: ' + self.name + ': configuring event listeners.');
			var events = [ 'complete', 'uptodate', 'change', 'error', 'create', 'update', 'delete' ];
			for (var i=0; i < events.length; i++) {
				var ev = events[i];
				self.db.on(ev, makeEventHandler('cruisemonkey.database.' + ev, self));
			}
		};

		Database.prototype.getView = function() {
			return this.view;
		};

		Database.prototype.getReplication = function() {
			return this.replication;
		};

		Database.prototype.destroy = function() {
			var deferred = $q.defer();
			var self = this;

			self.stopReplication();
			if (self.db) {
				self.db.removeAllListeners();
			}

			var resolveDeleted = function() {
				deferred.resolve({ok:true});
			};

			self.isEmpty().then(function(isEmpty) {
				if (isEmpty) {
					console.log('Database.destroy: database ' + self.name + ' is already empty, skipping destroy');
					resolveDeleted();
				} else {
					self.pouch().destroy(function(err, res) {
						$rootScope.$evalAsync(function() {
							if (err) {
								if (err.message && err.message.indexOf('no such table') >= 0) {
									console.log('Database.destroy: cruisemonkey.Database: destroy called on database that already does not exist.');
									resolveDeleted();
								} else {
									console.log('Database.destroy: cruisemonkey.Database: failed to destroy ' + self.name,err);
									deferred.reject(err);
								}
							} else {
								console.log('destroyed ' + self.name);
								resolveDeleted();
							}
						});
					});
				}
			});

			return deferred.promise;
		};

		Database.prototype.getIds = function(opts) {
			var deferred = $q.defer();
			var self = this;

			var options = angular.extend({}, opts);
			self.pouch().allDocs(options, function(err,res) {
				$rootScope.$evalAsync(function() {
					if (err) {
						deferred.reject(err);
					} else {
						var existingIds = [], existingId, i;
						for (i=0; i < res.rows.length; i++) {
							existingIds.push(res.rows[i].id);
						}
						deferred.resolve(existingIds);
					}
				});
			});

			return deferred.promise;
		};

		Database.prototype.doesDesignDocExist = function() {
			var deferred = $q.defer();
			var self = this;

			self.pouch().get('_design/cruisemonkey', function(err, doc) {
				$rootScope.$evalAsync(function() {
					if (err) {
						deferred.resolve(false);
					} else {
						deferred.resolve(true);
					}
				});
			});

			return deferred.promise;
		};

		Database.prototype.isEmpty = function() {
			var deferred = $q.defer();
			var self = this;

			self.info().then(function(info) {
				var isEmpty = info.doc_count === 0;
				deferred.resolve(isEmpty);
				console.log('isEmpty = ' + isEmpty);
			}, function(err) {
				deferred.resolve(false);
				console.log('isEmpty = ' + false);
			});

			return deferred.promise;
		};

		Database.prototype.get = function(docId, options) {
			return this.__call('get', docId, options || {});
		};

		Database.prototype.put = function(doc, options) {
			return this.__call('put', doc, options);
		};

		Database.prototype.post = function(doc, options) {
			return this.__call('post', doc, options);
		};

		Database.prototype.remove = function(doc, options) {
			return this.__call('remove', doc, options);
		};

		Database.prototype.query = function(fun, options) {
			return this.__call('query', fun, options);
		};

		Database.prototype.allDocs = function(options) {
			return this.__call('allDocs', options);
		};

		Database.prototype.bulkDocs = function(docs, options) {
			return this.__call('bulkDocs', docs, options);
		};

		Database.prototype.info = function() {
			return this.__call('info');
		};

		Database.prototype.syncDesignDocs = function(from) {
			var to = this;

			var deferred = $q.defer();

			to.pouch().replicate.from(from.pouch(), {
				'doc_ids': ['_design/cruisemonkey']
			}).on('complete', function(info) {
				$rootScope.$evalAsync(function() {
					console.log('Database.syncDesignDocs: design doc synced');
					deferred.resolve(true);
				});
			}).on('error', function(err) {
				$rootScope.$evalAsync(function() {
					console.log('Database.syncDesignDocs: design doc sync failure:',err);
					deferred.reject(err);
				});
			});

			return deferred.promise;
		};

		Database.prototype.updateFrom = function(from, options) {
			var to = this;

			var deferred = $q.defer(), fromQuery;

			to.syncDesignDocs(from).then(function() {
				var viewOptions = to.getView();
				var doQuery = ((viewOptions && viewOptions.view)? true : false);

				if (doQuery) {
					var opts = angular.copy(viewOptions);
					var view = opts.view;
					delete opts.view;

					fromQuery = from.query(view, opts);
				} else {
					fromQuery = from.getIds({
						'startkey': 'event:',
						'endkey': 'event:\uffff'
					});
				}

				$q.all([to.getIds(), fromQuery]).then(function(res) {
					var newIds = [], i,
						ids = res[0],
						fromQuery = res[1];

					if (doQuery) {
						console.log('Database.updateFrom: querying IDs from the remote database using view options:', to.getView());
						// we get back a .query result with rows
						for (i=0; i < fromQuery.rows.length; i++) {
							if (ids.indexOf(fromQuery.rows[i].id) === -1) {
								// we don't already have this one; sync it
								newIds.push(fromQuery.rows[i].id);
							}
						}
					} else {
						// we get back a list of ids
						console.log('Database.updateFrom: NOT using view for querying IDs from the remote database (fetching all document IDs matching event:*)');
						for (i=0; i < fromQuery.length; i++) {
							if (ids.indexOf(fromQuery[i]) === -1) {
								// we don't already have this one; sync it
								newIds.push(fromQuery[i]);
							}
						}
					}

					if (newIds.length > 0) {
						from.allDocs({
							'include_docs': true,
							'keys': newIds
						}).then(function(res) {
							// console.log('allDocs got ' + res.rows.length + ' documents');
							var newDocs = [];

							for (i=0; i < res.rows.length; i++) {
								newDocs.push(res.rows[i].doc);
							}

							var doBulk = function(count, deferred, remainingDocs) {
								if (remainingDocs.length > 0) {
									console.log('Database.updateFrom: doing bulk-save of documents #' + (count + Math.min(remainingDocs.length,1)) + ' to #' + (count + Math.min(remainingDocs.length, 500)));
									var docs = remainingDocs.splice(0, 500);
									to.bulkDocs(docs, { 'new_edits': false }).then(function(res) {
										var c = count + res.length;
										doBulk(c, deferred, remainingDocs);
									}, function(err) {
										console.log('Database.updateFrom: bulk-save failed:',err);
										deferred.reject(err);
									});
								} else {
									console.log('Database.updateFrom: bulk-save complete. count='+count);
									deferred.resolve(count);
								}
							};

							doBulk(0, deferred, newDocs);
						}, function(err) {
							deferred.reject(err);
						});
					} else {
						deferred.resolve(0);
					}
				});
			}, function(err) {
				console.log('Database.updateFrom: failed to sync design docs:',err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		Database.prototype.replicateFrom = function(from, options) {
			var to = this;

			var deferred = $q.defer();

			var replication = to.getReplication() || {};
			console.log('performing a replication from ' + from.name + ' to ' + to.name + ' using options:',replication);
			var opts = angular.extend({}, {
				complete: function(err, response) {
					$rootScope.$evalAsync(function() {
						if (err) {
							console.log('cruisemonkey.Database: failed to replicate from ' + from.name + ' to ' + to.name + ':',err);
							deferred.reject(err);
						} else {
							console.log('finished replication of ' + response.docs_written + ' documents from ' + from.name + ' to ' + to.name);
							deferred.resolve(response.docs_written);
						}
					});
				}
			}, replication, options);

			to.syncDesignDocs(from).then(function() {
				from.pouch().replicate.to(to.pouch(), opts).on('complete', function(info) {
					$rootScope.$evalAsync(function() {
						console.log('Database.replicateFrom: initial replication complete');
						deferred.resolve(true);
					});
				}).on('error', function(err) {
					$rootScope.$evalAsync(function() {
						console.log('Database.replicateFrom: initial replication failed:',err);
						deferred.reject(err);
					});
				});
			}, function(err) {
				deferred.reject(err);
			});

			return deferred.promise;
		};

		Database.prototype.continuouslyReplicateFrom = function(from, options) {
			var to = this,
			deferred = $q.defer();

			var replication = to.getReplication() || {};

			var startPersist = function(seq) {
				var since = seq || 0;

				var opts = angular.extend({}, {
					since: since
				}, replication, options);

				var persistOptions = {
					url: from.name,
					maxTimeout: 30000,
					startingTimeout: 1000,
					manual: true,
					from: {
						opts: angular.extend({}, {live:true}, opts)
					}
				};

				console.log('Database.continuouslyReplicateFrom: configuring continuous replication from ' + from.name + ' to ' + to.name + ' using options:',persistOptions);
				to._persist = to.pouch().persist(persistOptions);

				console.log('Database.continuouslyReplicateFrom: ' + from.name + ': configuring event listeners.');
				var events = [ 'connect', 'disconnect' ];
				for (var i=0; i < events.length; i++) {
					var ev = events[i];
					to._persist.on(ev, makeEventHandler('cruisemonkey.persist.' + ev, to));
				}

				to._persist.start();
			};

			from.info().then(function(info) {
				var sequenceNum = info.update_seq;
				console.log('current sequence: ' + sequenceNum);
				to.syncDesignDocs(from).then(function() {
					to.updateFrom(from).then(function() {
						console.log('Database.continuouslyReplicateFrom: finished initial update.');
						$rootScope.$broadcast('cruisemonkey.database.syncComplete', to);
						deferred.resolve(true);
						startPersist(sequenceNum);
					}, function(err) {
						console.log('Database.continuouslyReplicateFrom: updateFrom() failed:',err);
						deferred.reject(err);
						startPersist(0);
					});
				}, function(err) {
					console.log('Database.continuouslyReplicateFrom: failed to sync design docs:',err);
					deferred.reject(err);
					startPersist(0);
				});
			}, function(err) {
				console.log('Database.continuouslyReplicateFrom: failed to get info from ' + from.name,err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		Database.prototype.stopReplication = function() {
			var self = this;
			var deferred = $q.defer();

			$rootScope.$evalAsync(function() {
				console.log('Database: ' + self.name + ' is currently replicating.  Stopping replication.');
				if (self._persist) {
					self._persist.stop();
					self._persist.removeAllListeners();
					self._persist = undefined;
					$rootScope.$evalAsync(function() {
						console.log('Database: finished stopping replication of ' + self.name + '.');
						deferred.resolve(true);
					});
				} else {
					deferred.resolve(true);
				}
			});
			return deferred.promise;
		};

		Database.prototype.forceSync = function() {
			var self = this;
			var deferred = $q.defer();
			if (self._persist) {
				console.log('Database: ' + self.name + ' is currently replicating.  Forcing initialization of re-sync.');
				self._persist.stop();
				$rootScope.$evalAsync(function() {
					self._persist.start().then(function() {
						$rootScope.$evalAsync(function() {
							console.log('Database: finished initializing re-sync of ' + self.name + '.');
							deferred.resolve(true);
						});
					});
				});
			} else {
				console.log('Database: ' + self.name + ' is not replicating.  Skipping forced sync.');
			}
			return deferred.promise;
		};

		Database.prototype.syncFrom = function(from) {
			var to = this,
			deferred = $q.defer();

			to.isEmpty().then(function(isEmpty) {
				if (isEmpty) {
					to.updateFrom(from).then(function(res) {
						deferred.resolve(true);
						$rootScope.$evalAsync(function() {
							$rootScope.$broadcast('cruisemonkey.database.syncComplete', to);
						});
					}, function(err) {
						console.log('failed to update from ' + from.name,err);
						deferred.reject(err);
					});
				} else {
					to.replicateFrom(from).then(function(res) {
						deferred.resolve(true);
						$rootScope.$evalAsync(function() {
							$rootScope.$broadcast('cruisemonkey.database.syncComplete', to);
						});
					}, function(err) {
						console.log('failed to replicate from ' + from.name,err);
						deferred.reject(err);
					});
				}
			}, function(err) {
				console.log('unable to determine if database ' + to.name + ' is empty, falling back to replication:',err);
				to.replicateFrom(from).then(function() {
					deferred.resolve(true);
				}, function(err) {
					console.log('failed to replicate from ' + from.name,err);
					deferred.reject(err);
				});
			});

			return deferred.promise;
		};

		var getdb = function(db, options) {
			var view          = options? options.view          : undefined,
				replication   = options? options.replication   : undefined;

			if (!(db in databases)) {
				databases[db] = new Database(db, view, replication);
			}

			var ret = databases[db];
			if (ret && (ret.getView() !== view || ret.getReplication() !== replication)) {
				console.log('database ' + db + ' has already been created, but the view or replication options do not match!');
				console.log('requested view options:', view);
				console.log('requested replication options:', replication);
				databases[db] = new Database(db, view, replication);
			}

			return databases[db];
		};

		return {
			get: getdb
		};
	}]);
}());
