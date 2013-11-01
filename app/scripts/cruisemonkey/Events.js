(function() {
	'use strict';

	/*global emit: true*/
	/*global moment: true*/
	angular.module('cruisemonkey.Events', ['cruisemonkey.Database', 'cruisemonkey.User', 'cruisemonkey.Logging'])
	.factory('EventService', ['$q', '$rootScope', '$timeout', 'Database', 'UserService', 'LoggingService', function($q, $rootScope, $timeout, db, UserService, log) {
		log.info('Initializing EventService.');

		var stringifyDate = function(date) {
			if (date === null || date === undefined) {
				return undefined;
			}
			return moment(date).format("YYYY-MM-DD HH:mm");
		};

		var _favorites = {};
		var _processedEvents = {};

		var listeners = [],
			databaseReady = false;

		var normalizeEvents = function(events) {
			var i, ret = {};
			for (i = 0; i < events.length; i++) {
				var e = events[i];
				if (e) {
					if (!e.hasOwnProperty('isFavorite')) {
						e.isFavorite = false;
					}
					ret[e._id] = e;
				} else {
					console.log('events = ', events);
					console.log('event ' + i + ' was undefined!');
				}
			}
			return ret;
		};

		var updateEventCache = function() {
			log.info('Events.updateEventCache(): eventType = ' + $rootScope.eventType);

			if (!_processedEvents[$rootScope.eventType]) {
				log.info('no processed events for type ' + $rootScope.eventType);
				return;
			}
			if (!$rootScope.events) {
				$rootScope.events = {};
			}

			var events = _processedEvents[$rootScope.eventType];

			angular.forEach(events, function(value, index) {
				$rootScope.events[index] = value;
			});
			angular.forEach($rootScope.events, function(value, index) {
				if (!events[index]) {
					delete $rootScope.events[index];
				}
			});
			$rootScope.$broadcast('cm.eventCacheUpdated');
		};

		var updateOfficialEventCache = function() {
			var deferred = $q.defer();
			$q.when(getOfficialEvents()).then(function(events) {
				_processedEvents.official = normalizeEvents(events);
				deferred.resolve(_processedEvents.official);
				updateEventCache();
			}, function(failure) {
				deferred.reject(failure);
			});
			return deferred.promise;
		};

		var updateUnofficialEventCache = function() {
			var deferred = $q.defer();
			$q.when(getUnofficialEvents()).then(function(events) {
				_processedEvents.unofficial = normalizeEvents(events);
				deferred.resolve(_processedEvents.unofficial);
				updateEventCache();
			}, function(failure) {
				deferred.reject(failure);
			});
			return deferred.promise;
		};

		var updateMyEventCache = function() {
			var deferred = $q.defer();
			$q.when(getMyEvents()).then(function(events) {
				_processedEvents.my = normalizeEvents(events);
				deferred.resolve(_processedEvents.my);
				updateEventCache();
			}, function(failure) {
				deferred.reject(failure);
			});
			return deferred.promise;
		};

		var updateAllCaches = function() {
			var deferred = $q.defer();
			$q.all([updateOfficialEventCache(), updateUnofficialEventCache(), updateMyEventCache()]).then(function(finished) {
				log.info('All caches updated.');
				deferred.resolve();
			}, function(failed) {
				deferred.reject(failed);
			});
			return deferred.promise;
		};

		var updateDocument = function(doc) {
			log.info('Events.updateDocument(' + doc._id + ')');
			var id = doc._id;

			if (doc.username === 'official') {
				doc.isPublic = true;
				if (!doc.isFavorite) {
					doc.isFavorite = false;
				}

				if (_processedEvents.official) {
					var existingOfficial = _processedEvents.official[id];
					if (existingOfficial) {
						doc.isFavorite = existingOfficial.isFavorite;
					}
				}

				log.debug('Events.updateDocument(): putting ' + id + ' in official events.');
				_processedEvents.official[id] = doc;
			}

			if (doc.isPublic && doc.username !== 'official') {
				if (!doc.isFavorite) {
					doc.isFavorite = false;
				}

				if (_processedEvents.unofficial) {
					var existingUnofficial = _processedEvents.unofficial[id];
					if (existingUnofficial) {
						doc.isFavorite = existingUnofficial.isFavorite;
					}
				}

				log.debug('Events.updateDocument(): putting ' + id + ' in unofficial events.');
				_processedEvents.unofficial[id] = doc;
			}

			var myExisting;
			if (_processedEvents.my) {
				myExisting = _processedEvents.my[id];
			}
			if (doc.username === UserService.getUsername() || (myExisting && myExisting.isFavorite)) {
				if (myExisting) {
					doc.isFavorite = myExisting.isFavorite;
				}

				log.debug('Events.updateDocument(): putting ' + id + ' in my events.');
				_processedEvents.my[id] = doc;
			}

			updateEventCache();
		};

		var deleteDocument = function(doc) {
			log.info('Events.deleteDocument(' + doc.id + ')');
			var id = doc.id;
			if (_favorites[id]) {
				log.info(id + ' is a favorite.  Deleting the associated event (' + _favorites[id] + ')');
				id = _favorites[id];
				delete _favorites[id];
			}
			angular.forEach(_processedEvents, function(events, type) {
				if (events[id]) {
					log.debug('event[' + id + '] was found in type ' + type + ', deleting.');
					delete events[id];
				}
			});
		};

		var doQuery = function(map, options) {
			var deferred = $q.defer();
			db.database.query({map: map}, options, function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						/*jshint camelcase: false */
						var results = [], i;
						for (i = 0; i < res.total_rows; i++) {
							results.push(res.rows[i].value);
						}
						deferred.resolve(results);
					}
				});
			});
			return deferred.promise;
		};

		var promisedResult = function(res) {
			var deferred = $q.defer();
			setTimeout(function() {
				$rootScope.$apply(function() {
					deferred.resolve(res);
				});
			}, 0);
			return deferred.promise;
		};

		var addEvent = function(ev) {
			var eventToAdd = angular.copy(ev);

			eventToAdd.type = 'event';
			eventToAdd.start = stringifyDate(eventToAdd.start);
			eventToAdd.end = stringifyDate(eventToAdd.end);

			var deferred = $q.defer();

			if (!eventToAdd.username || eventToAdd.username === '') {
				log.info('addEvent(): no username in the event!');
				deferred.reject('no username specified');
			} else {
				log.info('addEvent(): posting event "' + eventToAdd.summary + '" for user "' + eventToAdd.username + '"');
				db.database.post(eventToAdd, function(err, response) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							eventToAdd._id = response.id;
							eventToAdd._rev = response.rev;
							deferred.resolve(eventToAdd);
						}
					});
				});
			}

			return deferred.promise;
		};

		var updateEvent = function(ev) {
			var deferred = $q.defer();

			if (!ev._rev || !ev._id) {
				log.warn('Attempting to update event ' + ev.summary + ', but it is missing _rev or _id!');
				deferred.reject('bad event');
				return deferred.promise;
			}

			/* make a copy and strip out the user-specific isFavorite property */
			var eventToSave = angular.copy(ev);
			delete eventToSave.isFavorite;
			eventToSave.start = stringifyDate(eventToSave.start);
			eventToSave.end = stringifyDate(eventToSave.end);

			db.database.put(eventToSave, function(err, response) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						eventToSave._rev = response.rev;
						deferred.resolve(response);
					}
				});
			});
		};

		var removeEvent = function(ev) {
			log.info('removeEvent(' + ev._id + ')');
			var deferred = $q.defer();
			db.database.remove(ev, function(err, response) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						deferred.resolve(response);
					}
				});
			});
			return deferred.promise;
		};

		var getAllEvents = function() {
			log.info('getAllEvents()');
			return doQuery(function(doc) {
				if (doc.type === 'event') {
					emit(doc.username, doc);
				}
			}, {reduce: false});
		};

		var getOfficialEvents = function() {
			log.info('getOfficialEvents()');
			return doQuery(function(doc) {
				if (doc.type === 'event') {
					emit(doc.username, doc);
				}
			}, {reduce: true, key: 'official'});
		};

		var getUnofficialEvents = function() {
			log.info('getUnofficialEvents()');
			return doQuery(function(doc) {
				if (doc.type === 'event' && doc.isPublic && doc.username !== 'official') {
					emit(doc.username, doc);
				}
			}, {reduce: true});
		};

		var getUserEvents = function() {
			log.info('getUserEvents()');

			var username = UserService.getUsername();
			if (!username) {
				log.warn('getUserEvent(): user not logged in');
				return promisedResult([]);
			}

			return doQuery(function(doc) {
				if (doc.type === 'event') {
					emit(doc.username, doc);
				}
			}, {reduce: false, key: username});
		};

		var getMyEvents = function() {
			log.info('getMyEvents()');

			var username = UserService.getUsername();
			if (!username) {
				log.warn('getMyEvents(): user not logged in');
				return promisedResult([]);
			}

			var deferred = $q.defer();

			/*jshint camelcase: false */
			db.database.query(
			{
				map: function(doc) {
					if (doc.type === 'event') {
						emit(doc.username, {'_id': doc._id, 'type': doc.type});
					} else if (doc.type === 'favorite') {
						emit(doc.username, {'_id': doc.eventId, 'type': doc.type});
					}
				}
			},
			{
				reduce: true,
				include_docs: true,
				key: username
			},
			function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						var results = [], i, entry;
						for (i = 0; i < res.total_rows; i++) {
							entry = res.rows[i];
							if (entry.doc) {
								if (entry.value.type === 'favorite') {
									entry.doc.isFavorite = true;
								}
								results.push(entry.doc);
							}
						}
						deferred.resolve(results);
					}
				});
			});
			return deferred.promise;
		};

		var getMyFavorites = function() {
			var username = UserService.getUsername();
			if (!username) {
				log.warn('getMyFavorites(): user not logged in');
				return promisedResult([]);
			}

			var deferred = $q.defer();

			/*jshint camelcase: false */
			db.database.query(
			{
				map: function(doc) {
					if (doc.type === 'favorite') {
						emit(doc.username, doc.eventId);
					}
				}
			},
			{
				reduce: true,
				include_docs: false,
				key: username
			},
			function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						var results = [], i;
						for (i = 0; i < res.total_rows; i++) {
							results.push(res.rows[i].value);
						}
						deferred.resolve(results);
					}
				});
			});
			return deferred.promise;
		};

		var isFavorite = function(eventId) {
			var username = UserService.getUsername();
			if (!username || !eventId) {
				log.warn('isFavorite(): user not logged in, or no eventId passed');
				return promisedResult(false);
			}

			var deferred = $q.defer();

			/*jshint camelcase: false */
			db.database.query(
			{
				map: function(doc) {
					if (doc.type === 'favorite') {
						emit({ 'username': doc.username, 'eventId': doc.eventId });
					}
				}
			},
			{
				reduce: true,
				include_docs: false,
				key: { 'username': username, 'eventId': eventId }
			},
			function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						deferred.resolve(res.total_rows > 0);
					}
				});
			});
			return deferred.promise;
		};

		var addFavorite = function(eventId) {
			var username = UserService.getUsername();
			if (!username || !eventId) {
				log.warn('addFavorite(): user not logged in, or no eventId passed');
				return promisedResult(undefined);
			}

			var deferred = $q.defer();

			db.database.post({
				'type': 'favorite',
				'username': username,
				'eventId': eventId
			}, function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						deferred.resolve(res.id);
					}
				});
			});
			return deferred.promise;
		};

		var removeFavorite = function(eventId) {
			var username = UserService.getUsername();
			if (!username || !eventId) {
				log.warn('removeFavorite(): user not logged in, or no eventId passed');
				return promisedResult(undefined);
			}

			var deferred = $q.defer();

			/*jshint camelcase: false */
			db.database.query(
			{
				map: function(doc) {
					if (doc.type === 'favorite') {
						emit({ 'username': doc.username, 'eventId': doc.eventId }, doc._id);
					}
				}
			},
			{
				reduce: true,
				include_docs: true,
				key: { 'username': username, 'eventId': eventId }
			},
			function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						/*jshint camelcase: false */
						if (res.total_rows > 0) {
							var doc = res.rows[0].doc;
							db.database.remove(doc, function(err, res) {
								$rootScope.$apply(function() {
									if (err) {
										log.error(err);
										deferred.reject(err);
									} else {
										deferred.resolve(res);
									}
								});
							});
						} else {
							deferred.resolve(null);
						}
					}
				});
			});
			return deferred.promise;
		};

		var handleEvents = function(ev, doc) {
			log.trace('got event: ', ev);
			log.trace('document: ', doc);

			if (ev.name === 'cm.databaseReady') {
				// we've finished loading the database, prime the event cache
				updateAllCaches();
			} else if (ev.name === 'cm.documentUpdated') {
				updateDocument(doc);
			} else if (ev.name === 'cm.documentDeleted') {
				deleteDocument(doc);
			} else if (ev.name === 'cm.loggedIn' || ev.name === 'cm.loggedOut') {
				log.info('User login changed.  Resetting cache.');
				_processedEvents = {};
				updateAllCaches();
			} else {
				log.warn("Unhandled event type: " + ev.name);
			}
		};

		log.info('Initializing caches.');
		updateAllCaches().then(function() {
			/* invalidate the cache whenever things affect the model */
			angular.forEach(['cm.databaseReady', 'cm.documentDeleted', 'cm.documentUpdated', 'cm.loggedIn', 'cm.loggedOut'], function(value) {
				listeners.push($rootScope.$on(value, handleEvents));
			});
		});

		$rootScope.$on('$destroy', function() {
			angular.forEach(listeners, function(listener) {
				listener();
			});
		});

		return {
			'init': updateEventCache,
			'addEvent': addEvent,
			'updateEvent': updateEvent,
			'removeEvent': removeEvent,
			'getAllEvents': getAllEvents,
			'getOfficialEvents': getOfficialEvents,
			'getUnofficialEvents': getUnofficialEvents,
			'getUserEvents': getUserEvents,
			'getMyEvents': getMyEvents,
			'getMyFavorites': getMyFavorites,
			'isFavorite': isFavorite,
			'addFavorite': addFavorite,
			'removeFavorite': removeFavorite
		};
	}]);

}());