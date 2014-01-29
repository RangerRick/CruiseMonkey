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

	self.getDisplayTime = function() {
		if (self.getStart()) {
			var ret = self.getStart().format('hh:mma');
			if (self.getEnd()) {
				ret += '-' + self.getEnd().format('hh:mma');
			}
			return ret;
		}
		return undefined;
	};

	self.toEditableBean = function() {
		var bean = {
			id: self.getId(),
			revision: self.getRevision(),
			startDate: self.getStart().format(dateStringFormat),
			endDate: self.getEnd().format(dateStringFormat),
			summary: self.getSummary(),
			description: self.getDescription(),
			location: self.getLocation(),
			isPublic: self.isPublic()
		};

		bean.isValid = function() {
			if (bean.summary === undefined || bean.summary === '') { return false; }
			if (bean.startDate === undefined || bean.startDate === '') { return false; }
			if (bean.endDate === undefined || bean.endDate === '') { return false; }

			if (moment(bean.endDate).isBefore(moment(bean.startDate))) {
				return false;
			}

			return true;
		};

		return bean;
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
		return 'CMEvent[id=' + self._rawdata._id + ',summary=' + self._rawdata.summary + ',favorite=' + self.isFavorite() + ',public=' + self.isPublic() + ']';
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

		var listeners = [],
			databaseReady = false;

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

		var doQuery = function(ObjConstructor, mapFunc, options) {
			var deferred = $q.defer();

			$q.when(db.getDatabase()).then(function(database) {
				database.query({map: mapFunc}, options, function(err, res) {
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
			});

			return deferred.promise;
		};

		var doEventQuery = function(username, mapFunc, matchFunc) {
			if (!mapFunc || !matchFunc) {
				return rejectedResult('EventService.doEventQuery(): you must specify a map function and a match function!');
			}

			var deferred = $q.defer();

			$q.when(db.getDatabase()).then(function(database) {
				/*jshint camelcase: false */
				database.query({
					map: mapFunc
				}, {
					reduce:true,
					include_docs:true,
					key:username
				}, function(err, res) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var ret = [];
							var lastEvent;
							var doc;
							angular.forEach(res.rows, function(row, index) {
								doc = row.doc;
								if (doc.type === 'event') {
									if (matchFunc(doc)) {
										lastEvent = new CMEvent(doc);
										ret.push(lastEvent);
									} else {
										log.debug('EventService.doEventQuery(): event (' + doc._id + ') did not match matchFunc()!  Skipping.');
										lastEvent = undefined;
									}
								} else if (doc.type === 'favorite') {
									if (lastEvent === undefined) {
										log.debug('EventService.doEventQuery(): favorite matched, but no event scanned!');
									} else if (lastEvent.getId() !== doc.eventId) {
										log.debug('EventService.doEventQuery(): favorite matched, but eventId (' + doc.eventId + ') does not match last event (' + lastEvent.getId() + ')');
									} else {
										var fav = new CMFavorite(row.doc);
										fav.setEvent(lastEvent);
										lastEvent.setFavorite(fav);
										log.debug('EventService.doEventQuery(): found favorite: ' + fav.toString());
									}
								} else {
									log.warn('EventService.doEventQuery(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(ret);
						}
					});
				});
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

			$q.when(db.getDatabase()).then(function(database) {
				if (!eventToAdd.getUsername()) {
					log.warn('EventService.addEvent(): no username in the event!');
					deferred.reject('no username specified');
				} else {
					log.debug('EventService.addEvent(): posting event "' + eventToAdd.getSummary() + '" for user "' + eventToAdd.getUsername() + '"');
					database.post(eventToAdd.getRawData(), function(err, response) {
						$rootScope.$apply(function() {
							if (err) {
								log.error(err);
								deferred.reject(err);
							} else {
								eventToAdd.setId(response.id);
								eventToAdd.setRevision(response.rev);
								log.trace('eventToAdd: ' + eventToAdd.toString());
								deferred.resolve(eventToAdd);
								db.replicateNow();
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

			$q.when(db.getDatabase()).then(function(database) {
				database.put(ev.getRawData(), function(err, response) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							ev.setRevision(response.rev);
							deferred.resolve(ev);
							db.replicateNow();
						}
					});
				});
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

			$q.when(db.getDatabase()).then(function(database) {
				database.remove(ev.getRawData(), function(err, response) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							deferred.resolve(response);
							db.replicateNow();
						}
					});
				});
			});

			return deferred.promise;
		};

		var _allEvents = null;
		var getAllEvents = function() {
			if (_allEvents) {
				return _allEvents;
			}

			log.debug('EventService.getAllEvents()');
			_allEvents = doQuery(CMEvent, function(doc) {
				if (doc.type === 'event') {
					emit(doc.username, doc);
				}
			}, {reduce: true});
			_allEvents['finally'](function() {
				_allEvents = null;
			});
			return _allEvents;
		};

		var _allFavorites = null;
		var getAllFavorites = function() {
			if (_allFavorites) {
				return _allFavorites;
			}

			log.debug('EventService.getAllFavorites()');
			_allFavorites = doQuery(CMFavorite, function(doc) {
				if (doc.type === 'favorite') {
					emit(doc.username, doc);
				}
			}, {reduce:true});
			_allFavorites['finally'](function() {
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

			$q.when(db.getDatabase()).then(function(database) {
				/*jshint camelcase: false */
				database.query({
					map: function(doc) {
						if (doc.type === 'event' && doc.username === 'official') {
							emit(doc._id);
						} else if (doc.type === 'favorite') {
							emit(doc.eventId);
							emit(doc._id);
						}
					}
				}, {
					reduce:true,
					include_docs:true
				}, function(err, res) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var username = UserService.getUsername();

							var ret = [];
							var lastEvent;
							var doc;
							angular.forEach(res.rows, function(row, index) {
								doc = row.doc;
								if (doc.type === 'event') {
									if (doc.username === 'official') {
										lastEvent = new CMEvent(doc);
										ret.push(lastEvent);
									} else {
										log.debug('EventService.getOfficialEvents(): event (' + doc._id + ') did not match matchFunc()!  Skipping.');
										lastEvent = undefined;
									}
								} else if (doc.type === 'favorite') {
									if (username) {
										if (lastEvent === undefined) {
											// log.debug('EventService.getOfficialEvents(): favorite matched, but no event scanned!');
										} else if (lastEvent.getId() !== doc.eventId) {
											log.debug('EventService.getOfficialEvents(): favorite matched, but eventId (' + doc.eventId + ') does not match last event (' + lastEvent.getId() + ')');
										} else if (doc.username !== username) {
											log.debug('EventService.getOfficialEvents(): favorite matched, but username (' + doc.username + ') does not match logged-in user (' + username + ')');
										} else {
											var fav = new CMFavorite(row.doc);
											fav.setEvent(lastEvent);
											lastEvent.setFavorite(fav);
											log.debug('EventService.getOfficialEvents(): found favorite: ' + fav.toString());
										}
									}
								} else {
									log.warn('EventService.getOfficialEvents(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(ret);
						}
					});
				});
			});

			_officialEvents['finally'](function() {
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

			var username = UserService.getUsername();
			var deferred = $q.defer();
			_unofficialEvents = deferred.promise;

			$q.when(db.getDatabase()).then(function(database) {
				/*jshint camelcase: false */
				database.query({
					map: function(doc) {
						if (doc.type === 'event' && doc.username !== 'official') {
							emit(doc._id);
						} else if (doc.type === 'favorite') {
							emit(doc.eventId);
							emit(doc._id);
						}
					}
				}, {
					reduce:true,
					include_docs:true
				}, function(err, res) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var username = UserService.getUsername();
							var ret = [];
							var lastEvent;
							var doc;
							angular.forEach(res.rows, function(row, index) {
								doc = row.doc;
								if (doc.type === 'event') {
									if (doc.isPublic) {
										lastEvent = new CMEvent(doc);
										ret.push(lastEvent);
									} else {
										log.debug('EventService.getUnofficialEvents(): event (' + doc._id + ') did not match matchFunc()!  Skipping.');
										lastEvent = undefined;
									}
								} else if (doc.type === 'favorite') {
									if (username) {
										if (lastEvent === undefined) {
											log.debug('EventService.getUnofficialEvents(): favorite matched, but no event scanned!');
										} else if (lastEvent.getId() !== doc.eventId) {
											log.debug('EventService.getUnofficialEvents(): favorite matched, but eventId (' + doc.eventId + ') does not match last event (' + lastEvent.getId() + ')');
										} else if (doc.username !== username) {
											log.debug('EventService.getUnofficialEvents(): favorite matched, but username (' + doc.username + ') does not match logged-in user (' + username + ')');
										} else {
											var fav = new CMFavorite(row.doc);
											fav.setEvent(lastEvent);
											lastEvent.setFavorite(fav);
											log.debug('EventService.getUnofficialEvents(): found favorite: ' + fav.toString());
										}
									}
								} else {
									log.warn('EventService.getUnofficialEvents(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(ret);
						}
					});
				});
			});

			_unofficialEvents['finally'](function() {
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

			_userEvents = doEventQuery(username, function(doc) {
				if (doc.type === 'event' && doc.username !== 'official') {
					emit(doc.username, {'_id': doc._id, 'type': doc.type});
				}
			}, function(doc) {
				return (doc.username === username);
			});
			_userEvents['finally'](function() {
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

			_myEvents = doEventQuery(username, function(doc) {
				if (doc.type === 'event') {
					emit(doc.username, {'_id': doc._id, 'type': doc.type});
				} else if (doc.type === 'favorite') {
					emit(doc.username, {'_id': doc.eventId, 'type': doc.type});
					emit(doc.username, {'_id': doc._id, 'type': doc.type});
				}
			}, function(doc) {
				return (doc.isPublic || doc.username === username);
			});
			_myEvents['finally'](function() {
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

			$q.when(db.getDatabase()).then(function(database) {
				/*jshint camelcase: false */
				database.query({
					map: function(doc) {
						if (doc.type === 'favorite') {
							emit(doc.username, {'_id':doc.eventId});
							emit(doc.username, {'_id':doc._id});
						}
					}
				}, {
					reduce:true,
					include_docs:true,
					key:username
				}, function(err, res) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var ret = [];
							var lastEvent;
							var doc;
							angular.forEach(res.rows, function(row, index) {
								doc = row.doc;
								if (doc.type === 'event') {
									if (doc.username === username) {
										lastEvent = new CMEvent(doc);
										ret.push(lastEvent);
									} else if (doc.isPublic) {
										lastEvent = new CMEvent(doc);
										ret.push(lastEvent);
									} else {
										log.debug('EventService.getMyFavorites(): event (' + doc._id + ') found that is not owned by ' + username + ', but it is not public!  Skipping.');
										lastEvent = undefined;
									}
								} else if (doc.type === 'favorite') {
									if (lastEvent === undefined) {
										log.debug('EventService.getMyFavorites(): favorite matched, but no event scanned!');
									} else if (lastEvent.getId() !== doc.eventId) {
										log.debug('EventService.getMyFavorites(): favorite matched, but eventId (' + doc.eventId + ') does not match last event (' + lastEvent.getId() + ')');
									} else {
										var fav = new CMFavorite(row.doc);
										fav.setEvent(lastEvent);
										lastEvent.setFavorite(fav);
									}
								} else {
									log.warn('EventService.getMyFavorites(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(ret);
						}
					});
				});
			});

			_myFavorites['finally'](function() {
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

			$q.when(db.getDatabase()).then(function(database) {
				/*jshint camelcase: false */
				database.query({
					map: function(doc) {
						if (doc.type === 'favorite') {
							emit({ username: doc.username, eventId: doc.eventId }, null);
						}
					}
				}, {
					reduce:true,
					include_docs:true,
					key: {username: username, eventId: eventId}
				}, function(err, res) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							deferred.resolve(res.total_rows > 0);
						}
					});
				});
			});

			_isFavorite['finally'](function() {
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

			var deferred = $q.defer();

			$q.when(db.getDatabase()).then(function(database) {
				var fav = {
					'type': 'favorite',
					'username': username,
					'eventId': eventId
				};

				database.post(fav, function(err, res) {
					$rootScope.$apply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							fav._id = res.id;
							fav._rev = res.rev;
							deferred.resolve(new CMFavorite(fav));
						}
					});
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

			$q.when(db.getDatabase()).then(function(database) {
				log.debug('EventService.removeFavorite(): removing');
				/* first, we get the list of favorites pointing to the given event ID */
				/*jshint camelcase: false */
				database.query(
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

								console.log('removeFavorite(): results =',res.rows);

								/* for any existing favorites associated with the event,
								store a promise to delete that event */
								angular.forEach(res.rows, function(row, index) {
									var def = $q.defer();
									promises.push(def.promise);

									var favoriteId = row.value;
									var doc = row.doc;
									database.remove(doc, function(err, res) {
										$rootScope.$apply(function() {
											if (err) {
												log.error(err);
												def.reject(err);
											} else {
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
								log.debug('EventService.removeFavorite(): no rows matched ' + eventId + ' for username ' + username);
								deferred.resolve(0);
							}
						}
					});
				});
			});

			return deferred.promise;
		};

		var _remoteDocs = null;
		var getRemoteDocs = function() {
			if (_remoteDocs) {
				return _remoteDocs;
			}

			if (!databaseHost) {
				databaseHost = $location.host();
			}
			var host = 'http://' + databaseHost + ':5984/' + databaseName;
			var deferred = $q.defer();
			_remoteDocs = deferred.promise;

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
			
			_remoteDocs['finally'](function() {
				_remoteDocs = null;
			});
			return _remoteDocs;
		};

		$rootScope.$on('$destroy', function() {
			angular.forEach(listeners, function(listener) {
				listener();
			});
		});

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
			'removeFavorite': removeFavorite
		};
	}]);

}());
