/*global emit: true*/
/*global moment: true*/
/*global Modernizr: true*/

function stringifyDate(date) {
	'use strict';

	if (date === null || date === undefined) {
		return undefined;
	}
	return moment(date).format("YYYY-MM-DD HH:mm");
}

var dateStringFormat="YYYY-MM-DD HH:mm";
if (Modernizr.inputtypes["datetime-local"]) {
	dateStringFormat="YYYY-MM-DDTHH:mm";
}

/**
  * Represents a CruiseMonkey event.  Stores "raw" javascript data for communcation
  * with the backend, and then provides memoizing/caching functions for accessors.
  */
function CMEvent(rawdata) {
	'use strict';

	var self = this;

	self.initialize = function(data) {
		self._rawdata  = data || {};
		self._favorite = undefined;
		self._newDay   = false;
		self._start    = undefined;
		self._end      = undefined;

		self._rawdata.type = 'event';

		delete self._rawdata.isFavorite;
		delete self._rawdata.isNewDay;
	};

	/**
	  * Get the event's ID.
	  *
	  * @return {String} the event ID.
	  */
	self.getId = function() {
		return self._rawdata._id;
	};
	self.setId = function(id) {
		self._rawdata._id = id;
	};

	self.getRevision = function() {
		return self._rawdata._rev;
	};
	self.setRevision = function(rev) {
		self._rawdata._rev = rev;
	};

	self.getSummary = function() {
		return self._rawdata.summary;
	};
	self.setSummary = function(summary) {
		self._rawdata.summary = summary;
	};
	
	self.getDescription = function() {
		return self._rawdata.description;
	};
	self.setDescription = function(description) {
		self._rawdata.description = description;
	};

	/**
	  * Get the start date as a Moment.js object.
	  *
	  * @return {Moment} the start date.
	  */
	self.getStart = function() {
		if (self._start === undefined) {
			self._start = moment(self._rawdata.start);
		}
		return self._start;
	};

	/**
	  * Set the start date.  Accepts a moment, a Date, or a pre-formatted string.
	  *
	  * @param {start} The date to set.
	  */
	self.setStart = function(start) {
		if (typeof start === 'string' || start instanceof String) {
			self._rawdata.start = start;
		} else {
			self._rawdata.start = stringifyDate(start);
		}
		self._start = undefined;
	};

	self.getStartString = function() {
		return self._rawdata.start;
	};

	self.setStartString = function(start) {
		self._rawdata.start = start;
		self._start = undefined;
	};

	/**
	  * Get the end date as a Moment.js object.
	  *
	  * @return {Moment} the end date.
	  */
	self.getEnd = function() {
		if (self._end === undefined) {
			self._end = moment(self._rawdata.end);
		}
		return self._end;
	};

	/**
	  * Set the end date.  Accepts a moment, a Date, or a pre-formatted string.
	  *
	  * @param {end} The date to set.
	  */
	self.setEnd = function(end) {
		if (typeof end === 'string' || end instanceof String) {
			self._rawdata.end = end;
		} else {
			self._rawdata.end = stringifyDate(end);
		}
		self._end = undefined;
	};

	self.getEndString = function() {
		return self._rawdata.end;
	};
	
	self.setEndString = function(end) {
		self._rawdata.end = end;
		self._end = undefined;
	};

	self.getUsername = function() {
		if (self._rawdata.username && self._rawdata.username !== '') {
			return self._rawdata.username;
		}
		return undefined;
	};
	self.setUsername = function(username) {
		self._rawdata.username = username;
	};

	self.getLocation = function() {
		return self._rawdata.location;
	};
	self.setLocation = function(loc) {
		self._rawdata.location = loc;
	};

	self.isPublic = function() {
		return self._rawdata.isPublic;
	};
	self.setPublic = function(pub) {
		self._rawdata.isPublic = pub;
	};

	self.isNewDay = function() {
		return self._newDay;
	};
	self.setNewDay = function(newDay) {
		self._newDay = newDay;
	};

	self.isFavorite = function() {
		return self._favorite !== undefined;
	};
	self.getFavorite = function() {
		return self._favorite;
	};
	self.setFavorite = function(fav) {
		self._favorite = fav;
	};

	self.toEditableBean = function() {
		return {
			id: self.getId(),
			revision: self.getRevision(),
			startDate: self.getStart().format(dateStringFormat),
			endDate: self.getEnd().format(dateStringFormat),
			summary: self.getSummary(),
			description: self.getDescription(),
			location: self.getLocation(),
			isPublic: self.isPublic()
		};
	};

	self.fromEditableBean = function(bean) {
		self.setId(bean.id);
		self.setRevision(bean.revision);
		self.setStart(moment(bean.startDate));
		self.setEnd(moment(bean.endDate));
		self.setSummary(bean.summary);
		self.setDescription(bean.description);
		self.setLocation(bean.location);
		self.setPublic(bean.isPublic);
	};

	self.toString = function() {
		return 'CMEvent[id=' + self._rawdata._id + ',summary=' + self._rawdata.summary + ']';
	};

	self.getRawData = function() {
		return self._rawdata;
	};

	self.matches = function(searchString) {
		if (searchString === undefined || searchString === '') {
			return true;
		}

		if (self.getSummary() !== undefined && self.getSummary().contains(searchString)) {
			return true;
		} else if (self.getDescription() !== undefined && self.getDescription().contains(searchString)) {
			return true;
		} else if (self.getLocation() !== undefined && self.getLocation().contains(searchString)) {
			return true;
		}

		return false;
	};

	self.initialize(rawdata);
}

function CMFavorite(rawdata) {
	'use strict';

	var self       = this;

	self._rawdata  = rawdata || {};
	self._rawdata.type = 'favorite';
	self._event = undefined;

	self.getId = function() {
		return self._rawdata._id;
	};
	self.setId = function(id) {
		self._rawdata._id = id;
	};
	self.getEventId = function() {
		return self._rawdata.eventId;
	};
	self.setEventId = function(eventId) {
		self._rawdata.eventId = eventId;
	};
	self.getUsername = function() {
		return self._rawdata.username;
	};
	self.setUsername = function(username) {
		self._rawdata.username = username;
	};

	self.getEvent = function() {
		return self._event;
	};
	self.setEvent = function(ev) {
		self._event = ev;
	};

	self.toString = function() {
		return 'CMFavorite[id=' + self.getId() + ',username=' + self.getUsername() + ',eventId=' + self.getEventId() + ']';
	};

	self.getRawData = function() {
		return self._rawdata;
	};
}


(function() {
	'use strict';

	angular.module('cruisemonkey.Events', ['cruisemonkey.Config', 'cruisemonkey.Database', 'cruisemonkey.User', 'cruisemonkey.Logging'])
	.factory('EventService', ['$q', '$rootScope', '$timeout', '$http', '$location', 'Database', 'UserService', 'LoggingService', 'config.database.host', 'config.database.name', 'config.database.replicate', function($q, $rootScope, $timeout, $http, $location, db, UserService, log, databaseHost, databaseName, replicate) {
		log.info('EventService: Initializing EventService.');

		var initialized = $q.defer();
		var _events = {};
		var _favorites = {};
		var _favoritesByEventId = {};
		var _processedEvents = {};

		var listeners = [],
			databaseReady = false;

		var storeEvent = function(ev) {
			// log.debug('EventService.storeEvent(' + ev.getId() + ')');
			_events[ev.getId()] = ev;
		};
		var deleteEvent = function(eventId) {
			delete _events[eventId];
		};

		var storeFavorite = function(fav) {
			_favorites[fav.getId()] = fav;
		};
		var deleteFavorite = function(favId) {
			delete _favorites[favId];
		};

		var getEventById = function(eventId) {
			return _events[eventId];
		};

		var getFavoriteByEventId = function(eventId) {
			var username = UserService.getUsername();
			if (!username) {
				// log.debug('EventService.getFavoriteByEventId(): Not logged in.');
				return;
			}

			var ev = getEventById(eventId);

			if (ev && ev.isFavorite()) {
				return ev.getFavorite();
			}

			var match;
			angular.forEach(_favorites, function(fav, id) {
				if (fav.getEventId() === eventId) {
					match = fav;
					return false;
				}
			});

			return match;
		};

		var getFavoriteById = function(favId) {
			return _favorites[favId];
		};

		var handleEventUpdated = function(doc, skipBroadcast) {
			var ev;
			if (doc instanceof CMEvent) {
				ev = doc;
			} else {
				ev = new CMEvent(doc);
			}

			// log.debug('EventService.handleEventUpdated(): Event updated: ' + ev.toString());

			var fav = getFavoriteByEventId(ev.getId());
			ev.setFavorite(fav);

			if (fav) {
				fav.setEvent(ev);
			}

			storeEvent(ev);

			if (typeof skipBroadcast === 'undefined' || !skipBroadcast) {
				$rootScope.$broadcast('cm.eventUpdated', ev);
			}
		};

		var handleFavoriteUpdated = function(doc, skipBroadcast) {
			var fav;
			if (doc instanceof CMFavorite) {
				fav = doc;
			} else {
				fav = new CMFavorite(doc);
			}

			log.info('EventService.handleFavoriteUpdated(): Updating favorite: ' + fav.toString());

			var username = UserService.getUsername();
			if (!username) {
				log.debug('EventService.handleFavoriteUpdated(): user is not logged in!');
				return;
			}
			if (username !== fav.getUsername()) {
				log.warning('EventService.handleFavoriteUpdated(): favorite does not belong to ' + username + '!');
				return;
			}

			var ev = getEventById(fav.getEventId());
			fav.setEvent(ev);

			if (ev) {
				ev.setFavorite(fav);
			} else {
				log.warning('EventService.handleFavoriteUpdated(): favorite ' + fav.getId() + ' updated, but event ' + fav.getEventId() + ' not found.');
			}

			storeFavorite(fav);

			if (typeof skipBroadcast === 'undefined' || !skipBroadcast) {
				if (ev) {
					$rootScope.$broadcast('cm.eventUpdated', ev);
				}
				$rootScope.$broadcast('cm.favoriteUpdated', fav);
			}
		};

		var handleEventDeleted = function(eventId, skipBroadcast) {
			log.debug('EventService.handleEventDeleted(): Event ' + eventId + ' deleted.');
			var existing = getEventById(eventId);

			if (existing && existing.isFavorite()) {
				var fav = existing.getFavorite();
				deleteFavorite(fav.getId());
			}
			deleteEvent(eventId);

			if (typeof skipBroadcast === 'undefined' || !skipBroadcast) {
				$rootScope.$broadcast('cm.eventDeleted', existing);
			}
		};

		var handleFavoriteDeleted = function(favoriteId, skipBroadcast) {
			log.info('EventService.handleFavoriteDeleted('+ favoriteId + ')');

			var fav = getFavoriteById(favoriteId);

			if (fav) {
				var existingEvent = fav.getEvent();
				if (existingEvent) {
					existingEvent.setFavorite(undefined);
					if (typeof skipBroadcast === 'undefined' || !skipBroadcast) {
						$rootScope.$broadcast('cm.eventUpdated', existingEvent);
					}
				}
				deleteFavorite(favoriteId);
			} else {
				log.warn('EventService.handleFavoriteDeleted(): no favorite with id ' + favoriteId + ' found.');
			}
		};

		var doQuery = function(ObjConstructor, map, options) {
			var deferred = $q.defer();

			db.database.query({map: map}, options, function(err, res) {
				$rootScope.$apply(function() {
					if (err) {
						log.error(err);
						deferred.reject(err);
					} else {
						/*jshint camelcase: false */
						var results = [], i;
						angular.forEach(res.rows, function(row, index) {
							results.push(new ObjConstructor(row.value));
						});
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
			var eventToAdd;
			if (ev instanceof CMEvent) {
				eventToAdd = ev;
			} else {
				eventToAdd = new CMEvent(ev);
			}

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				if (!eventToAdd.getUsername()) {
					log.warn('EventService.addEvent(): no username in the event!');
					deferred.reject('no username specified');
				} else {
					log.debug('EventService.addEvent(): posting event "' + eventToAdd.getSummary() + '" for user "' + eventToAdd.getUsername() + '"');
					db.database.post(eventToAdd.getRawData(), function(err, response) {
						$rootScope.$apply(function() {
							if (err) {
								log.error(err);
								deferred.reject(err);
							} else {
								eventToAdd.setId(response.id);
								eventToAdd.setRevision(response.rev);
								log.trace('eventToAdd: ' + eventToAdd.toString());
								handleEventUpdated(eventToAdd);
								deferred.resolve(eventToAdd);
							}
						});
					});
				}
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
				log.warn('EventService.updateEvent(): Attempting to update event ' + ev.summary + ', but it is missing _rev or _id!');
				deferred.reject('bad event');
				return deferred.promise;
			}

			$q.when(initialized.promise).then(function() {
				db.database.put(ev.getRawData(), function(err, response) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							ev.setRevision(response.rev);
							handleEventUpdated(ev);
							deferred.resolve(ev);
						}
					});
				});
			});

			return deferred.promise;
		};

		var removeEvent = function(doc) {
			var ev;
			if (doc instanceof CMEvent) {
				ev = doc.getRawData();
			} else {
				ev = doc;
			}

			log.debug('EventService.removeEvent(' + ev._id + ')');
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
			
			return deferred.promise;
		};

		var getAllEvents = function() {
			log.debug('EventService.getAllEvents()');
			return doQuery(CMEvent, function(doc) {
				if (doc.type === 'event') {
					emit(doc.username, doc);
				}
			}, {reduce: true});
		};

		var getAllFavorites = function() {
			log.debug('EventService.getAllFavorites()');
			return doQuery(CMFavorite, function(doc) {
				if (doc.type === 'favorite') {
					emit(doc.username, doc);
				}
			}, {reduce:true});
		};

		var getOfficialEvents = function() {
			log.debug('EventService.getOfficialEvents()');
			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.getUsername() === 'official') {
						ret.push(ev);
					}
				});
				deferred.resolve(ret);
			}, function(error) {
				log.error('EventService.getOfficialEvents(): error = ' + error);
			});

			return deferred.promise;
		};

		var getUnofficialEvents = function() {
			log.debug('EventService.getUnofficialEvents()');
			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.isPublic() && ev.getUsername() !== 'official') {
						ret.push(ev);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var getUserEvents = function() {
			log.debug('EventService.getUserEvents()');

			var username = UserService.getUsername();
			if (!username) {
				log.warn('EventService.getUserEvent(): user not logged in');
				return promisedResult([]);
			}

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.getUsername() === username) {
						ret.push(ev);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var getMyEvents = function() {
			log.debug('EventService.getMyEvents()');

			var username = UserService.getUsername();
			if (!username) {
				log.warn('EventService.getMyEvents(): user not logged in');
				return promisedResult([]);
			}

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ret = [];
				angular.forEach(_events, function(ev, id) {
					if (ev.getUsername() === username) {
						ret.push(ev);
						return;
					} else if (ev.isFavorite()) {
						ret.push(ev);
						return;
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
				angular.forEach(_favorites, function(fav, favId) {
					if (fav.getUsername() === username) {
						ret.push(fav.eventId);
					}
				});
				deferred.resolve(ret);
			});

			return deferred.promise;
		};

		var isFavorite = function(eventId) {
			var username = UserService.getUsername();
			if (!username) {
				log.warn('EventService.isFavorite(): user not logged in');
				return promisedResult(false);
			}

			var deferred = $q.defer();

			$q.when(initialized.promise).then(function() {
				var ev = getEventById(eventId);
				deferred.resolve(ev.isFavorite());
			});

			return deferred.promise;
		};

		var addFavorite = function(eventId) {
			log.debug('EventService.addFavorite(' + eventId + ')');
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
			log.debug('EventService.removeFavorite(' + eventId + ')');
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

			if (replicate) {
				$http.get(host + '/_all_docs?include_docs=true', { 'headers': { 'Accept': 'application/json' } })
					.success(function(data, status, headers, config) {
						deferred.resolve(data);
					})
					.error(function(data, status, headers, config) {
						log.error('EventService.getRemoteDocs(): failed to get all_docs from remote host = ', status);
						deferred.reject(status);
					});
			} else {
				$timeout(function() {
					log.warn('EventService.getRemoteDocs(): replication disabled, resolving with empty object');
					deferred.resolve({});
				});
			}
			return deferred.promise;
		};

		var initEventCache = function() {
			$q.all([getAllEvents(), getAllFavorites()]).then(function(results) {
				log.info('EventService.initEventCache(): Retrieved events & favorites from the database; pushing to cache.');
				var events    = results[0];
				var favorites = results[1];

				angular.forEach(events, function(ev, index) {
					handleEventUpdated(ev);
				});
				angular.forEach(favorites, function(fav, index) {
					handleFavoriteUpdated(fav);
				});
				$rootScope.$broadcast('cm.eventCachePrimed');

				log.info('EventService.initEventCache(): Pulling latest docs from remote.');
				$q.when(getRemoteDocs()).then(function(remote) {
					/*jshint camelcase: false */
					if (remote && remote.total_rows) {
						log.debug('EventService.initEventCache(): remote =', remote);
						angular.forEach(remote.rows, function(row, index) {
							var doc = row.doc;
							if (doc.type === 'event') {
								var ev = doc;
								delete ev.isFavorite;
								delete ev.isNewDay;
								handleEventUpdated(ev);
							} else if (doc.type === 'favorite') {
								var fav = doc;
								handleFavoriteUpdated(fav);
							}
						});
					}
					initialized.resolve(true);
					$rootScope.$broadcast('cm.eventCacheInitialized');
					log.info('EventService.initEventCache(): finished initializing.');
				});
			});

			$rootScope.$on('cm.documentUpdated', function(ev, doc) {
				if (doc instanceof CMEvent) {
					handleEventUpdated(doc);
				} else if (doc instanceof CMFavorite) {
					handleFavoriteUpdated(doc);
				} else if (doc.type === 'event') {
					handleEventUpdated(doc);
				} else if (doc.type === 'favorite') {
					handleFavoriteUpdated(doc);
				} else {
					console.log('unhandled document update:', doc);
				}
			});
			$rootScope.$on('cm.documentDeleted', function(ev, doc) {
				if (doc instanceof CMEvent) {
					handleEventDeleted(doc.getId());
				} else if (doc instanceof CMFavorite) {
					handleFavoriteDeleted(doc.getId());
				} else {
					var existingEvent = getEventById(doc.id);
					if (existingEvent) {
						handleEventDeleted(existingEvent.getId());
						return;
					}

					var existingFavorite = getFavoriteById(doc.id);
					if (existingFavorite) {
						handleFavoriteDeleted(existingFavorite.getId());
						return;
					}

					console.log('unhandled document deletion:', doc);
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

		return {
			'_reinit': initEventCache,
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