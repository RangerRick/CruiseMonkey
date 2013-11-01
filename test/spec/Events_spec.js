describe('cruisemonkey.Events', function() {
	var log         = null;
	var service     = null;
	var userService = null;
	var db          = null;
	var $q          = null;

	var dbName      = 'cmtest';
	var async       = new AsyncSpec(this);

	async.beforeEach(function(done) {
		console.log('destroying database ' + dbName);
		Pouch.destroy(dbName, function(err) {
			if (err) {
				console.log('failed to destroy database ' + dbName);
			} else {
				console.log('destroyed ' + dbName);
				done();
			}
		});
	});

	async.beforeEach(function(done) {
		module('cruisemonkey.Database', 'cruisemonkey.User', 'cruisemonkey.Events', function($provide) {
			$provide.value('config.logging.useStringAppender', true);
			$provide.value('config.database.name', dbName);
			$provide.value('config.database.replicate', false);
		});
		inject(['LoggingService', 'EventService', 'UserService', 'Database', '$q', function(LoggingService, EventService, UserService, Database, q) {
			log         = LoggingService;
			service     = EventService;
			userService = UserService;
			db          = Database;
			$q          = q;
		}]);
		done();
	});

	async.beforeEach(function(done) {
		// initialize test data
		db.database.bulkDocs({
			docs: [{
				'_id': '1',
				'type': 'event',
				'username': 'official',
				'summary': 'Murder',
				'description': 'You will be murdered.',
				'isPublic': true
			},
			{
				'_id': '2',
				'type': 'event',
				'username': 'ranger',
				'summary': 'Dying',
				'description': 'I will be dying.',
				'isPublic': true
			},
			{
				'_id': '3',
				'type': 'event',
				'username': 'bob',
				'summary': 'Living',
				'description': 'I am totally going to continue living.',
				'isPublic': true
			},
			{
				'_id': '4',
				'type': 'event',
				'username': 'ranger',
				'summary': 'Private',
				'description': "It's a priiiivate event, dancin' for money, do what you want it to do.",
				'isPublic': false
			},
			{
				'type': 'favorite',
				'username': 'ranger',
				'eventId': '3'
			}
			]
		}, function(err, response) {
			done();
		});
	});

	async.afterEach(function(done) {
		console.log('destroying database ' + dbName);
		Pouch.destroy(dbName, function(err) {
			if (err) {
				console.log('failed to destroy database ' + dbName);
			} else {
				console.log('destroyed ' + dbName);
				done();
			}
		});
	});

	describe("#getAllEvents", function() {
		async.it('should return all events', function(done) {
			expect(db).not.toBeNull();
			expect(service.getAllEvents).not.toBeUndefined();
			service.getAllEvents().then(function(result) {
				expect(result.length).toEqual(4);
				done();
			});
		});
	});

	describe("#getOfficialEvents", function() {
		async.it('should return all official events', function(done) {
			expect(db).not.toBeNull();
			expect(service.getOfficialEvents).not.toBeUndefined();
			service.getOfficialEvents().then(function(result) {
				expect(result.length).toEqual(1);
				expect(result[0].summary).toBe('Murder');
				done();
			});
		});
	});

	describe("#getUnofficialEvents", function() {
		async.it('should return only the events marked isPublic which are not official', function(done) {
			expect(db).not.toBeNull();
			expect(service.getUnofficialEvents).not.toBeUndefined();
			service.getUnofficialEvents().then(function(result) {
				expect(result.length).toEqual(2);
				done();
			});
		});
	});

	describe("#getUserEvents", function() {
		async.it('should return only the events for user "ranger"', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getUserEvents).not.toBeUndefined();
			$q.when(service.getUserEvents()).then(function(result) {
				expect(result.length).toEqual(2);
				expect(result[0]._id).toBe('2');
				expect(result[1]._id).toBe('4');
				done();
			});
		});
		async.it('should not return any events if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getUserEvents).not.toBeUndefined();
			$q.when(service.getUserEvents()).then(function(result) {
				expect(result.length).toEqual(0);
				done();
			});
		});
	});

	describe("#getMyEvents", function() {
		async.it('should return only the events that user "ranger" has created or favorited', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyEvents).not.toBeUndefined();
			service.getMyEvents().then(function(result) {
				expect(result.length).toEqual(3);
				expect(result[0]._id).toBe('2');
				expect(result[1]._id).toBe('4');
				expect(result[2]._id).toBe('3');
				expect(result[2].isFavorite).toBeTruthy();
				done();
			});
		});
		async.it('should return nothing when the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyEvents).not.toBeUndefined();
			service.getMyEvents().then(function(result) {
				expect(result.length).toEqual(0);
				done();
			});
		});
	});
	
	describe('#getMyFavorites', function() {
		async.it('should return a list of favorited ids', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyFavorites).not.toBeUndefined();
			service.getMyFavorites().then(function(result) {
				expect(result.length).toEqual(1);
				expect(result[0]).toBe('3');
				done();
			});
		});
		async.it('should return nothing when the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyFavorites).not.toBeUndefined();
			service.getMyFavorites().then(function(result) {
				expect(result.length).toEqual(0);
				done();
			});
		});
	});
	
	describe('#isFavorite', function() {
		async.it('should return true if the given id is a favorite while ranger is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.isFavorite).not.toBeUndefined();
			service.isFavorite('3').then(function(result) {
				expect(result).toBeTruthy();
				done();
			});
		});
		async.it('should return false if the given id is a favorite while ranger is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.isFavorite).not.toBeUndefined();
			service.isFavorite('3').then(function(result) {
				expect(result).not.toBeTruthy();
				done();
			});
		});
		async.it('should return false if the given id is a favorite of another user', function(done) {
			userService.save({'loggedIn': true, 'username':'bob', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.isFavorite).not.toBeUndefined();
			service.isFavorite('3').then(function(result) {
				expect(result).not.toBeTruthy();
				done();
			});
		});
	});
	
	describe('#addFavorite', function() {
		async.it('should create a new favorite in the database if ther user is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.addFavorite).not.toBeUndefined();
			service.addFavorite('1').then(function(result) {
				expect(result).not.toBeUndefined();
				service.isFavorite('1').then(function(result) {
					expect(result).toBeTruthy();
					done();
				});
			});
		});
		async.it('should not create a new favorite in the database if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.addFavorite).not.toBeUndefined();
			service.addFavorite('17').then(function(result) {
				expect(result).not.toBeTruthy();
				service.isFavorite('17').then(function(result) {
					expect(result).not.toBeTruthy();
					done();
				});
			});
		});
	});
	
	describe('#removeFavorite', function() {
		async.it('should not remove a favorite from the database if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.removeFavorite).not.toBeUndefined();
			service.removeFavorite('3').then(function(result) {
				expect(result).toBeUndefined();
				userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
				service.isFavorite('3').then(function(result) {
					expect(result).toBeTruthy();
					done();
				});
			});
		});
		async.it('should remove a favorite from the database if the user is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.removeFavorite).not.toBeUndefined();
			service.removeFavorite('3').then(function(result) {
				expect(result).not.toBeUndefined();
				service.isFavorite('3').then(function(result) {
					expect(result).not.toBeTruthy();
					done();
				});
			});
		});
	});
	
	describe('#addEvent', function() {
		async.it('should add a new event', function(done) {
			expect(db).not.toBeNull();
			expect(service.addEvent).not.toBeUndefined();
			service.addEvent({
				'summary': 'This is a test.',
				'description': 'A TEST, I SAY',
				'username': 'testUser'
			}).then(function(result) {
				expect(result).not.toBeUndefined();
				expect(result.username).not.toBeUndefined();
				expect(result.username).toBe('testUser');
				expect(result._id).not.toBeUndefined();
				expect(result._rev).not.toBeUndefined();
				done();
			});
		});
	});
	
	describe('#removeEvent', function() {
		async.it('should remove an existing event', function(done) {
			expect(db).not.toBeNull();
			expect(service.addEvent).not.toBeUndefined();
			service.getAllEvents().then(function(result) {
				expect(result.length).toEqual(4);

				var existingId = result[0]._id;
				var existingRev = parseInt(result[0]._rev.split('-')[0]);
				expect(existingRev).toBeGreaterThan(0);
				service.removeEvent(result[0]).then(function(result) {
					expect(result.ok).not.toBeUndefined();
					expect(result.ok).toBeTruthy();
					expect(result.id).toBe(existingId);
					expect(result.rev).not.toBeUndefined();
					
					var newRev = parseInt(result.rev.split('-')[0]);
					expect(newRev).toBe(existingRev + 1);

					done();
				});
			});
		});
	});
});
