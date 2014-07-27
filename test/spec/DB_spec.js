xdescribe('cruisemonkey.DB', function() {
	var async       = new AsyncSpec(this);
	jasmine.getEnv().defaultTimeoutInterval = 15000;

	var $q           = null,
		$timeout     = null,
		$rootScope   = null,
		$httpBackend = null,
		_db          = null;

	var dbCounter = 0;

	var doDbInit = function(done) {
		_db.setRemoteDatabase(remoteDb);
		_db.setEventsDatabase(eventsDb);

		_db.init().then(function(res) {
			expect(res).toBeGreaterThan(-1);
			done();
		});
		if ($timeout) {
			$timeout.flush();
		}
	};

	async.beforeEach(function(done) {
		module('cruisemonkey.DB', function($provide) {
			//$provide.value('config.upgrade', false);
		});
		inject(['$q', '$timeout', '$rootScope', '$httpBackend', '_db', function(q, timeout, rootScope, httpBackend, db) {
			$q = q;
			$timeout = timeout;
			$rootScope = rootScope;
			$httpBackend = httpBackend;
			_db = db;

			doDbSetup(done);

			/*
			backend.when('GET', 'http://jccc4.rccl.com/cruisemonkey-jccc4').respond(500, '');
			db.initialize().then(function() {
				done();
			});
			$timeout.flush();
			*/
		}]);
	});

	describe("Initialize Database", function() {
		async.it('should return true if able to initialize the database', function(done) {
			expect(_db).not.toBeNull();

			_db.setRemoteDatabase(remoteDb);
			_db.setEventsDatabase(eventsDb);

			_db.init().then(function(res) {
				expect(res).toBeGreaterThan(-1);
				var db = new PouchDB(eventsDb);
				db.get('_design/cruisemonkey', function(err, doc)  {
					expect(err).toBeNull();
					expect(doc).not.toBeNull();
					expect(doc.views).not.toBeUndefined();

					db.allDocs(function(err,res) {
						expect(err).toBeNull();
						expect(res).not.toBeNull();
						expect(res.rows).not.toBeUndefined();
						console.log(res.rows);
						expect(res.rows.length).toEqual(1 + 1 + defaultEventDocs.length); // design doc + syncInfo + event docs
						done();
					});
				});
			}, function(err) {
				console.log(err);
			});
			$timeout.flush();
		});
	});

	xdescribe("Design Doc: events-all", function() {
		async.it('should return all 5 events when queried', function(done) {
			doDbInit(function() {
				_db.events().query('events-all', {include_docs: true}).then(function(results) {
					//console.log('results=',results);
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(5);
					done();
				},function(err) {
					console.log(err);
				});
			});
		});
	});

	xdescribe("Design Doc: events-official", function() {
		async.it('should return the 1 official event when queried', function(done) {
			doDbInit(function() {
				_db.events().query('events-official', {include_docs: true}).then(function(results) {
					//console.log('results=',results);
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(1);
					expect(results.rows[0].doc.summary).toBe('official event');
					done();
				}, function(err) {
					console.log(err);
				});
			});
		});
	});

	xdescribe("Design Doc: events-public", function() {
		async.it('should return the public events when queried', function(done) {
			doDbInit(function() {
				_db.events().query('events-public', {include_docs: true}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(3);

					var ids = [];
					for (var i = 0; i < results.rows.length; i++) {
						ids.push(results.rows[i].id);
					}
					
					expect(ids).toContain('official-event');
					expect(ids).toContain('rangerrick-public');
					expect(ids).toContain('triluna-public');
					done();
				});
			});
		});
	});

	xdescribe("Design Doc: events-unofficial", function() {
		async.it('should return the unofficial events when queried', function(done) {
			doDbInit(function() {
				_db.events().query('events-unofficial', {include_docs: true}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(2);

					var ids = [];
					for (var i = 0; i < results.rows.length; i++) {
						ids.push(results.rows[i].id);
					}
					
					expect(ids).toContain('rangerrick-public');
					expect(ids).toContain('triluna-public');
					done();
				});
			});
		});
	});


	xdescribe("Design Doc: events-user", function() {
		async.it('should return the events for user "rangerrick" when queried', function(done) {
			doDbInit(function() {
				_db.events().query('events-user', {include_docs: true, key: 'rangerrick'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(2);

					var ids = [];
					for (var i = 0; i < results.rows.length; i++) {
						ids.push(results.rows[i].id);
					}
					
					expect(ids).toContain('rangerrick-public');
					expect(ids).toContain('rangerrick-private');
					done();
				});
			});
		});
	});
	
	xdescribe("Design Doc: replication", function() {
		async.it('should return all events', function(done) {
			doDbInit(function() {
				_db.events().query('events-replication', {include_docs: true}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(defaultEventDocs.length);

					var ids = [];
					for (var i = 0; i < results.rows.length; i++) {
						ids.push(results.rows[i].id);
					}
					
					expect(ids).toContain('rangerrick-public');
					expect(ids).toContain('rangerrick-private');
					done();
				});
			});
		});
	});
	
	xdescribe("Design Doc: favorites-all", function() {
		async.it('should fail when no favorites DB is configured', function(done) {
			_db.setFavoritesDatabase(undefined);
			_db.setUsername(undefined);
			doDbInit(function() {
				expect(_db.favorites().ready).toBeDefined();
				_db.favorites().ready().then(function() {
				}, function(err) {
					done();
				});
			});
		});
		async.it('should return no favorites when queried for bob, while logged in as bob', function(done) {
			_db.setFavoritesDatabase(favoritesDb);
			_db.setUsername('bob');
			doDbInit(function() {
				_db.favorites().query('favorites-all', {include_docs: true, key: 'bob'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(0);
					done();
				});
			});
		});
		async.it('should return 1 favorite when queried for rangerrick, while logged in as rangerrick', function(done) {
			_db.setFavoritesDatabase(favoritesDb);
			_db.setUsername('rangerrick');
			doDbInit(function() {
				_db.favorites().query('favorites-all', {include_docs: true, key: 'rangerrick'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(1);
					done();
				});
			});
		});
		async.it('should return 0 favorites when queried for triluna while logged in as rangerrick', function(done) {
			_db.setFavoritesDatabase(favoritesDb);
			_db.setUsername('rangerrick');
			doDbInit(function() {
				_db.favorites().query('favorites-all', {include_docs: true, key: 'triluna'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(0);
					done();
				});
			});
		});
	})

	xxdescribe("Bulk Sync", function() {
		var newDocs = [];
		for (var i = 0; i < 5000; i++) {
			newDocs.push({
				'type': 'event',
				'username': 'official',
				'summary': 'official event ' + i,
				'start': '2012-01-01 00:00',
				'isPublic': true
			});
		}

		async.it('should be fast to sync thousands of documents', function(done) {
			var db = new PouchDB(remoteDb);
			db.bulkDocs({
				docs: newDocs
			}, function(err, results) {
				expect(err).toBeNull();
				expect(results).toBeDefined();
				var start = moment();
				doDbInit(function() {
					var diff = moment().diff(start);
					expect(diff).toBeLessThan(15000); // this should take less than 15 seconds
					db = new PouchDB(eventsDb);
					db.allDocs(function(err,res) {
						expect(err).toBeNull();
						expect(res).not.toBeNull();
						expect(res.rows).not.toBeUndefined();
						expect(res.rows.length).toEqual(1 + newDocs.length + defaultEventDocs.length); // design doc + new docs + default event docs
						done();
					});
				});
			});
		});
	});

	xxdescribe("Bulk Sync with Existing Documents", function() {
		var firsthalf = [], secondhalf = [], ev;
		for (var i = 0; i < 5000; i++) {
			ev = {
				'type': 'event',
				'username': 'official',
				'summary': 'official event ' + i,
				'start': '2012-01-01 00:00',
				'isPublic': true
			};

			if (i < 2500) {
				firsthalf.push(ev);
			} else {
				secondhalf.push(ev);
			}
		}

		async.it('should be fast to sync thousands of documents after thousands are already synced', function(done) {
			var db = new PouchDB(remoteDb);
			// dump the first 2500 events
			db.bulkDocs({
				docs: firsthalf
			}, function(err, results) {
				// initialize; this should do a bulk get
				doDbInit(function() {
					// then dump the next 2500
					db.bulkDocs({
						docs: secondhalf
					}, function(err, results) {
						expect(err).toBeNull();
						expect(results).toBeDefined();

						// this should do batches of 500 at a time
						var start = moment();
						doDbInit(function() {
							var diff = moment().diff(start);
							expect(diff).toBeLessThan(15000); // this should take less than 15 seconds
							db = new PouchDB(eventsDb);
							db.allDocs(function(err,res) {
								expect(err).toBeNull();
								expect(res).not.toBeNull();
								expect(res.rows).not.toBeUndefined();
								expect(res.rows.length).toEqual(1 + firsthalf.length + secondhalf.length + defaultEventDocs.length); // design doc + new docs + default event docs
								done();
							});
						});
					});
				});
			});
		});
	});

	xdescribe("Sync with Deleted Documents", function() {
		async.it('should sync deletes as well as adds', function(done) {
			_db.setFavoritesDatabase(favoritesDb);
			_db.setUsername('triluna');
			doDbInit(function() {
				_db.favorites().query('favorites-all', {include_docs: true, key: 'triluna'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(1);

					var db = new PouchDB(remoteDb);
					db.get('favorite:triluna:rangerrick-public', function(err,res) {
						expect(err).toBeNull();
						expect(res).not.toBeNull();
						db.remove(res, function(err,res) {
							expect(err).toBeNull();
							expect(res).not.toBeNull();
							doDbInit(function() {
								// triluna's 1 favorite should now be deleted
								_db.favorites().query('favorites-all', {include_docs: true, key: 'triluna'}).then(function(results) {
									expect(results).toBeDefined();
									expect(results.rows).toBeDefined();
									expect(results.rows.length).toEqual(0);
									done();
								}, function(err) {
									expect(err).not.toBeDefined();
									done();
								});
							});
						});
					});
				});
			});
		});
	});
});
