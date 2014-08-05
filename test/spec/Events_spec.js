/* global describe: true */

describe('cruisemonkey.Events', function() {
	'use strict';

	/* global AsyncSpec: true */
	/* global webroot: true */
	/* global defaultDocs: true */
	/* global CMEvent: true */
	/* global CMDay: true */
	/* global moment: true */

	var service      = null;
	var userService  = null;
	var $q           = null;
	var $timeout     = null;
	var $rootScope   = null;
	var $httpBackend = null;
	var database     = null;

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
			} else {
				console.log('warning: no getId():',item);
			}
		});
		return ret;
	};

	var doSync = function() {
		var deferred = $q.defer();

		var remote = database.get(webroot + dbName);
		service.syncFrom(remote).then(function() {
			deferred.resolve();
		});

		return deferred.promise;
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
		inject(['EventService', 'UserService', '_database', '$q', '$timeout', '$rootScope', '$httpBackend', function(EventService, UserService, _database, q, timeout, scope, backend) {
			service      = EventService;
			userService  = UserService;
			database     = _database;
			$q           = q;
			$timeout     = timeout;
			$rootScope   = scope;
			$httpBackend = backend;

			backend.when('GET', 'http://jccc4.rccl.com/cruisemonkey-jccc4').respond(500, '');

			var pristine  = database.get(webroot + 'test-pristine');
			var remote    = database.get(webroot + dbName);
			var events    = database.get(dbName + '.events');
			var favorites = database.get(dbName + '.favorites');

			var destroyed = [remote.destroy(), events.destroy(), favorites.destroy()];
			$q.all(destroyed).then(function() {
				remote.syncFrom(pristine).then(function() {
					remote.bulkDocs(defaultDocs).then(function() {
						doSync().then(function() {
							done();
						});
					});
				});
			});
		}]);
	});

	describe('#getAllEvents', function() {
		async.it('should return all events', function(done) {
			expect(service.getAllEvents).toBeDefined();
			service.getAllEvents().then(function(result) {
				var items = getEvents(result);
				expect(result.length).toEqual(5);
				expect(items).toBeDefined();
				expect(items['event:official-event']).toBeDefined();
				expect(items['event:official-event'].getSummary()).toBe('official event');
				done();
			});
			$rootScope.$apply();
		});
	});

	describe('#getOfficialEvents', function() {
		async.it('should return all official events', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getOfficialEvents).toBeDefined();

			doSync().then(function() {
				service.getOfficialEvents().then(function(result) {
					expect(result.length).toEqual(1);
					var items = getEvents(result);
					expect(items['event:official-event']).toBeDefined();
					expect(items['event:official-event'].getSummary()).toBe('official event');
					expect(items['event:official-event'].isFavorite()).toBeTruthy();
					done();
				}, function(err) {
					console.debug('failed:',err);
				});
			});

			$rootScope.$apply();
		});
	});

	describe('#getUnofficialEvents', function() {
		async.it('should return only the events marked isPublic which are not official', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getUnofficialEvents).toBeDefined();

			doSync().then(function() {
				service.getUnofficialEvents().then(function(result) {
					var items = getEvents(result);
					expect(result.length).toEqual(2);
					expect(items['event:rangerrick-public']).toBeDefined();
					expect(items['event:triluna-public']).toBeDefined();
					expect(items['event:rangerrick-public'].isFavorite()).toBeFalsy();
					expect(items['event:triluna-public'].isFavorite()).toBeFalsy();
					done();
				});
			});

			$rootScope.$apply();
		});
	});

	describe('#getUserEvents', function() {
		async.it('should return only the events for user "rangerrick"', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getUserEvents).toBeDefined();

			doSync().then(function() {
				service.getUserEvents().then(function(result) {
					expect(result.length).toEqual(2);
					var items = getEvents(result);
					expect(items['event:rangerrick-public']).toBeDefined();
					expect(items['event:rangerrick-public'].isFavorite()).toBeFalsy();
					expect(items['event:rangerrick-public'].isPublic()).toBeTruthy();
					expect(items['event:rangerrick-private']).toBeDefined();
					expect(items['event:rangerrick-private'].isFavorite()).toBeFalsy();
					expect(items['event:rangerrick-private'].isPublic()).toBeFalsy();
					done();
				});
			});

			$rootScope.$apply();
		});

		async.it('should not return any events if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getUserEvents).toBeDefined();

			doSync().then(function() {
				service.getUserEvents().then(function(result) {
					console.debug('result=',result);
				}, function(err) {
					expect(err).toBe('EventService.getUserEvent(): user not logged in');
					done();
				});
				$timeout.flush();
			});

			$rootScope.$apply();
		});
	});

	describe('#getMyEvents', function() {
		async.it('should return only the events that user "rangerrick" has created or favorited', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getMyEvents).toBeDefined();

			doSync().then(function() {
				service.getMyEvents().then(function(result) {
					expect(result.length).toEqual(3);
					var items = getEvents(result);
					expect(items['event:official-event']).toBeDefined();
					expect(items['event:official-event'].isFavorite()).toBeTruthy();
					expect(items['event:rangerrick-public']).toBeDefined();
					expect(items['event:rangerrick-public'].isFavorite()).toBeFalsy();
					expect(items['event:rangerrick-private']).toBeDefined();
					expect(items['event:rangerrick-private'].isFavorite()).toBeFalsy();
					done();
				});
			});

			$rootScope.$apply();
		});

		async.it('should return nothing when the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getMyEvents).toBeDefined();

			doSync().then(function() {
				service.getMyEvents().then(function() {
				}, function(err) {
					expect(err).toBe('EventService.getMyEvents(): user not logged in');
					done();
				});
				$timeout.flush();
			});

			$rootScope.$apply();
		});
	});

	describe('#getMyFavorites', function() {
		async.it('should return a list of favorited ids', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getMyFavorites).toBeDefined();

			doSync().then(function() {
				service.getMyFavorites().then(function(result) {
					expect(result.length).toEqual(1);
					var items = getEvents(result);
					expect(items['event:official-event']).toBeDefined();
					expect(items['event:official-event']).toBeDefined();
					done();
				});
			});

			$rootScope.$apply();
		});

		async.it('should return nothing when the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'rangerrick', 'password':'whatever'});
			expect(service.getMyFavorites).toBeDefined();

			doSync().then(function() {
				service.getMyFavorites().then(function() {
				}, function(err) {
					expect(err).toBe('EventService.getMyFavorites(): user not logged in');
					done();
				});
				$timeout.flush();
			});

			$rootScope.$apply();
		});
	});

	describe('#isFavorite', function() {
		async.it('should return true if the given id is a favorite while rangerrick is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.isFavorite).toBeDefined();

			doSync().then(function() {
				service.isFavorite('event:official-event').then(function(result) {
					console.debug('checking official-event');
					expect(result).toBeTruthy();
					service.isFavorite('event:triluna-public').then(function(result) {
						console.debug('checking triluna-public');
						expect(result).toBeFalsy();
						done();
					});
				});
			});

			$rootScope.$apply();
		});

		async.it('should return false if the given id is a favorite while rangerrick is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'rangerrick', 'password':'whatever'});
			expect(service.isFavorite).toBeDefined();

			doSync().then(function() {
				service.isFavorite('event:official-event').then(function() {
				}, function(err) {
					expect(err).toBe('EventService.isFavorite(): user not logged in');
					done();
				});
				$timeout.flush();
			});

			$rootScope.$apply();
		});

		async.it('should return false if the given id is a favorite of another user', function(done) {
			userService.save({'loggedIn': true, 'username':'bob', 'password':'whatever'});
			expect(service.isFavorite).toBeDefined();

			doSync().then(function() {
				service.isFavorite('event:rangerrick-public').then(function(result) {
					expect(result).toBeFalsy();
					done();
				});
			});

			$rootScope.$apply();
		});
	});

	describe('#addFavorite', function() {
		async.it('should create a new favorite in the database if ther user is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.addFavorite).toBeDefined();
			doSync().then(function() {
				service.isFavorite('event:triluna-public').then(function(result) {
					expect(result).toBeDefined();
					expect(result).toBeFalsy();
					service.addFavorite('event:triluna-public').then(function(result) {
						expect(result).toBeDefined();
						service.isFavorite('event:triluna-public').then(function(result) {
							expect(result).toBeTruthy();
							done();
						});
					});
				});
			});
			$rootScope.$apply();
		});

		async.it('should not create a new favorite in the database if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'rangerrick', 'password':'whatever'});
			expect(service.addFavorite).toBeDefined();

			doSync().then(function() {
				service.addFavorite('17').then(function() {
				}, function(err) {
					expect(err).toBe('EventService.addFavorite(): user not logged in, or no eventId passed');
					done();
				});
				$timeout.flush();
			});

			$rootScope.$apply();
		});
	});

	describe('#removeFavorite', function() {
		async.it('should not remove a favorite from the database if the user is not logged in', function(done) {
			userService.save({'loggedIn': false, 'username':'rangerrick', 'password':'whatever'});
			expect(service.removeFavorite).toBeDefined();

			doSync().then(function() {
				service.removeFavorite('event:official-event').then(function() {
				}, function(err) {
					expect(err).toBe('EventService.removeFavorite(): user not logged in, or no eventId passed');
					done();
				});
				$timeout.flush();
			});

			$rootScope.$apply();
		});
		async.it('should remove a favorite from the database if the user is logged in', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.removeFavorite).toBeDefined();

			doSync().then(function() {
				service.removeFavorite('event:official-event').then(function(result) {
					expect(result).toBeDefined();
					expect(result).toEqual(1);
					service.isFavorite('event:official-event').then(function(result) {
						expect(result).toBeDefined();
						expect(result).toBe(false);
						done();
					});
				});
			});

			$rootScope.$apply();
		});
	});

	describe('#addEvent', function() {
		async.it('should add a new event', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.addEvent).toBeDefined();

			doSync().then(function() {
				service.addEvent({
					'summary': 'This is a test.',
					'description': 'A TEST, I SAY',
					'username': 'testUser'
				}).then(function(result) {
					expect(result).toBeDefined();
					expect(result.getUsername()).toBeDefined();
					expect(result.getUsername()).toBe('testUser');
					expect(result.getId()).toBeDefined();
					expect(result.getRevision()).toBeDefined();
					done();
				});
			});

			$rootScope.$apply();
		});
	});

	describe('#updateEvent', function() {
		async.it('should update an existing event', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.addEvent).toBeDefined();
			expect(service.updateEvent).toBeDefined();

			doSync().then(function() {
				service.addEvent({
					'summary': 'This is a test.',
					'description': 'A TEST, I SAY',
					'username': 'testUser'
				}).then(function(ev) {
					expect(ev).toBeDefined();
					var oldRevision = ev.getRevision();
					expect(ev.getDescription()).toBe('A TEST, I SAY');
					expect(oldRevision).toBeDefined();
					ev.setDescription('REALLY, A TEST!!');
					service.updateEvent(ev).then (function(modified) {
						expect(modified.getUsername()).toBeDefined();
						expect(modified.getUsername()).toBe('testUser');
						expect(modified.getId()).toBeDefined();
						expect(modified.getRevision()).toBeDefined();
						expect(modified.getRevision()).not.toBe(oldRevision);
						expect(modified.getDescription()).toBe('REALLY, A TEST!!');
						done();
					});
				});
			});

			$rootScope.$apply();
		});
	});

	describe('#removeEvent', function() {
		async.it('should remove an existing event', function(done) {
			userService.save({'loggedIn': true, 'username':'rangerrick', 'password':'whatever'});
			expect(service.addEvent).toBeDefined();

			doSync().then(function() {
				service.getAllEvents().then(function(result) {
					var items = getEvents(result);

					var existingId = 'event:rangerrick-private';
					var existingRev = parseInt(items[existingId].getRevision().split('-')[0]);
					expect(existingRev).toBeGreaterThan(0);
					service.removeEvent(items[existingId]).then(function(result) {
						expect(result.ok).toBeDefined();
						expect(result.ok).toBeTruthy();
						expect(result.id).toBe(existingId);
						expect(result.rev).toBeDefined();

						var newRev = parseInt(result.rev.split('-')[0]);
						expect(newRev).toBe(existingRev + 1);

						done();
					});
				});
			});

			$rootScope.$apply();
		});
	});

	describe('#getEventForTime', function() {
		it('Should find the next event in a simple list of events with only start times.', function() {
			var eventList = [
				new CMEvent({
					'_id': 'a',
					'summary': 'A',
					'start': '2010-01-01 00:00'
				}),
				new CMEvent({
					'_id': 'b',
					'summary': 'B',
					'start': '2010-02-01 00:00'
				}),
				new CMEvent({
					'_id': 'c',
					'summary': 'C',
					'start': '2010-03-01 00:00'
				})
			];
			var ev = service.getEventForTime(moment('2009-01-01 00:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 00:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 00:01'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('B');

			ev = service.getEventForTime(moment('2010-05-01 00:00'), eventList);
			expect(ev).not.toBeDefined();
		});

		it('Should find the next event in a simple list of events with start and end times.', function() {
			var eventList = [
				new CMEvent({
					'_id': 'a',
					'summary': 'A',
					'start': '2010-01-01 00:00',
					'end': '2010-01-01 01:00'
				}),
				new CMEvent({
					'_id': 'b',
					'summary': 'B',
					'start': '2010-02-01 00:00',
					'end': '2010-02-01 01:00'
				}),
				new CMEvent({
					'_id': 'c',
					'summary': 'C',
					'start': '2010-03-01 00:00',
					'end': '2010-03-01 01:00'
				})
			];
			var ev = service.getEventForTime(moment('2010-01-01 00:01'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 00:59'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 01:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 01:01'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('B');
		});

		it('Should find the first event that matches when multiple events match the given time.', function() {
			var eventList = [
				new CMEvent({
					'_id': 'a',
					'summary': 'A',
					'start': '2010-01-01 00:00',
					'end': '2010-01-02 00:00'
				}),
				new CMEvent({
					'_id': 'b',
					'summary': 'B',
					'start': '2010-01-01 12:00',
					'end': '2010-01-02 12:00'
				}),
				new CMEvent({
					'_id': 'c',
					'summary': 'C',
					'start': '2010-01-02 00:00',
					'end': '2010-01-03 00:00'
				}),
				new CMEvent({
					'_id': 'd',
					'summary': 'D',
					'start': '2010-01-02 12:00',
					'end': '2010-01-03 12:00'
				}),
				new CMEvent({
					'_id': 'e',
					'summary': 'E',
					'start': '2010-01-03 00:00',
					'end': '2010-01-04 00:00'
				}),
			];

			var ev = service.getEventForTime(moment('2010-01-01 00:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 11:59'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 12:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 12:01'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-01 23:59'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-02 00:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('A');

			ev = service.getEventForTime(moment('2010-01-02 00:01'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('B');

			ev = service.getEventForTime(moment('2010-01-03 04:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev.getSummary()).toBe('D');
		});

		it('Should go to the day if the event is the first for the day.', function() {
			var eventList = [
				new CMDay(moment('2010-01-01 00:00')),
				new CMEvent({
					'_id': 'a',
					'summary': 'A',
					'start': '2010-01-01 00:00',
					'end': '2010-01-01 01:00'
				}),
				new CMDay(moment('2010-02-01 00:00')),
				new CMEvent({
					'_id': 'b',
					'summary': 'B',
					'start': '2010-02-01 00:00',
					'end': '2010-02-01 01:00'
				}),
				new CMEvent({
					'_id': 'c',
					'summary': 'C',
					'start': '2010-02-01 01:00',
					'end': '2010-02-01 02:00'
				}),
				new CMEvent({
					'_id': 'd',
					'summary': 'D',
					'start': '2010-02-01 23:00',
					'end': '2010-02-02 01:00'
				}),
				new CMDay(moment('2010-02-02 00:00')),
				new CMEvent({
					'_id': 'e',
					'summary': 'E',
					'start': '2010-02-02 09:00',
					'end': '2010-02-02 10:00'
				})
			];
			// before a event, should match first day
			var ev = service.getEventForTime(moment('2009-01-01 00:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMDay).toBe(true);
			expect(ev.day.isSame(moment('2010-01-01 00:00'))).toBe(true);

			// during a event, should match first day
			ev = service.getEventForTime(moment('2010-01-01 01:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMDay).toBe(true);
			expect(ev.day.isSame(moment('2010-01-01 00:00'))).toBe(true);

			// after a event, should match second day
			ev = service.getEventForTime(moment('2010-01-01 02:00'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMDay).toBe(true);
			expect(ev.day.isSame(moment('2010-02-01 00:00'))).toBe(true);

			// during b event, should match second day
			ev = service.getEventForTime(moment('2010-02-01 00:30'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMDay).toBe(true);
			expect(ev.day.isSame(moment('2010-02-01 00:00'))).toBe(true);

			// during c event, should match c
			ev = service.getEventForTime(moment('2010-02-01 01:30'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMEvent).toBe(true);
			expect(ev.getSummary()).toBe('C');

			// after c event, should match d
			ev = service.getEventForTime(moment('2010-02-01 02:30'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMEvent).toBe(true);
			expect(ev.getSummary()).toBe('D');

			// during d event, should match d
			ev = service.getEventForTime(moment('2010-02-01 23:30'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMEvent).toBe(true);
			expect(ev.getSummary()).toBe('D');

			// during d event after midnight, should still match d
			ev = service.getEventForTime(moment('2010-02-02 00:30'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMEvent).toBe(true);
			expect(ev.getSummary()).toBe('D');

			// after d event, before e, should match third day
			ev = service.getEventForTime(moment('2010-02-02 01:30'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMDay).toBe(true);
			expect(ev.day.isSame(moment('2010-02-02 00:00'))).toBe(true);

			// during e event, should match third day
			ev = service.getEventForTime(moment('2010-02-02 09:30'), eventList);
			expect(ev).toBeDefined();
			expect(ev instanceof CMDay).toBe(true);
			expect(ev.day.isSame(moment('2010-02-02 00:00'))).toBe(true);

			// after e event, should match nothing
			ev = service.getEventForTime(moment('2010-02-02 10:30'), eventList);
			expect(ev).not.toBeDefined();
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
