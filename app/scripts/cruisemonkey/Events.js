/*global emit: true*/
/*global moment: true*/
/*global Modernizr: true*/
/*global CMDay: true*/
/*global CMEvent: true*/
/*global CMFavorite: true*/
/*global stringifyDate: true*/

(function() {
	'use strict';

	angular.module('cruisemonkey.Events', [
		'uuid4',
		'cruisemonkey.Config',
		'cruisemonkey.Database',
		'cruisemonkey.User'
	])
	.factory('EventService', ['$q', '$rootScope', '$timeout', '$location', 'uuid4', '_database', 'UserService', '$log', 'config.database.name', function($q, $rootScope, $timeout, $location, uuid4, _database, UserService, log, databaseName) {
		log.info('EventService: Initializing EventService.');

		var localdb = _database.get(databaseName);

		var promisedResult = function(result) {
			var deferred = $q.defer();
			$timeout(function() {
				deferred.resolve(result);
			});
			return deferred.promise;
		};

		var rejectedResult = function(reason) {
			var deferred = $q.defer();
			$timeout(function() {
				log.error(reason);
				deferred.reject(reason);
			});
			return deferred.promise;
		};

		var reconcileEvents = function(events, favorites) {
			var _events = {}, _favs = {}, fav, i, ret = [];
			angular.forEach(events, function(ev) {
				_events[ev._rawdata._id] = ev;
			});
			angular.forEach(favorites, function(fav) {
				_favs[fav.getEventId()] = fav;
			});
			angular.forEach(_events, function(ev) {
				fav = _favs[ev.getId()];
				if (fav) {
					fav.setEvent(ev);
					ev.setFavorite(fav);
				}
				ret.push(ev);
			});

			return ret;
		};

		var isString = function(value) {
			if (typeof value === 'string' || value instanceof String) {
				return true;
			} else {
				return false;
			}
		};

		/**
		  * Given an event view name, query that view and optionally the favorites view,
		  * and coalesce the results into a list of CMEvent objects, with associated
		  * CMFavorite objects if any.
		  */
		var queryEventView = function() {
			var deferred = $q.defer();

			var args = Array.prototype.slice.call(arguments);
			var username = UserService.getUsername();
			var options = {include_docs:true};

			if (args.length > 0 && !isString(args[args.length - 1])) {
				var opt = args.pop();
				//console.log('last argument was options!',opt);
				options = angular.extend({}, options, opt);
			}
			//console.log('options=',options);

			var promises = [], i;

			for (i=0; i < args.length; i++) {
				promises.push(localdb.query(args[i], angular.copy(options)));
			}
			if (username) {
				var opts = angular.copy(options);
				angular.extend(opts, {
					key:username
				});
				promises.push(_db.favorites().query('favorites-all', opts));
				//console.log('opts=',opts);
			}

			$q.all(promises).then(function(results) {
				var events = [], favorites = [], favresults = {rows: []}, j, ev, fav, result, ret;
				if (username) {
					favresults = results.pop();
				}

				// iterate over any events results we got
				for (i=0; i < results.length; i++) {
					result = results[i];
					for (j=0; j < result.rows.length; j++) {
						ev = new CMEvent(result.rows[j].doc);
						//console.log(ev.toString());
						events.push(ev);
					}
				}
				for (i=0; i < favresults.rows.length; i++) {
					fav = new CMFavorite(favresults.rows[i].doc);
					//console.log(fav.toString());
					favorites.push(fav);
				}

				ret = reconcileEvents(events, favorites);
				deferred.resolve(ret);
			}, function(err) {
				deferred.reject(err);
			});
			return deferred.promise;
		};

		var addEvent = function(ev) {
			var eventToAdd;
			if (ev instanceof CMEvent) {
				eventToAdd = ev;
			} else {
				eventToAdd = new CMEvent(ev);
			}

			var deferred = $q.defer();

			if (eventToAdd.getUsername() === undefined) {
				$timeout(function() {
					log.warn('EventService.addEvent(): no username in the event!');
					deferred.reject('no username specified');
				});
				return;
			}

			eventToAdd.refreshLastUpdated();
			_db.events().post(eventToAdd.getRawData()).then(function(response) {
				eventToAdd.setId(response.id);
				eventToAdd.setRevision(response.rev);
				deferred.resolve(eventToAdd);
			}, function(err) {
				deferred.reject(err);
			});

			return deferred.promise;
		};

		var updateEvent = function(up) {
			var deferred = $q.defer();

			var ev;
			if (up instanceof CMEvent) {
				ev = up;
			} else {
				ev = new CMEvent(up);
			}

			if (!ev.getRevision() || !ev.getId()) {
				$timeout(function() {
					log.warn('EventService.updateEvent(): Attempting to update event ' + ev.summary + ', but it is missing _rev or _id!');
					deferred.reject('bad event');
				});
				return deferred.promise;
			}

			ev.refreshLastUpdated();
			_db.events().put(ev.getRawData()).then(function(response) {
				ev.setRevision(response.rev);
				deferred.resolve(ev);
			}, function(err) {
				deferred.reject(err);
			});

			return deferred.promise;
		};

		var removeEvent = function(doc) {
			var ev;
			if (doc instanceof CMEvent) {
				ev = doc;
			} else {
				ev = new CMEvent(doc);
			}

			log.debug('EventService.removeEvent(' + ev.getId() + ')');
			var deferred = $q.defer();

			_db.events().remove(ev.getRawData()).then(function(response) {
				deferred.resolve(response);
			}, function(err) {
				deferred.reject(err);
			});

			return deferred.promise;
		};

		var _allEvents = null;
		var getAllEvents = function() {
			log.debug('EventService.getAllEvents()');
			if (_allEvents) {
				return _allEvents;
			}

			var deferred = $q.defer();
			_allEvents = deferred.promise;
			_db.events().query('events-all', {include_docs: true}).then(function(results) {
				var ret = [];
				for (var i=0; i < results.rows.length; i++) {
					ret.push(new CMEvent(results.rows[i].doc));
				}
				deferred.resolve(ret);
			}, function(err) {
				log.error('Failed to get all events:',err);
				deferred.reject(err);
			});
			_allEvents['finally'](function() {
				log.debug('EventService.getAllEvents(): finished.');
				_allEvents = null;
			});
			return _allEvents;
		};

		var _allFavorites = null;
		var getAllFavorites = function() {
			if (_allFavorites) {
				return _allFavorites;
			}

			var deferred = $q.defer();
			_allFavorites = deferred.promise;
			
			log.debug('EventService.getAllFavorites()');
			_db.favorites().query('favorites-all', {include_docs:true}).then(function(results) {
				var ret = [], i, fav;
				for (i=0; i < results.rows.length; i++) {
					fav = results.rows[i].doc;
					ret.push(new CMFavorite(fav));
				}
				deferred.resolve(ret);
			}, function(err) {
				deferred.reject(err);
			});

			_allFavorites['finally'](function() {
				log.debug('EventService.getAllFavorites(): finished.');
				_allFavorites = null;
			});
			return _allFavorites;
		};

		var _officialEvents = null;
		var getOfficialEvents = function() {
			if (_officialEvents) {
				return _officialEvents;
			}

			log.debug('EventService.getOfficialEvents()');

			var deferred = $q.defer();
			_officialEvents = deferred.promise;

			queryEventView('events-official').then(function(events) {
				deferred.resolve(events);
			}, function(err) {
				deferred.reject(err);
			});

			_officialEvents['finally'](function() {
				log.debug('EventService.getOfficialEvents(): finished.');
				_officialEvents = null;
			});
			return _officialEvents;
		};

		var _unofficialEvents = null;
		var getUnofficialEvents = function() {
			if (_unofficialEvents) {
				return _unofficialEvents;
			}

			log.debug('EventService.getUnofficialEvents()');

			var deferred = $q.defer();
			_unofficialEvents = deferred.promise;

			queryEventView('events-unofficial').then(function(events) {
				deferred.resolve(events);
			}, function(err) {
				deferred.reject(err);
			});

			_unofficialEvents['finally'](function() {
				log.debug('EventService.getUnofficialEvents(): finished.');
				_unofficialEvents = null;
			});
			return _unofficialEvents;
		};

		var _userEvents = null;
		var getUserEvents = function() {
			if (_userEvents) {
				return _userEvents;
			}

			log.debug('EventService.getUserEvents()');

			var username = UserService.getUsername();
			if (!username) {
				return rejectedResult('EventService.getUserEvent(): user not logged in');
			}

			var deferred = $q.defer();
			_userEvents = deferred.promise;

			queryEventView('events-user', {
				key: username
			}).then(function(events) {
				deferred.resolve(events);
			}, function(err) {
				deferred.reject(err);
			});
			_userEvents['finally'](function() {
				log.debug('EventService.getUserEvents(): finished.');
				_userEvents = null;
			});
			return _userEvents;
		};

		var _myEvents = null;
		var getMyEvents = function() {
			if (_myEvents) {
				return _myEvents;
			}

			log.debug('EventService.getMyEvents()');

			var username = UserService.getUsername();
			if (!username) {
				return rejectedResult('EventService.getMyEvents(): user not logged in');
			}

			var deferred = $q.defer();
			_myEvents = deferred.promise;

			var publicPromise = queryEventView('events-public');
			var userPromise   = queryEventView('events-user', {
				key: username
			});

			$q.all([publicPromise, userPromise]).then(function(results) {
				var ret = {}, i, ev;
				for (i=0; i < results[0].length; i++) {
					ev = results[0][i];
					if (ev.isPublic() && ev.isFavorite()) {
						ret[ev.getId()] = ev;
					}
				}
				for (i=0; i < results[1].length; i++) {
					ev = results[1][i];
					ret[ev.getId()] = ev;
				}
				deferred.resolve(reconcileEvents(ret, []));
			}, function(err) {
				deferred.reject(err);
			});

			_myEvents['finally'](function() {
				log.debug('EventService.getMyEvents(): finished.');
				_myEvents = null;
			});
			return _myEvents;
		};

		var _myFavorites = null;
		var getMyFavorites = function() {
			if (_myFavorites) {
				return _myFavorites;
			}

			log.debug('EventService.getMyFavorites()');

			var username = UserService.getUsername();
			if (!username) {
				return rejectedResult('EventService.getMyFavorites(): user not logged in');
			}

			var deferred = $q.defer();
			_myFavorites = deferred.promise;

			queryEventView('events-all').then(function(events) {
				var ret = [], ev;
				for (var i=0; i < events.length; i++) {
					ev = events[i];
					if (ev.isFavorite()) {
						ret.push(ev);
					}
				}
				deferred.resolve(ret);
			}, function(err) {
				deferred.reject(err);
			});

			_myFavorites['finally'](function() {
				log.debug('EventService.getMyFavorites(): finished.');
				_myFavorites = null;
			});
			return _myFavorites;
		};

		var _isFavorite = null;
		var isFavorite = function(eventId) {
			if (_isFavorite) {
				return _isFavorite;
			}

			log.debug('EventService.isFavorite()');

			var username = UserService.getUsername();
			if (!username) {
				return rejectedResult('EventService.isFavorite(): user not logged in');
			}

			var deferred = $q.defer();
			_isFavorite = deferred.promise;

			var docId = 'favorite:' + username + ':' + eventId;
			_db.favorites().get(docId).then(function(response) {
				deferred.resolve(response && response._id === docId && !response._deleted);
			}, function(err) {
				log.warn('error getting ' + docId, err);
				deferred.resolve(false);
			});

			_isFavorite['finally'](function() {
				log.debug('EventService.isFavorite(): finished.');
				_isFavorite = null;
			});
			return _isFavorite;
		};

		var addFavorite = function(eventId) {
			log.debug('EventService.addFavorite(' + eventId + ')');
			var username = UserService.getUsername();
			if (!username || !eventId) {
				return rejectedResult('EventService.addFavorite(): user not logged in, or no eventId passed');
			}

			var deferred = $q.defer(),
				favId = 'favorite:' + username + ':' + eventId;

			var fav = {
				'_id': favId,
				'type': 'favorite',
				'username': username,
				'eventId': eventId,
				'lastModified': stringifyDate(moment())
			};

			var checkExisting = $q.defer();

			_db.favorites().get(favId, {
				revs: true,
				open_revs: 'all',
				conflicts: true
			}).then(function(res) {
				if (res.length > 0) {
					var obj = res[0];
					if (obj && obj.ok && obj.ok._id === favId) {
						fav._rev = obj.ok._rev;
						checkExisting.resolve(true);
					} else {
						checkExisting.resolve(false);
					}
				} else {
					checkExisting.resolve(false);
				}
			}, function(err) {
				log.warn('Checking for existing document ' + favId + ': error was: ' + err);
				checkExisting.resolve(false);
			});

			checkExisting.promise.then(function() {
				_db.favorites().put(fav).then(function(res) {
					log.debug('EventService.addFavorite(): favorite added.');
					fav._rev = res.rev;
					deferred.resolve(new CMFavorite(fav));
				}, function(err) {
					log.error(err);
					deferred.reject(err);
				});
			});

			return deferred.promise;
		};

		var removeFavorite = function(eventId) {
			log.debug('EventService.removeFavorite(' + eventId + ')');
			var username = UserService.getUsername();
			if (!username || !eventId) {
				return rejectedResult('EventService.removeFavorite(): user not logged in, or no eventId passed');
			}

			var deferred = $q.defer();

			_db.favorites().query('favorites-all', {include_docs:true,key:username}).then(function(results) {
				var remove = [], fav, promises, def, i;
				for (i=0; i < results.rows.length; i++) {
					fav = results.rows[i].doc;
					if (fav.username === username && fav.eventId === eventId) {
						fav._deleted = true;
						remove.push(fav);
					}
				}

				_db.favorites().bulk(remove).then(function(results) {
					deferred.resolve(results.length);
				}, function(err) {
					log.debug('bulk error:',err);
					deferred.reject(err);
				});
			}, function(err) {
				deferred.reject(err);
			});

			return deferred.promise;
		};

		var getEventForTime = function(time, eventList) {
			var now = moment(time).unix(),
				matched = -1,
				nextEntry,
				i, entry,
				start, end;

			log.debug('now = ' + now);
			if (eventList && eventList.length > 0) {
				for (i=0; i < eventList.length; i++) {
					entry = eventList[i];
					if (entry.getId().indexOf('day-') === 0) {
						// skip day markers, we'll fix them at the end anyways
						continue;
					} else {
						// this is an event
						start = entry.getStart().unix();
						end   = entry.getEnd() === undefined? start : entry.getEnd().unix();

						log.debug('now=' + now + ',start=' + start + ',end=' + end + ': ' + entry.getSummary());
						if (now < start) {
							// we're still before the current event
							log.debug(i + ': now < start: inexact match');
							matched = i;
							break;
						} else {
							// we're after the start of the current event

							if (now <= end) {
								// we're in the event, match!
								log.debug(i + ': now <= end: exact match');
								matched = i;
								break;
							} else {
								var j = i+1;
								nextEntry = eventList[j];
								while (nextEntry) {
									log.debug(j + '/' + eventList.length + ': nextEntry = ' + nextEntry);
									if (nextEntry.getId().indexOf('day-') === 0) {
										// next entry is a day marker, skip it
										nextEntry = eventList[j++];
										continue;
									} else {
										start = nextEntry.getStart().unix();
										end   = nextEntry.getEnd() === undefined? start : nextEntry.getEnd().unix();
										j = eventList.length;
									}

									// the next entry is after now, we'll consider it the best match
									if (now <= start) {
										log.debug(j + ': now > end: inexact match');
										matched = j;
										break;
									}
									nextEntry = eventList[j++];
								}
							}
						}
					}
				}

				log.debug('matched = ' + matched);
				entry = undefined;
				if (matched > -1) {
					entry = eventList[matched];
					log.debug('matched ' + entry.getId());
				}

				if (matched === -1) {
					return undefined;
				}

				if (entry.day === undefined && matched > 0 && eventList[matched - 1].day !== undefined) {
					log.debug('entry ' + entry.getId() + ' was the first of the day, scrolling to the day marker instead.');
					entry = eventList[matched-1];
				}
				return entry;
			} else {
				// no events, return nothing
				return undefined;
			}
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
			'getMyFavorites': getMyFavorites,
			'isFavorite': isFavorite,
			'addFavorite': addFavorite,
			'removeFavorite': removeFavorite,
			'getEventForTime': getEventForTime,
			'getNextEvent': function(events) {
				return getEventForTime(moment(), events);
			}
		};
	}]);

}());
