/* global describe: true */
/* global xdescribe: true */

describe('cruisemonkey.Database', function() {
	'use strict';
	
	/* global AsyncSpec: true */
	/* global jasmine: true */
	/* global webroot: true */
	/* global defaultDocs: true */
	/* global CMEvent: true */
	/* global moment: true */

	var async       = new AsyncSpec(this);

	var $q           = null,
		$timeout     = null,
		$rootScope   = null,
		$httpBackend = null,
		_database    = null,
		_dbnum       = 0;

	async.beforeEach(function(done) {
		module('cruisemonkey.Database', function() {
			//$provide.value('config.upgrade', false);
		});

		inject(['$q', '$timeout', '$rootScope', '$httpBackend', '_database', function(q, timeout, rootScope, httpBackend, database) {
			$q = q;
			$timeout = timeout;
			$rootScope = rootScope;
			$httpBackend = httpBackend;
			_database = database;

			done();
		}]);
	});

	var dbs = [
		'test-local',
		'test-events',
		'test-favorites',
		webroot + 'test-remote'
	];

	var _doDestroy = function(destroyme, deferred) {
		if (destroyme.length === 0) {
			$rootScope.safeApply(function() {
				deferred.resolve();
			});
		} else {
			console.debug('_doDestroy: ' + destroyme.length + ' remaining');

			var nextdb = destroyme.shift();
			var db = _database.get(nextdb);
			db.destroy().then(function() {
				_doDestroy(destroyme, deferred);
			}, function(err) {
				console.warn('failed to destroy ' + nextdb + ':', err);
				_doDestroy(destroyme, deferred);
			});
		}
	};

	async.beforeEach(function(done) {
		_dbnum++;
		console.debug('beforeEach: starting');
		var deferred = $q.defer();

		_doDestroy(angular.copy(dbs), deferred);

		deferred.promise.then(function() {
			console.debug('beforeEach: finished destroying');
			done();
		}, function(err) {
			console.error('beforeEach: failed destroying:',err);
			done();
		});
	});

	async.afterEach(function(done) {
		console.debug('afterEach: starting');
		var deferred = $q.defer();

		_doDestroy(angular.copy(dbs), deferred);
		deferred.promise.then(function() {
			console.debug('beforeEach: finished destroying');
			done();
		}, function(err) {
			console.error('beforeEach: failed destroying:',err);
			done();
		});
	});

	var createTestDb = function() {
		var deferred  = $q.defer();

		var pristine  = _database.get(webroot + 'test-pristine');
		var remote    = _database.get(webroot + 'test-remote');
		//var events    = _database.get('test-events');
		//var favorites = _database.get('test-favorites');
		remote.syncFrom(pristine).then(function() {
			remote.bulkDocs(defaultDocs).then(function() {
				deferred.resolve();
			}, function(err) {
				console.error('error bulk-adding docs:',err);
				deferred.reject(err);
			});
		}, function(err) {
			console.error('failed to sync from ' + pristine.name);
			deferred.reject(err);
		});

		return deferred.promise;
	};

	describe('service#get(test-local)', function() {
		async.it('should pass if we could get a local database', function(done) {
			var db = _database.get('test-local');
			expect(db).toBeDefined();
			db.pouch().allDocs(function(err, res) {
				/*jshint camelcase: false */
				$rootScope.safeApply(function() {
					expect(err).toBeNull();
					expect(res).toBeDefined();
					expect(res.total_rows).toBeDefined();
					expect(res.total_rows).toEqual(jasmine.any(Number));
					done();
				});
			});
		});
	});

	describe('db#destroy(test-local)', function() {
		async.it('should pass if we got no failures destroying a database', function(done) {
			var db = _database.get('test-local');
			expect(db).toBeDefined();
			db.destroy().then(function(res) {
				expect(res).toBeDefined();
				expect(res.ok).toEqual(true);

				// destroy it a second time
				db.destroy().then(function(res) {
					expect(res).toBeDefined();
					expect(res.ok).toEqual(true);
					done();
				});
			});
		});
	});

	describe('db#updateFrom()', function() {
		async.it('should pass if we can batch-sync one database to another', function(done) {
			var local = _database.get('test-local');
			var other = _database.get('test-other');
			local.destroy().then(function() {
				other.destroy().then(function() {
					local = _database.get('test-local');

					local.pouch().post({
						'_id': 'event:test',
						'type': 'event',
						'test': true,
						'isPublic': true
					}, function(err, res) {
						$rootScope.safeApply(function() {
							expect(err).toBeNull();
							expect(res).toBeDefined();

							var other = _database.get('test-other');

							other.updateFrom(local).then(function(res) {
								expect(res).toBeDefined();
								expect(res).toEqual(1);
								done();
							});
						});
					});
				});
			});
		});

		async.it('should copy only the things that match the given view', function(done) {
			createTestDb().then(function() {
				var remote = _database.get(webroot + 'test-remote');
				var events = _database.get('test-events', {
					'view': {
						'view': 'cruisemonkey/events-public'
					},
					'replication': {
						'filter':'cruisemonkey/events'
					}
				});

				console.debug('events.updateFrom(remote)');
				events.updateFrom(remote).then(function() {
					events.allDocs({'include_docs': true}).then(function(docs) {
						expect(docs.rows.length).toEqual(4); // # of public events + design doc
						for (var i=0; i < docs.rows.length; i++) {
							if (docs.rows[i].id.indexOf('_design/') === 0) {
								continue;
							}
							expect(docs.rows[i].doc.isPublic).toEqual(true);
						}
						done();
					});
				});
			});
		});

		async.it('should use the username as key when querying', function(done) {
			createTestDb().then(function() {
				var remote    = _database.get(webroot + 'test-remote');
				var favorites = _database.get('test-favorites', {
					'view': {
						'view': 'cruisemonkey/favorites-all',
						'key': 'rangerrick'
					},
					'replication': {
						'filter':'cruisemonkey/favorites',
						'query_params': {
							'username': 'rangerrick'
						}
					}
				});

				favorites.updateFrom(remote).then(function() {
					favorites.allDocs({'include_docs': true}).then(function(docs) {
						expect(docs.rows.length).toEqual(2); // # of rangerrick favorites + design doc
						for (var i=0; i < docs.rows.length; i++) {
							if (docs.rows[i].id.indexOf('_design/') === 0) {
								continue;
							}
							expect(docs.rows[i].doc.eventId).toEqual('event:official-event');
						}
						done();
					});
				});
			});
		});
	});

	describe('db#replicateFrom()', function() {
		async.it('should pass if we can batch-replicate one database to another', function(done) {
			var local = _database.get('test-local');
			var other = _database.get('test-other');
			local.destroy().then(function() {
				other.destroy().then(function() {
					local = _database.get('test-local');

					local.pouch().post({
						'_id': 'event:test',
						'type': 'event',
						'test': true,
						'isPublic': true
					}, function(err, res) {
						$rootScope.safeApply(function() {
							expect(err).toBeNull();
							expect(res).toBeDefined();

							var other = _database.get('test-other');

							other.replicateFrom(local).then(function(res) {
								expect(res).toBeDefined();
								expect(res).toEqual(1);
								done();
							});
						});
					});
				});
			});
		});

		async.it('should copy only the things that match the given view', function(done) {
			createTestDb().then(function() {
				var remote = _database.get(webroot + 'test-remote');
				var events = _database.get('test-events', {
					'view': {
						'view': 'cruisemonkey/events-public'
					},
					'replication': {
						'filter':'cruisemonkey/events-public'
					}
				});

				events.replicateFrom(remote).then(function() {
					events.allDocs({'include_docs': true}).then(function(docs) {
						expect(docs.rows.length).toEqual(4); // # of public events + design doc
						for (var i=0; i < docs.rows.length; i++) {
							//console.debug(i+':',docs.rows[i]);
							if (docs.rows[i].id.indexOf('_design/') === 0) {
								continue;
							}
							expect(docs.rows[i].doc.isPublic).toEqual(true);
						}
						done();
					});
				});
			});
		});

		async.it('should use the username as key when querying', function(done) {
			createTestDb().then(function() {
				var remote    = _database.get(webroot + 'test-remote');
				var favorites = _database.get('test-favorites', {
					'view': {
						'view': 'cruisemonkey/favorites-all',
						'key': 'username'
					},
					'replication': {
						'filter':'cruisemonkey/favorites',
						'query_params': {
							'username': 'rangerrick'
						}
					}
				});

				favorites.replicateFrom(remote).then(function() {
					favorites.allDocs({'include_docs': true}).then(function(docs) {
						expect(docs.rows.length).toEqual(2); // # of rangerrick favorites + design doc
						for (var i=0; i < docs.rows.length; i++) {
							if (docs.rows[i].id.indexOf('_design/') === 0) {
								continue;
							}
							expect(docs.rows[i].doc.eventId).toEqual('event:official-event');
						}
						done();
					});
				});
			});
		});
	});

	var findEvent = function(events, id) {
		for (var i=0; i < events.length; i++) {
			var ev = events[i];
			if (ev.id === id) {
				return ev;
			}
		}
		return null;
	};

	describe('db#query()', function() {
		async.it('should pass if we can get all test events with a query', function(done) {
			createTestDb().then(function() {
				var remote = _database.get(webroot + 'test-remote');

				expect(remote).toBeDefined();

				/*jshint camelcase: false */
				remote.query('cruisemonkey/events-all', {include_docs: true}).then(function(res) {
					expect(res).toBeDefined();
					expect(res.rows.length).toEqual(5);

					var official = findEvent(res.rows, 'event:official-event');
					expect(official).toBeDefined();

					var officialEvent = new CMEvent(official.doc);
					expect(officialEvent.getSummary()).toBe('official event');

					done();
				});
			}, function(err) {
				console.debug('failed to create test db:',err);
			});
		});
	});

	describe('db#get()', function() {
		async.it('should get the specific document we ask for', function(done) {
			createTestDb().then(function() {
				var remote = _database.get(webroot + 'test-remote');

				expect(remote).toBeDefined();

				remote.get('favorite:rangerrick:event:official-event').then(function(res) {
					expect(res).toBeDefined();
					expect(res.username).toEqual('rangerrick');
					done();
				});
			}, function(err) {
				console.debug('failed to create test db:',err);
			});
		});
	});


	xdescribe('Syncing', function() {
		var objs = [];
		for (var i=0; i < 30000; i++) {
			objs.push({
				'_id': 'event:thing_' + i,
				'type': 'ignoreme',
				'summary': 'thingy #' + i
			});
		}

		async.it('should pass if we can sync 30k events', function(done) {
			createTestDb().then(function() {
				var local  = _database.get('test-local');
				var remote = _database.get(webroot + 'test-remote');
				var beginning = moment();

				remote.bulkDocs(objs).then(function() {
					console.info('finished bulk-adding 30k docs; deleting 20k docs');
					remote.allDocs().then(function(res) {
						objs = [];
						for (var i=0; i < 20000; i++) {
							objs.push({
								'_id': res.rows[i].id,
								'_rev': res.rows[i].value.rev,
								'_deleted': true
							});
						}
						remote.bulkDocs(objs).then(function() {
							console.info('finished bulk-deleting 20k documents; syncing');
							$rootScope.safeApply(function() {
								var start = moment();
								local.syncFrom(remote).then(function(res) {
									expect(res).toEqual(true);
									var now = moment();
									var seconds = now.diff(start, 'seconds');
									var total = now.diff(beginning, 'seconds');
									console.debug('finished sync in ' + seconds + ' seconds; total time was ' + total + ' seconds');
									expect(seconds).toBeLessThan(30);
									done();
								});
							});
						}, function(err) {
							console.error('failed to bulk-delete 20k documents:',err);
						});
					}, function(err) {
						console.error('failed to get all 30k docs for update:',err);
					});
				}, function(err) {
					console.error('failed to bulk-add 30k docs:',err);
				});
			});
		});
	});
});
