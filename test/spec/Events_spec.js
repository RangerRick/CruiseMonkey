describe('cruisemonkey.Events', function() {
	var log         = null;
	var service     = null;
	var userService = null;
	var db          = null;
	var $q          = null;
	var $timeout    = null;
	var $rootScope  = null;

	var dbName      = 'cmunittest';
	var async       = new AsyncSpec(this);

	var getEvents = function(results) {
		var ret = {};
		if (!results) {
			return ret;
		}
		angular.forEach(results, function(item) {
			if (item !== undefined && item.getId !== undefined) {
				ret[item.getId()] = item;
			}
		});
		return ret;
	};

	async.beforeEach(function(done) {
		module('cruisemonkey.Database', 'cruisemonkey.User', 'cruisemonkey.Events', function($provide) {
			$provide.value('config.logging.useStringAppender', true);
			$provide.value('config.database.host', 'localhost');
			$provide.value('config.database.name', dbName);
			$provide.value('config.database.replicate', false);
			$provide.value('config.database.refresh', 20000);
			$provide.value('config.twitarr.root', 'https://twitarr.rylath.net/');
			$provide.value('config.upgrade', false);
		});
		inject(['LoggingService', 'EventService', 'UserService', 'Database', '$q', '$timeout', '$rootScope', function(LoggingService, EventService, UserService, Database, q, timeout, scope) {
			log         = LoggingService;
			service     = EventService;
			userService = UserService;
			db          = Database;
			$q          = q;
			$timeout    = timeout;
			$rootScope  = scope;

			db.initialize().then(function() {
				done();
			});
			$timeout.flush();
		}]);
	});

	async.beforeEach(function(done) {
		// initialize test data
		userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
		$q.when(db.getDatabase()).then(function(database) {
			database.bulkDocs({
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
					'eventId': '1'
				},
				{
					'type': 'favorite',
					'username': 'ranger',
					'eventId': '3'
				},
				{
					'type': 'favorite',
					'username': 'bob',
					'eventId': '1'
				},
				{
					'type': 'favorite',
					'username': 'bob',
					'eventId': '2'
				}
				]
			}, function(err, response) {
				done();
			});			
		});
		$timeout.flush();
	});

	async.afterEach(function(done) {
		console.log('destroying database ' + dbName);
		PouchDB.destroy(dbName, function(err) {
			if (err) {
				console.log('failed to destroy database ' + dbName);
				done();
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
				var items = getEvents(result);
				angular.forEach(items, function(item) {
					console.log(item.toString());
				});
				expect(result.length).toEqual(4);
				expect(items).not.toBeNull();
				expect(items['1']).not.toBeNull();
				expect(items['1'].getSummary()).toBe('Murder');
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
	});

	describe("#getOfficialEvents", function() {
		async.it('should return all official events', function(done) {
			expect(db).not.toBeNull();
			expect(service.getOfficialEvents).not.toBeUndefined();
			service.getOfficialEvents().then(function(result) {
				expect(result.length).toEqual(1);
				var items = getEvents(result);
				expect(items['1']).not.toBeNull();
				expect(items['1'].getSummary()).toBe('Murder');
				expect(items['1'].isFavorite()).toBeTruthy();
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
	});

	describe("#getUnofficialEvents", function() {
		async.it('should return only the events marked isPublic which are not official', function(done) {
			expect(db).not.toBeNull();
			expect(service.getUnofficialEvents).not.toBeUndefined();
			service.getUnofficialEvents().then(function(result) {
				var items = getEvents(result);
				expect(result.length).toEqual(2);
				expect(items['2']).not.toBeNull();
				expect(items['3']).not.toBeNull();
				expect(items['2'].isFavorite()).not.toBeTruthy();
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
	});

	describe("#getUserEvents", function() {
		async.it('should return only the events for user "ranger"', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getUserEvents).not.toBeUndefined();
			service.getUserEvents().then(function(result) {
				expect(result.length).toEqual(2);
				var items = getEvents(result);
				expect(items['2']).not.toBeNull();
				expect(items['2'].isFavorite()).not.toBeTruthy();
				expect(items['4']).not.toBeNull();
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
		async.it('should not return any events if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getUserEvents).not.toBeUndefined();
			service.getUserEvents().then(function(result) {
			}, function(err) {
				expect(err).toBe('EventService.getUserEvent(): user not logged in');
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
	});

	describe("#getMyEvents", function() {
		async.it('should return only the events that user "ranger" has created or favorited', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyEvents).not.toBeUndefined();
			service.getMyEvents().then(function(result) {
				expect(result.length).toEqual(4);
				var items = getEvents(result);
				expect(items['1']).not.toBeNull();
				expect(items['1'].isFavorite()).toBeTruthy();
				expect(items['2']).not.toBeNull();
				expect(items['2'].isFavorite()).not.toBeTruthy();
				expect(items['3']).not.toBeNull();
				expect(items['3'].isFavorite()).toBeTruthy();
				expect(items['4']).not.toBeNull();
				expect(items['4'].isFavorite()).not.toBeTruthy();
				done();
			});
			$rootScope.$apply();
		});
		async.it('should return nothing when the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyEvents).not.toBeUndefined();
			service.getMyEvents().then(function() {
			}, function(err) {
				expect(err).toBe('EventService.getMyEvents(): user not logged in');
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
	});

	describe('#getMyFavorites', function() {
		async.it('should return a list of favorited ids', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyFavorites).not.toBeUndefined();
			service.getMyFavorites().then(function(result) {
				expect(result.length).toEqual(2);
				var items = getEvents(result);
				expect(items['1']).not.toBeNull();
				expect(items['3']).not.toBeNull();
				done();
			});
			$rootScope.$apply();
		});
		async.it('should return nothing when the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.getMyFavorites).not.toBeUndefined();
			service.getMyFavorites().then(function() {
			}, function(err) {
				expect(err).toBe('EventService.getMyFavorites(): user not logged in');
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
	});

	describe('#isFavorite', function() {
		async.it('should return true if the given id is a favorite while ranger is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.isFavorite).not.toBeUndefined();
			service.isFavorite('3').then(function(result) {
				expect(result).toBeTruthy();
				service.isFavorite('2').then(function(result) {
					expect(result).not.toBeTruthy();
					done();
				});
			});
			$rootScope.$apply();
		});
		async.it('should return false if the given id is a favorite while ranger is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.isFavorite).not.toBeUndefined();
			service.isFavorite('3').then(function() {
			}, function(err) {
				expect(err).toBe('EventService.isFavorite(): user not logged in');
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
		async.it('should return false if the given id is a favorite of another user', function(done) {
			userService.save({'loggedIn': true, 'username':'bob', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.isFavorite).not.toBeUndefined();
			service.isFavorite('3').then(function(result) {
				expect(result).not.toBeTruthy();
				done();
			});
			$rootScope.$apply();
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
			$rootScope.$apply();
		});
		async.it('should not create a new favorite in the database if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.addFavorite).not.toBeUndefined();
			service.addFavorite('17').then(function(result) {
			}, function(err) {
				expect(err).toBe('EventService.addFavorite(): user not logged in, or no eventId passed');
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
	});

	describe('#removeFavorite', function() {
		async.it('should not remove a favorite from the database if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.removeFavorite).not.toBeUndefined();
			service.removeFavorite('3').then(function(result) {
			}, function(err) {
				expect(err).toBe('EventService.removeFavorite(): user not logged in, or no eventId passed');
				done();
			});
			$rootScope.$apply();
			$timeout.flush();
		});
		async.it('should remove a favorite from the database if the user is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'ranger', 'password':'whatever'});
			expect(db).not.toBeNull();
			expect(service.removeFavorite).not.toBeUndefined();
			service.removeFavorite('3').then(function(result) {
				expect(result).not.toBeUndefined();
				expect(result).toEqual(1);
				service.isFavorite('3').then(function(result) {
					expect(result).not.toBeUndefined();
					expect(result).toBe(false);
					done();
				});
			});
			$rootScope.$apply();
			$timeout.flush();
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
				expect(result.getUsername()).not.toBeUndefined();
				expect(result.getUsername()).toBe('testUser');
				expect(result.getId()).not.toBeUndefined();
				expect(result.getRevision()).not.toBeUndefined();
				done();
			});
			$rootScope.$apply();
		});
	});
	
	describe('#updateEvent', function() {
		async.it('should update an existing event', function(done) {
			expect(db).not.toBeNull();
			expect(service.addEvent).not.toBeUndefined();
			expect(service.updateEvent).not.toBeUndefined();
			service.addEvent({
				'summary': 'This is a test.',
				'description': 'A TEST, I SAY',
				'username': 'testUser'
			}).then(function(ev) {
				expect(ev).not.toBeUndefined();
				var oldRevision = ev.getRevision();
				expect(ev.getDescription()).toBe('A TEST, I SAY');
				expect(oldRevision).not.toBeUndefined();
				ev.setDescription('REALLY, A TEST!!');
				service.updateEvent(ev).then (function(modified) {
					expect(modified.getUsername()).not.toBeUndefined();
					expect(modified.getUsername()).toBe('testUser');
					expect(modified.getId()).not.toBeUndefined();
					expect(modified.getRevision()).not.toBeUndefined();
					expect(modified.getRevision()).not.toBe(oldRevision);
					expect(modified.getDescription()).toBe('REALLY, A TEST!!');
					done();
				});
			});
			$rootScope.$apply();
		});
	});
	
	describe('#removeEvent', function() {
		async.it('should remove an existing event', function(done) {
			expect(db).not.toBeNull();
			expect(service.addEvent).not.toBeUndefined();
			service.getAllEvents().then(function(result) {
				expect(result.length).toEqual(4);

				var items = getEvents(result);

				var existingId = '1';
				var existingRev = parseInt(items['1'].getRevision().split('-')[0]);
				expect(existingRev).toBeGreaterThan(0);
				service.removeEvent(items['1']).then(function(result) {
					expect(result.ok).not.toBeUndefined();
					expect(result.ok).toBeTruthy();
					expect(result.id).toBe('1');
					expect(result.rev).not.toBeUndefined();
					
					var newRev = parseInt(result.rev.split('-')[0]);
					expect(newRev).toBe(existingRev + 1);

					done();
				});
			});
			$rootScope.$apply();
		});
	});
	
	describe('CMEvent#toEditableBean', function() {
		async.it('should create a bean that matches the event data', function(done) {
			var ev = new CMEvent();
			ev.setId('1');
			ev.setRevision('12345');
			ev.setSummary('foo');
			ev.setDescription('bar');
			ev.setStartString('2010-01-01 00:00');
			ev.setEndString('2010-01-02 00:00');
			ev.setUsername('ranger');
			ev.setLocation('here');
			ev.setPublic(false);

			var bean = ev.toEditableBean();
			expect(bean.id).toBe('1');
			expect(bean.revision).toBe('12345');
			expect(bean.summary).toBe('foo');
			expect(bean.description).toBe('bar');
			expect(bean.startDate).toBe('2010-01-01 00:00');
			expect(bean.endDate).toBe('2010-01-02 00:00');
			expect(bean.location).toBe('here');
			expect(bean.isPublic).toBe(false);

			ev.setStart(moment('2010-01-01 00:00'));
			ev.setEnd(moment('2010-01-01 01:00'));

			bean = ev.toEditableBean();
			expect(bean.startDate).toBe('2010-01-01 00:00');
			expect(bean.endDate).toBe('2010-01-01 01:00');

			done();
		});
	});

	describe('CMEvent#fromEditableBean', function() {
		async.it('should update the event to have matching bean data', function(done) {
			var ev = new CMEvent();
			ev.setId('2');
			ev.setRevision('23456');
			ev.setSummary('foo2');
			ev.setDescription('bar2');
			ev.setStartString('2010-02-01 00:00');
			ev.setEndString('2010-02-02 00:00');
			ev.setUsername('ranger');
			ev.setLocation('there');
			ev.setPublic(true);
			
			ev.fromEditableBean({
				id: '1',
				revision: '12345',
				summary: 'foo',
				description: 'bar',
				startDate: '2010-01-01 00:00',
				endDate: '2010-01-02 00:00',
				location: 'here',
				isPublic: false
			});

			expect(ev.getId()).toBe('1');
			expect(ev.getRevision()).toBe('12345');
			expect(ev.getSummary()).toBe('foo');
			expect(ev.getDescription()).toBe('bar');
			expect(ev.getStartString()).toBe('2010-01-01 00:00');
			expect(ev.getEndString()).toBe('2010-01-02 00:00');
			expect(ev.getUsername()).toBe('ranger');
			expect(ev.getLocation()).toBe('here');
			expect(ev.isPublic()).toBe(false);

			done();
		});
	});
});
