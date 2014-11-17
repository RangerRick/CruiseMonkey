(function() {
	'use strict';

	/*global PouchDB: true*/
	angular.module('cruisemonkey.Database', [
	])
	.factory('_database', ['$q', '$rootScope', '$timeout', function($q, $rootScope, $timeout) {
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

		var databases = {};

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

		Database.prototype.createDb = function() {
			this.db = new PouchDB(this.name, {size:50});
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
						$rootScope.safeApply(function() {
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
				$rootScope.safeApply(function() {
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
				$rootScope.safeApply(function() {
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

			self.pouch().info(function(err,res) {
				$rootScope.safeApply(function() {
					if (err) {
						deferred.resolve(0);
					} else {
						deferred.resolve(res.doc_count === 0);
					}
				});
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

		Database.prototype.updateFrom = function(from, options) {
			var to = this;

			var deferred = $q.defer(), fromQuery;

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

			$q.all([to.getIds(), fromQuery, from.doesDesignDocExist()]).then(function(res) {
				var newIds = [], i;
				if (res[2]) {
					newIds.push('_design/cruisemonkey');
				}

				if (doQuery) {
					console.debug('querying IDs from the remote database using view options:', to.getView());
					// we get back a .query result with rows
					for (i=0; i < res[1].rows.length; i++) {
						if (res[0].indexOf(res[1].rows[i].id) === -1) {
							// we don't already have this one; sync it
							newIds.push(res[1].rows[i].id);
						}
					}
				} else {
					// we get back a list of ids
					console.debug('NOT using view for querying IDs from the remote database (fetching all document IDs matching event:*)');
					for (i=0; i < res[1].length; i++) {
						if (res[0].indexOf(res[1][i]) === -1) {
							// we don't already have this one; sync it
							newIds.push(res[1][i]);
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
								console.debug('doing bulk-save of documents #' + (count + Math.min(remainingDocs.length,1)) + ' to #' + (count + Math.min(remainingDocs.length, 500)));
								var docs = remainingDocs.splice(0, 500);
								to.bulkDocs(docs, { 'new_edits': false }).then(function(res) {
									var c = count + res.length;
									doBulk(c, deferred, remainingDocs);
								}, function(err) {
									console.debug('bulk-save failed:',err);
									deferred.reject(err);
								});
							} else {
								console.debug('bulk-save complete. count='+count);
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

			return deferred.promise;
		};

		Database.prototype.replicateFrom = function(from, options) {
			var to = this;

			var deferred = $q.defer();

			var replication = to.getReplication() || {};
			console.debug('performing a replication from ' + from.name + ' to ' + to.name + ' using options:',replication);
			var opts = angular.extend({}, {
				batch_size: 500,
				complete: function(err, response) {
					$rootScope.safeApply(function() {
						if (err) {
							console.debug('cruisemonkey.Database: failed to replicate from ' + from.name + ' to ' + to.name + ':',err);
							deferred.reject(err);
						} else {
							console.debug('finished replication from ' + from.name + ' to ' + to.name);
							deferred.resolve(response.docs_written);
						}
					});
				}
			}, replication, options);

			from.pouch().replicate.to(to.pouch(), opts);
			return deferred.promise;
		};

		Database.prototype.syncFrom = function(from) {
			var self = this,
			deferred = $q.defer();

			self.isEmpty().then(function(isEmpty) {
				if (isEmpty) {
					self.updateFrom(from).then(function(res) {
						deferred.resolve(true);
					}, function(err) {
						console.error('failed to update from ' + from.name,err);
						deferred.reject(err);
					});
				} else {
					self.replicateFrom(from).then(function(res) {
						deferred.resolve(true);
					}, function(err) {
						console.error('failed to replicate from ' + from.name,err);
						deferred.reject(err);
					});
				}
			}, function(err) {
				console.error('unable to determine if database ' + self.name + ' is empty, falling back to replication:',err);
				self.replicateFrom(from).then(function() {
					deferred.resolve(true);
				}, function(err) {
					console.error('failed to replicate from ' + from.name,err);
					deferred.reject(err);
				});
			});

			return deferred.promise;
		};

		var getdb = function(db, options) {
			var view        = options? options.view        : undefined,
				replication = options? options.replication : undefined;

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
