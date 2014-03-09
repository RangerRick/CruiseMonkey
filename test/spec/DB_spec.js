describe('cruisemonkey.DB', function() {
	var async       = new AsyncSpec(this);
	jasmine.getEnv().defaultTimeoutInterval = 10000;

	var $q           = null,
		$timeout     = null,
		$rootScope   = null,
		$httpBackend = null,
		_db          = null;

	var dbCounter = 0;

	var doDbInit = function(done) {
		_db.setUserDatabase(userDb);
		_db.setRemoteDatabase(remoteDb);

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

			doDbSetup(userDb, pristineDb, remoteDb, done);

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

			_db.setUserDatabase(userDb);
			_db.setRemoteDatabase(remoteDb);

			_db.init().then(function(res) {
				expect(res).toBeGreaterThan(-1);
				var db = new PouchDB(userDb);
				db.get('_design/cruisemonkey', function(err, doc)  {
					expect(err).toBeNull();
					expect(doc).not.toBeNull();
					expect(doc.views).not.toBeUndefined();

					db.allDocs(function(err,res) {
						expect(err).toBeNull();
						expect(res).not.toBeNull();
						expect(res.rows).not.toBeUndefined();
						expect(res.rows.length).toEqual(1 + defaultDocs.length); // design doc + default docs
						done();
					});
				});
			}, function(err) {
				console.log(err);
			});
			$timeout.flush();
		});
	});

	describe("Design Doc: all-events", function() {
		async.it('should return all 5 events when queried', function(done) {
			doDbInit(function() {
				_db.local().query('all-events', {include_docs: true}).then(function(results) {
					//console.log('results=',results);
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(5);
					done();
				});
			});
		});
	});

	describe("Design Doc: official-events", function() {
		async.it('should return the 1 official event when queried', function(done) {
			doDbInit(function() {
				_db.local().query('official-events', {include_docs: true}).then(function(results) {
					//console.log('results=',results);
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(1);
					expect(results.rows[0].doc.summary).toBe('official event');
					done();
				});
			});
		});
	});

	describe("Design Doc: public-events", function() {
		async.it('should return the public events when queried', function(done) {
			doDbInit(function() {
				_db.local().query('public-events', {include_docs: true}).then(function(results) {
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

	describe("Design Doc: unofficial-events", function() {
		async.it('should return the unofficial events when queried', function(done) {
			doDbInit(function() {
				_db.local().query('unofficial-events', {include_docs: true}).then(function(results) {
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


	describe("Design Doc: user-events", function() {
		async.it('should return the events for user "rangerrick" when queried', function(done) {
			doDbInit(function() {
				_db.local().query('user-events', {include_docs: true, key: 'rangerrick'}).then(function(results) {
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
	
	describe("Design Doc: favorites", function() {
		async.it('should return all favorites when queried', function(done) {
			doDbInit(function() {
				_db.local().query('favorites', {include_docs: true}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(2);
					//expect(results.rows[0].id).toBe('triluna:rangerrick-public');
					done();
				});
			});
		});
		async.it('should return no favorites when queried for bob', function(done) {
			doDbInit(function() {
				_db.local().query('favorites', {include_docs: true, key: 'bob'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(0);
					done();
				});
			});
		});
		async.it('should return 1 favorite when queried for rangerrick', function(done) {
			doDbInit(function() {
				_db.local().query('favorites', {include_docs: true, key: 'rangerrick'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(1);
					done();
				});
			});
		});
		async.it('should return 1 favorite when queried for triluna', function(done) {
			doDbInit(function() {
				_db.local().query('favorites', {include_docs: true, key: 'triluna'}).then(function(results) {
					expect(results).toBeDefined();
					expect(results.rows).toBeDefined();
					expect(results.rows.length).toEqual(1);
					done();
				});
			});
		});
	})

	xdescribe("Bulk Sync", function() {
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
					expect(diff).toBeLessThan(5000); // this should take less than 3 seconds
					db = new PouchDB(userDb);
					db.allDocs(function(err,res) {
						expect(err).toBeNull();
						expect(res).not.toBeNull();
						expect(res.rows).not.toBeUndefined();
						expect(res.rows.length).toEqual(1 + newDocs.length + defaultDocs.length); // design doc + new docs + default docs
						done();
					});
				});
			});
		});
	});

	xdescribe("Bulk Sync with Existing Documents", function() {
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
							expect(diff).toBeLessThan(3000); // this should take less than 3 seconds
							db = new PouchDB(userDb);
							db.allDocs(function(err,res) {
								expect(err).toBeNull();
								expect(res).not.toBeNull();
								expect(res.rows).not.toBeUndefined();
								expect(res.rows.length).toEqual(1 + firsthalf.length + secondhalf.length + defaultDocs.length); // design doc + new docs + default docs
								done();
							});
						});
					});
				});
			});
		});
	});

	describe("Sync with Deleted Documents", function() {
		async.it('should sync deletes as well as adds', function(done) {
			doDbInit(function() {
				_db.local().query('favorites', {include_docs: true, key: 'triluna'}).then(function(results) {
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
								_db.local().query('favorites', {include_docs: true, key: 'triluna'}).then(function(results) {
									expect(results).toBeDefined();
									expect(results.rows).toBeDefined();
									expect(results.rows.length).toEqual(0);
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
