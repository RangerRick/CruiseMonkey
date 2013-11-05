(function() {
	'use strict';

	/*global emit: true*/
	/*global moment: true*/
	angular.module('cruisemonkey.Events', ['cruisemonkey.Config', 'cruisemonkey.Database', 'cruisemonkey.User', 'cruisemonkey.Logging'])
	.factory('EventService', ['$q', '$rootScope', '$timeout', '$http', 'Database', 'UserService', 'LoggingService', 'config.database.host', 'config.database.name', function($q, $rootScope, $timeout, $http, db, UserService, log, databaseHost, databaseName) {
		log.info('EventService: Initializing EventService.');

		var stringifyDate = function(date) {
			if (date === null || date === undefined) {
				return undefined;
			}
			return moment(date).format("YYYY-MM-DD HH:mm");
		};

		var initialized = $q.defer();
		var _events = {};
		var _favorites = {};
		var _favoritesByEventId = {};
		var _processedEvents = {};

		var listeners = [],
			databaseReady = false;

		var sanitizeEvent = function(ev) {
			var sanitized = angular.copy(ev);
			sanitized.type = 'event';
			delete sanitized.isFavorite;
			delete sanitized._favoriteId;
			delete sanitized.isNewDay;
			if (sanitized.start) {
				sanitized.start = stringifyDate(sanitized.start);
			}
			if (sanitized.end) {
				sanitized.end = stringifyDate(sanitized.end);
			}
			if (!sanitized.isFavorite) {
				sanitized.isFavorite = false;
			}
			return sanitized;
		};

		var unsanitizeEvent = function(ev) {
			if (ev.start) {
				ev.start = moment(ev.start);
			}
			if (ev.end) {
				ev.end = moment(ev.end);
			}
			return ev;
		};

		var handleEventUpdated = function(doc) {
			doc = unsanitizeEvent(doc);
			log.debug('EventService.handleEventUpdated(): Event updated: ' + doc._id);

			var username = UserService.getUsername();
			if (username) {
				delete doc._favoriteId;
				doc.isFavorite = false;
				if (_favoritesByEventId[doc._id]) {
					doc.isFavorite = true;
				}
			}
			_events[doc._id] = doc;
			$rootScope.$broadcast('cm.eventUpdated', doc);
		};

		var handleFavoriteUpdated = function(fav) {
			log.debug('EventService.handleFavoriteUpdated(): Favorite updated: ' + fav._id);
			_favorites[fav._id] = fav;
			_favoritesByEventId[fav.eventId] = fav;
			if (_events[fav.eventId]) {
				_events[fav.eventId].isFavorite = true;
			}
			$rootScope.$broadcast('cm.eventUpdated', _events[fav.eventId]);
		};

		var handleEventDeleted = function(eventId) {
			log.debug('EventService.handleEventDeleted(): Event ' + eventId + ' deleted.');
			var existing = _events[eventId];
			var fav = _favoritesByEventId[eventId];

			if (fav) {
				delete _favorites[fav._id];
				delete _favoritesByEventId[eventId];
			}

			delete _events[eventId];
			$rootScope.$broadcast('cm.eventDeleted', existing);
		};

		var handleFavoriteDeleted = function(favoriteId) {
			log.debug('EventService.handleFavoriteDeleted('+ favoriteId + ')');

			var fav = _favorites[favoriteId];

			if (fav) {
				var existingEvent = _events[fav.eventId];
				if (existingEvent) {
					existingEvent.isFavorite = false;
					delete _favoritesByEventId[fav.eventId];
					$rootScope.$broadcast('cm.eventUpdated', existingEvent);
				}
				delete _favorites[favoriteId];
			} else {
				log.warn('EventService.handleFavoriteDeleted(): no favorite with id ' + favoriteId + ' found.');
			}
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
							var ev = res.rows[i].value;
							delete ev._favoriteId;
							delete ev.isFavorite;
							delete ev.isNewDay;
							results.push(unsanitizeEvent(ev));
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
			var eventToAdd = sanitizeEvent(ev);

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				if (!eventToAdd.username || eventToAdd.username === '') {
					log.info('EventService.addEvent(): no username in the event!');
					deferred.reject('no username specified');
				} else {
					log.info('EventService.addEvent(): posting event "' + eventToAdd.summary + '" for user "' + eventToAdd.username + '"');
					db.database.post(eventToAdd, function(err, response) {
						$rootScope.$apply(function() {
							if (err) {
								log.error(err);
								deferred.reject(err);
							} else {
								eventToAdd._id = response.id;
								eventToAdd._rev = response.rev;
								eventToAdd = unsanitizeEvent(eventToAdd);
								handleEventUpdated(eventToAdd);
								deferred.resolve(eventToAdd);
							}
						});
					});
				}
			});

			return deferred.promise;
		};

		var updateEvent = function(ev) {
			var deferred = $q.defer();

			if (!ev._rev || !ev._id) {
				log.warn('EventService.updateEvent(): Attempting to update event ' + ev.summary + ', but it is missing _rev or _id!');
				deferred.reject('bad event');
				return deferred.promise;
			}

			var eventToSave = sanitizeEvent(ev);

			$q.when(initialized.promise).then(function() {
				db.database.put(eventToSave, function(err, response) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							eventToSave._rev = response.rev;
							eventToSave = unsanitizeEvent(eventToSave);
							handleEventUpdated(eventToSave);
							deferred.resolve(eventToSave);
						}
					});
				});
			});

			return deferred.promise;
		};

		var removeEvent = function(ev) {
			log.info('EventService.removeEvent(' + ev._id + ')');
			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				db.database.remove(ev, function(err, response) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							handleEventDeleted(ev._id);
							deferred.resolve(response);
						}
					});
				});
			});

			return deferred.promise;
		};

		var getEvent = function(id) {
			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				deferred.resolve(_events[id]);
			});
		};

		var getAllEvents = function() {
			log.info('EventService.getAllEvents()');
			return doQuery(function(doc) {
				if (doc.type === 'event') {
					emit(doc.username, doc);
				}
			}, {reduce: true});
		};

		var getAllFavorites = function() {
			log.info('EventService.getAllFunctions()');
			return doQuery(function(doc) {
				if (doc.type === 'favorite') {
					emit(doc.username, doc);
				}
			}, {reduce:true});
		};

		var getOfficialEvents = function() {
			log.info('EventService.getOfficialEvents()');
			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.username === 'official') {
						ret.push(ev);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var getUnofficialEvents = function() {
			log.info('EventService.getUnofficialEvents()');
			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.isPublic && ev.username !== 'official') {
						ret.push(ev);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var getUserEvents = function() {
			log.info('EventService.getUserEvents()');

			var username = UserService.getUsername();
			if (!username) {
				log.warn('EventService.getUserEvent(): user not logged in');
				return promisedResult([]);
			}

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.username === username) {
						ret.push(ev);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var getMyEvents = function() {
			log.info('EventService.getMyEvents()');

			var username = UserService.getUsername();
			if (!username) {
				log.warn('EventService.getMyEvents(): user not logged in');
				return promisedResult([]);
			}

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.username === username || (_favoritesByEventId[id] && _favoritesByEventId[id].username === username)) {
						ret.push(ev);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var getMyFavorites = function() {
			var username = UserService.getUsername();
			if (!username) {
				log.warn('EventService.getMyFavorites(): user not logged in');
				return promisedResult([]);
			}

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_favorites, function(eventId, fav) {
					if (fav.username === username) {
						ret.push(eventId);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var isFavorite = function(eventId) {
			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				deferred.resolve(_favoritesByEventId.hasOwnProperty(eventId));
			});

			return deferred.promise;
		};

		var addFavorite = function(eventId) {
			log.info('EventService.addFavorite(' + eventId + ')');
			var username = UserService.getUsername();
			if (!username || !eventId) {
				log.warn('EventService.addFavorite(): user not logged in, or no eventId passed');
				return promisedResult(undefined);
			}

			var deferred = $q.defer();

			var fav = {
				'type': 'favorite',
				'username': username,
				'eventId': eventId
			};

			db.database.post(fav, function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						fav._id = res.id;
						fav._rev = res.rev;
						handleFavoriteUpdated(fav);
						deferred.resolve(fav);
					}
				});
			});
			return deferred.promise;
		};

		var removeFavorite = function(eventId) {
			log.info('EventService.removeFavorite(' + eventId + ')');
			var username = UserService.getUsername();
			if (!username || !eventId) {
				log.warn('EventService.removeFavorite(): user not logged in, or no eventId passed');
				return promisedResult(undefined);
			}

			var deferred = $q.defer();

			/* first, we get the list of favorites pointing to the given event ID */
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
							var promises = [];

							/* for any existing favorites associated with the event,
							store a promise to delete that event */
							angular.forEach(res.rows, function(row, index) {
								var def = $q.defer();
								promises.push(def.promise);

								var favoriteId = row.value;
								var doc = row.doc;
								db.database.remove(doc, function(err, res) {
									$rootScope.$apply(function() {
										if (err) {
											log.error(err);
											def.reject(err);
										} else {
											handleFavoriteDeleted(favoriteId);
											def.resolve(res);
										}
									});
								});
							});

							/* when all of the deletes have finished, then resolve & return */
							$q.all(promises).then(function() {
								deferred.resolve(res.total_rows);
							}, function(err) {
								deferred.reject(err);
							});
						} else {
							deferred.resolve(res.total_rows);
						}
					}
				});
			});
			return deferred.promise;
		};

		var getRemoteDocs = function() {
			if (!databaseHost) {
				databaseHost = $location.host();
			}
			var host = 'http://' + databaseHost + ':5984/' + databaseName;
			var deferred = $q.defer();

			$http.get(host + '/_all_docs?include_docs=true', { 'headers': { 'Accept': 'application/json' } })
				.success(function(data, status, headers, config) {
					deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					console.log('error = ', status);
					deferred.reject(status);
				});
			return deferred.promise;
		};

		var initEventCache = function() {
			$q.all([getAllEvents(), getAllFavorites(), getRemoteDocs()]).then(function(results) {
				log.info('EventService.initEventCache(): Retrieved events & favorites from the database; pushing to cache.');
				var events    = results[0];
				var favorites = results[1];
				var remote    = results[2];

				var newEvents = {}, newFavorites = {};
				angular.forEach(events, function(ev, index) {
					delete ev.isFavorite;
					delete ev._favoriteId;
					delete ev.isNewDay;
					if (_events[ev._id]) {
						ev.isFavorite = _events[ev._id].isFavorite;
					}
					newEvents[ev._id] = unsanitizeEvent(ev);
				});
				angular.forEach(favorites, function(fav, index) {
					newFavorites[fav.eventId] = fav;
				});

				if (remote && remote.total_rows) {
					console.log('remote', remote);
					for (var i = 0; i < remote.total_rows; i++) {
						var doc = remote.rows[i].doc;
						if (doc.type === 'event') {
							var ev = doc;
							delete ev.isFavorite;
							delete ev._favoriteId;
							delete ev.isNewDay;
							if (_events[ev._id]) {
								ev.isFavorite = _events[ev._id].isFavorite;
							}
							newEvents[ev._id] = unsanitizeEvent(ev);
						} else if (doc.type === 'favorite') {
							var fav = doc;
							newFavorites[fav.eventId] = fav;
						}
					}
				}

				_events = newEvents;
				_favorites = newFavorites;
				initialized.resolve(true);
			});

			$rootScope.$on('cm.documentUpdated', function(ev, doc) {
				if (doc.type === 'event') {
					handleEventUpdated(doc);
				} else if (doc.type === 'favorite') {
					handleFavoriteUpdated(doc);
				} else {
					console.log('unhandled document update: ', doc);
				}
			});
			$rootScope.$on('cm.documentDeleted', function(ev, change) {
				if (_events[change.id]) {
					handleEventDeleted(change.id);
				} else if (_favorites[change.id]) {
					handleFavoriteDeleted(change.id);
				} else {
					console.log('unhandled document deletion:', change);
					console.log('events=', _events);
					console.log('favorites=', _favorites);
				}
			});
		};

		$rootScope.$on('$destroy', function() {
			angular.forEach(listeners, function(listener) {
				listener();
			});
		});
		$rootScope.$on('cm.databaseReady', function() {
			log.info('EventService: Initializing caches.');
			initEventCache();
		});
		$q.when(initialized.promise).then(function() {
			log.info('EventService: Event cache initialized.');
		});

		return {
			'addEvent': addEvent,
			'updateEvent': updateEvent,
			'removeEvent': removeEvent,
			'getEvent': getEvent,
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