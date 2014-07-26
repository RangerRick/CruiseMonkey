describe('cruisemonkey.Database', function() {
	var async       = new AsyncSpec(this);
	var webroot     = 'http://localhost:5984/';

	jasmine.getEnv().defaultTimeoutInterval = 30000;

	var $q           = null,
		$timeout     = null,
		$rootScope   = null,
		$httpBackend = null,
		_database    = null;

	async.beforeEach(function(done) {
		module('cruisemonkey.Database', function($provide) {
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

	var createTestDb = function() {
		var deferred  = $q.defer();

		var pristine  = _database.get(webroot + 'test-pristine');

		var local     = _database.get('test-local');
		var remote    = _database.get(webroot + 'test-remote');
		var events    = _database.get('test-events');
		var favorites = _database.get('test-favorites');

		var toDestroy = [local, remote, events, favorites];
		var doDestroy = function(toDestroy) {
			var def = $q.defer();

			if (toDestroy.length === 0) {
				def.resolve();
			} else {
				var db = toDestroy.shift();
				//console.debug('doDestroy: ' + db.name);
				db.destroy().then(function(res) {
					doDestroy(toDestroy).then(function() {
						def.resolve();
					});
				}, function(err) {
					console.error('error destroying ' + db.name);
					def.reject(err);
				});
			}
			
			return def.promise;
		};

		doDestroy(toDestroy).then(function() {
			remote = _database.get(webroot + 'test-remote');
			remote.syncFrom(pristine).then(function() {
				remote.pouch().bulkDocs({
					docs: defaultDocs
				}, function(err, res) {
					$rootScope.safeApply(function() {
						if (err) {
							console.error('error bulk-adding docs:',err);
							deferred.reject(err);
						} else {
							//console.debug('finished bulk-adding docs to remote');
							deferred.resolve();
						}
					});
				});
			}, function(err) {
				console.error('failed to sync from ' + pristine.name);
				deferred.reject(err);
			});
		}, function(err) {
			console.error('failed to finish destroying existing databases:',err);
			deferred.reject(err);
		});

		return deferred.promise;
	};

	describe('#get(test-local)', function() {
		async.it('should pass if we could get a local database', function(done) {
			var db = _database.get('test-local');
			expect(db).toBeDefined();
			db.pouch().allDocs(function(err, res) {
				$rootScope.safeApply(function() {
					expect(err).toBeNull();
					expect(res).toBeDefined();
					expect(res['total_rows']).toBeDefined();
					expect(res['total_rows']).toEqual(jasmine.any(Number));
					done();
				});
			});
		});
	});

	describe('#destroy(test-local)', function() {
		async.it('should pass if we got no failures destroying a database', function(done) {
			var db = _database.get('test-local');
			expect(db).toBeDefined();
			db.destroy().then(function(res) {
				expect(res).toBeDefined();
				expect(res['ok']).toEqual(true);
				
				// destroy it a second time
				db.destroy().then(function(res) {
					expect(res).toBeDefined();
					expect(res['ok']).toEqual(true);
					done();
				});
			});
		});
	});

	describe('#updateFrom()', function() {
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
				var events = _database.get('test-events', 'cruisemonkey/events-public', 'cruisemonkey/events');

				expect(events.getView()).toEqual('cruisemonkey/events-public');
				expect(events.getFilter()).toEqual('cruisemonkey/events');

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
	});

	describe('#replicateFrom()', function() {
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
				var events = _database.get('test-events', 'cruisemonkey/events-public', 'cruisemonkey/events-public');

				expect(events.getView()).toEqual('cruisemonkey/events-public');
				expect(events.getFilter()).toEqual('cruisemonkey/events-public');

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
	});

	var findEvent = function(events, id) {
		for (var i=0; i < events.length; i++) {
			var ev = events[i];
			if (ev['id'] === id) {
				return ev;
			}
		}
		return null;
	};

	describe('#query()', function() {
		async.it('should pass if we can get all test events with a query', function(done) {
			createTestDb().then(function() {
				var remote = _database.get(webroot + 'test-remote');

				expect(remote).toBeDefined();

				remote.query('cruisemonkey/events-all', {include_docs: true}).then(function(res) {
					expect(res).toBeDefined();
					expect(res.rows.length).toEqual(5);

					var official = findEvent(res.rows, 'event:official-event');
					expect(official).toBeDefined();

					officialEvent = new CMEvent(official.doc);
					expect(officialEvent.getSummary()).toBe('official event');

					done();
				});
			}, function(err) {
				console.debug('failed to create test db:',err);
			});
		});
	});

	describe('Syncing', function() {
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

				remote.bulkDocs(objs).then(function(res) {
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
						remote.bulkDocs(objs).then(function(res) {
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