(function() {
	'use strict';

	var angular = require('angular'),
		moment = require('moment'),
		model = require('../data/Model'),
		CMDay = model.CMDay,
		CMEvent = model.CMEvent,
		CMFavorite = model.CMFavorite;

	require('angular-uuid4');

	angular.module('cruisemonkey.Events', [
		'uuid4',
		'cruisemonkey.Config',
		'cruisemonkey.DB',
		'cruisemonkey.user.User'
	])
	.factory('EventService', function($log, $q, $rootScope, db, kv, Twitarr, UserService) {
		var scope = $rootScope.$new();

		var eventdb = db.collection('events', 'events', {transactional:true});

		kv.get('cruisemonkey.lastModified').then(function(lm) {
			scope.lastModified = lm || 0;
		}, function() {
			scope.lastModified = 0;
		});
		var updateLastModified = function() {
			kv.set('cruisemonkey.lastModified', scope.lastModified);
		};

		var getEvents = function() {
			$log.debug('EventService.getEvents()');
			return eventdb.then(function(evdb) {
				return Twitarr.getEvents().then(function(events) {
					for (var i=0, len=events.length, event, existing; i < len; i++) {
						event = events[i];
						event.lastUpdated = CMEvent._stringifyDate(moment());
						existing = evdb.findObject({id:event.id});
						if (existing) {
							angular.extend(existing, event);
							evdb.update(existing);
							events[i] = existing;
						} else {
							evdb.insert(event);
						}
					}
					//$log.debug('Got events: ' + angular.toJson(events));
					return events;
				});
			});
		};

		var doQuery = function(where) {
			return getEvents().then(function(events) {
				return events.filter(where).map(function(event) {
					return new CMEvent(event);
				});
			}, function(err) {
				$log.debug('doQuery: getEvents() failed, falling back to cache: ' + angular.toJson(err));
				return eventdb.then(function(evdb) {
					return evdb.where(where).map(function(event) {
						return new CMEvent(event);
					});
				}, function(err) {
					$log.error('doQuery: unable to get events from cache: ' + angular.toJson(err));
					return $q.reject(err);
				});
			});
		};

		var getAllEvents = function() {
			return doQuery(function() { return true; });
		};

		var getOfficialEvents = function() {
			return doQuery(function(event) {
				return event.official;
			});
		};

		var getUnofficialEvents = function() {
			var user = UserService.get();
			return doQuery(function(event) {
				if (!event.official) {
					return event.author === user.username || event.visibility !== 'all';
				}
				return false;
			});
		};

		var getUserEvents = function() {
			var user = UserService.get();
			if (!user.loggedIn) {
				return $q.reject('User is not logged in!');
			}
			return doQuery(function(event) {
				return event.author === user.username;
			});
		};


		var getMyEvents = function() {
			var user = UserService.get();
			if (!user.loggedIn) {
				return $q.reject('User is not logged in!');
			}
			return doQuery(function(event) {
				return event.author === user.username || event.favorites.indexOf(user.username) >= 0;
			});
		};

		var addEvent = function(event) {
			return Twitarr.addEvent(event.getRawData()).then(function(ret) {
				$log.debug('EventService.addEvent: success: ' + angular.toJson(ret));
			}, function(err) {
				$log.debug('EventService.addEvent: failed: ' + angular.toJson(err));
				return $q.reject(err);
			});
		};

		var updateEvent = function(event) {
			return Twitarr.updateEvent(event.getRawData()).then(function(ret) {
				$log.debug('EventService.updateEvent: success: ' + angular.toJson(ret));
			}, function(err) {
				$log.debug('EventService.updateEvent: failed: ' + angular.toJson(err));
				return $q.reject(err);
			});
		};

		var removeEvent = function(event) {
			return Twitarr.removeEvent(event.getId()).then(function(ret) {
				$log.debug('EventService.removeEvent: success: ' + angular.toJson(ret));
			}, function(err) {
				$log.debug('EventService.removeEvent: failed: ' + angular.toJson(err));
				return $q.reject(err);
			});
		};

		return {
			'addEvent': addEvent,
			'updateEvent': updateEvent,
			'removeEvent': removeEvent,
			'getAllEvents': getAllEvents,
			'getOfficialEvents': getOfficialEvents,
			'getUnofficialEvents': getUnofficialEvents,
			'getUserEvents': getUserEvents,
			'getMyEvents': getMyEvents,
			'getMyFavorites': function() { return $q.when([]); },
			'isFavorite': function() { return false; },
			'addFavorite': function() { return false; },
			'removeFavorite': function() { return false; },
			'getEventForTime': function() { return undefined; },
			'getNextEvent': function(events) { return undefined; },
			'recreateDatabase': function() { return false; },
			'forceSync': function() { return false; },
			'getLastModified': function() {
				return scope.lastModified;
			}
		};
	})
	;

}());
