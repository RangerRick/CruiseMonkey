(function() {
	'use strict';

	/*global PouchDB: true*/
	angular.module('cruisemonkey.Database', [
	])
	.factory('_database', ['$q', '$rootScope', '$timeout', '$interval', '$ionicLoading', function($q, $rootScope, $timeout, $interval, $ionicLoading) {
		var databases = {};

		var _isLoading = false;
		var startLoadingBar = function() {
			if (_isLoading) {
				return;
			}
			_isLoading = true;

			console.log('starting loading bar');
			/*
			$ionicLoading.show({
				'template': 'Loading...',
				'noBackdrop': true
			});
			*/
		};

		var stopLoadingBar = function() {
			if (_isLoading) {
				console.log('stopping loading bar');
				//$ionicLoading.hide();
				_isLoading = false;
			}
		};

		var doLoadingBar = function(promise) {
			startLoadingBar();
			$q.when(promise).then(function() {
				stopLoadingBar();
			}, function() {
				stopLoadingBar();
			});
			return promise;
		};

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

			console.debug('Database.createDb: ' + self.name + ': configuring event listeners.');
			var events = [ 'complete', 'uptodate', 'change', 'error', 'create', 'update', 'delete' ];
			for (var i=0; i < events.length; i++) {
				var ev = events[i];
				self.db.on(ev, makeEventHandler('cm.database.' + ev, self));
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
			self.db.removeAllListeners();

			var resolveDeleted = function() {
				deferred.resolve({ok:true});
				// recreate a fresh PouchDB
				self.createDb();
			};

			self.isEmpty().then(function(isEmpty) {
				if (isEmpty) {
					console.debug('database ' + self.name + ' is already empty, skipping destroy');
					resolveDeleted();
				} else {
					self.pouch().destroy(function(err, res) {
						$rootScope.$evalAsync(function() {
							if (err) {
								if (err.message && err.message.indexOf('no such table') >= 0) {
									console.warn('cruisemonkey.Database: destroy called on database that already does not exist.');
									resolveDeleted();
								} else {
									console.error('cruisemonkey.Database: failed to destroy ' + self.name,err);
									deferred.reject(err);
								}
							} else {
								console.debug('destroyed ' + self.name);
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
				console.debug('isEmpty = ' + isEmpty);
			}, function(err) {
				deferred.resolve(false);
				console.debug('isEmpty = ' + false);
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
					console.debug('Database.syncDesignDocs: design doc synced');
					deferred.resolve(true);
				});
			}).on('error', function(err) {
				$rootScope.$evalAsync(function() {
					console.debug('Database.syncDesignDocs: design doc sync failure:',err);
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
						console.debug('Database.updateFrom: querying IDs from the remote database using view options:', to.getView());
						// we get back a .query result with rows
						for (i=0; i < fromQuery.rows.length; i++) {
							if (ids.indexOf(fromQuery.rows[i].id) === -1) {
								// we don't already have this one; sync it
								newIds.push(fromQuery.rows[i].id);
							}
						}
					} else {
						// we get back a list of ids
						console.debug('Database.updateFrom: NOT using view for querying IDs from the remote database (fetching all document IDs matching event:*)');
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
							// console.debug('allDocs got ' + res.rows.length + ' documents');
							var newDocs = [];

							for (i=0; i < res.rows.length; i++) {
								newDocs.push(res.rows[i].doc);
							}

							var doBulk = function(count, deferred, remainingDocs) {
								if (remainingDocs.length > 0) {
									console.debug('Database.updateFrom: doing bulk-save of documents #' + (count + Math.min(remainingDocs.length,1)) + ' to #' + (count + Math.min(remainingDocs.length, 500)));
									var docs = remainingDocs.splice(0, 500);
									to.bulkDocs(docs, { 'new_edits': false }).then(function(res) {
										var c = count + res.length;
										doBulk(c, deferred, remainingDocs);
									}, function(err) {
										console.debug('Database.updateFrom: bulk-save failed:',err);
										deferred.reject(err);
									});
								} else {
									console.debug('Database.updateFrom: bulk-save complete. count='+count);
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
				console.warn('Database.updateFrom: failed to sync design docs:',err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		Database.prototype.replicateFrom = function(from, options) {
			var to = this;

			var deferred = $q.defer();

			var replication = to.getReplication() || {};
			console.debug('performing a replication from ' + from.name + ' to ' + to.name + ' using options:',replication);
			var opts = angular.extend({}, {
				complete: function(err, response) {
					$rootScope.$evalAsync(function() {
						if (err) {
							console.debug('cruisemonkey.Database: failed to replicate from ' + from.name + ' to ' + to.name + ':',err);
							deferred.reject(err);
						} else {
							console.debug('finished replication of ' + response.docs_written + ' documents from ' + from.name + ' to ' + to.name);
							deferred.resolve(response.docs_written);
						}
					});
				}
			}, replication, options);

			to.syncDesignDocs(from).then(function() {
				from.pouch().replicate.to(to.pouch(), opts).on('complete', function(info) {
					$rootScope.$evalAsync(function() {
						console.debug('Database.replicateFrom: initial replication complete');
						deferred.resolve(true);
					});
				}).on('error', function(err) {
					$rootScope.$evalAsync(function() {
						console.debug('Database.replicateFrom: initial replication failed:',err);
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

				console.debug('Database.continuouslyReplicateFrom: configuring continuous replication from ' + from.name + ' to ' + to.name + ' using options:',persistOptions);
				to._persist = to.pouch().persist(persistOptions);

				console.debug('Database.continuouslyReplicateFrom: ' + from.name + ': configuring event listeners.');
				var events = [ 'connect', 'disconnect' ];
				for (var i=0; i < events.length; i++) {
					var ev = events[i];
					to._persist.on(ev, makeEventHandler('cm.persist.' + ev, to));
				}

				to._persist.start();
			};

			from.info().then(function(info) {
				var sequenceNum = info.update_seq;
				console.debug('current sequence: ' + sequenceNum);
				to.syncDesignDocs(from).then(function() {
					to.updateFrom(from).then(function() {
						console.debug('Database.continuouslyReplicateFrom: finished initial update.');
						$rootScope.$broadcast('cm.database.syncComplete', to);
						deferred.resolve(true);
						startPersist(sequenceNum);
					}, function(err) {
						console.debug('Database.continuouslyReplicateFrom: updateFrom() failed:',err);
						deferred.reject(err);
						startPersist(0);
					});
				}, function(err) {
					console.debug('Database.continuouslyReplicateFrom: failed to sync design docs:',err);
					deferred.reject(err);
					startPersist(0);
				});
			}, function(err) {
				console.debug('Database.continuouslyReplicateFrom: failed to get info from ' + from.name,err);
				deferred.reject(err);
			});

			return doLoadingBar(deferred.promise);
		};

		Database.prototype.stopReplication = function() {
			var self = this;
			if (self._persist) {
				self._persist.stop();
				self._persist.removeAllListeners();
				self._persist = undefined;
			}
		};

		Database.prototype.syncFrom = function(from) {
			var to = this,
			deferred = $q.defer();

			to.isEmpty().then(function(isEmpty) {
				if (isEmpty) {
					to.updateFrom(from).then(function(res) {
						deferred.resolve(true);
						$rootScope.$evalAsync(function() {
							$rootScope.$broadcast('cm.database.syncComplete', to);
						});
					}, function(err) {
						console.error('failed to update from ' + from.name,err);
						deferred.reject(err);
					});
				} else {
					to.replicateFrom(from).then(function(res) {
						deferred.resolve(true);
						$rootScope.$evalAsync(function() {
							$rootScope.$broadcast('cm.database.syncComplete');
						});
					}, function(err) {
						console.error('failed to replicate from ' + from.name,err);
						deferred.reject(err);
					});
				}
			}, function(err) {
				console.error('unable to determine if database ' + to.name + ' is empty, falling back to replication:',err);
				to.replicateFrom(from).then(function() {
					deferred.resolve(true);
				}, function(err) {
					console.error('failed to replicate from ' + from.name,err);
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
				console.warn('database ' + db + ' has already been created, but the view or replication options do not match!');
				console.warn('requested view options:', view);
				console.warn('requested replication options:', replication);
				databases[db] = new Database(db, view, replication);
			}

			return databases[db];
		};

		return {
			get: getdb
		};
	}]);
}());
