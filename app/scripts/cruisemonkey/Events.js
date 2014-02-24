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

var epochZero = stringifyDate(moment(0));

function CMEvent(data) {
	'use strict';

	var self = this;

	self._rawdata  = angular.copy(data) || {};
	self._favorite = undefined;
	self._day      = undefined;
	self._start    = undefined;
	self._end      = undefined;

	self._rawdata.type = 'event';

	if (self._rawdata.start === 'Invalid date') {
		self._rawdata.start = undefined;
	}
	if (self._rawdata.end === 'Invalid date') {
		self._rawdata.end = undefined;
	}
	if (self._rawdata.lastUpdated === 'Invalid date') {
		self._rawdata.lastUpdated = undefined;
	}
	if (self._rawdata.lastUpdated === undefined) {
		self._rawdata.lastUpdated = moment(epochZero);
	}

	delete self._rawdata.isFavorite;
	delete self._rawdata.isNewDay;
}

function CMFavorite(data) {
	'use strict';

	var self = this;

	self._rawdata  = angular.copy(data) || {};
	self._rawdata.type = 'favorite';
	self._event = undefined;

	if (self._rawdata.lastUpdated === 'Invalid date') {
		self._rawdata.lastUpdated = undefined;
	}
	if (self._rawdata.lastUpdated === undefined) {
		self._rawdata.lastUpdated = moment(epochZero);
	}
}

CMEvent.prototype.clone = function() {
	'use strict';
	var newobj = new CMEvent(this._rawdata);
	if (this._favorite !== undefined) {
		newobj.setFavorite(new CMFavorite(this._favorite.getRawData()));
		newobj.getFavorite().setEvent(newobj);
	}
	newobj._day   = angular.copy(this._day);
	newobj._start = angular.copy(this._start);
	newobj._end   = angular.copy(this._end);
	newobj._even  = angular.copy(this._even);

	return newobj;
};

CMEvent.prototype.isEven = function() {
	'use strict';
	return this._even || false;
};
CMEvent.prototype.setEven = function(bool) {
	'use strict';
	this._even = bool;
};

CMEvent.prototype.getId = function() {
	'use strict';
	return this._rawdata._id;
};
CMEvent.prototype.setId = function(id) {
	'use strict';
	this._rawdata._id = id;
};

CMEvent.prototype.getRevision = function() {
	'use strict';
	return this._rawdata._rev;
};
CMEvent.prototype.setRevision = function(rev) {
	'use strict';
	this._rawdata._rev = rev;
};

CMEvent.prototype.getSummary = function() {
	'use strict';
	return this._rawdata.summary;
};
CMEvent.prototype.setSummary = function(summary) {
	'use strict';
	this._rawdata.summary = summary;
};

CMEvent.prototype.getDescription = function() {
	'use strict';
	return this._rawdata.description;
};
CMEvent.prototype.setDescription = function(description) {
	'use strict';
	this._rawdata.description = description;
};

CMEvent.prototype.getDay = function() {
	'use strict';
	if (this._day === undefined && this._rawdata.start !== undefined) {
		this._day = moment(this._rawdata.start).startOf('day');
	}
	return this._day;
};

/**
  * Get the start date as a Moment.js object.
  *
  * @return {Moment} the start date.
  */
CMEvent.prototype.getStart = function() {
	'use strict';
	if (this._start === undefined && this._rawdata.start !== undefined) {
		this._start = moment(this._rawdata.start);
	}
	return this._start;
};

/**
  * Set the start date.  Accepts a moment, a Date, or a pre-formatted string.
  *
  * @param {start} The date to set.
  */
CMEvent.prototype.setStart = function(start) {
	'use strict';
	if (typeof start === 'string' || start instanceof String) {
		this._rawdata.start = start;
	} else {
		this._rawdata.start = stringifyDate(start);
	}
	this._start = undefined;
	this._day = undefined;
};

CMEvent.prototype.getStartString = function() {
	'use strict';
	return this._rawdata.start;
};

CMEvent.prototype.setStartString = function(start) {
	'use strict';
	this._rawdata.start = start;
	this._start = undefined;
	this._day = undefined;
};

/**
  * Get the end date as a Moment.js object.
  *
  * @return {Moment} the end date.
  */
CMEvent.prototype.getEnd = function() {
	'use strict';
	if (this._end === undefined && this._rawdata.end !== undefined) {
		this._end = moment(this._rawdata.end);
	}
	return this._end;
};

/**
  * Set the end date.  Accepts a moment, a Date, or a pre-formatted string.
  *
  * @param {end} The date to set.
  */
CMEvent.prototype.setEnd = function(end) {
	'use strict';
	if (typeof end === 'string' || end instanceof String) {
		this._rawdata.end = end;
	} else {
		this._rawdata.end = stringifyDate(end);
	}
	this._end = undefined;
};

CMEvent.prototype.getEndString = function() {
	'use strict';
	return this._rawdata.end;
};
CMEvent.prototype.setEndString = function(end) {
	'use strict';
	this._rawdata.end = end;
	this._end = undefined;
};

CMEvent.prototype.getLastUpdated = function() {
	'use strict';
	return moment(this._rawdata.lastUpdated);
};
CMEvent.prototype.refreshLastUpdated = function() {
	'use strict';
	this._rawdata.lastUpdated = stringifyDate(moment());
};

CMEvent.prototype.getUsername = function() {
	'use strict';
	if (this._rawdata.username !== undefined && this._rawdata.username !== '') {
		return this._rawdata.username;
	}
	return undefined;
};
CMEvent.prototype.setUsername = function(username) {
	'use strict';
	this._rawdata.username = username;
};

CMEvent.prototype.getLocation = function() {
	'use strict';
	return this._rawdata.location;
};
CMEvent.prototype.setLocation = function(loc) {
	'use strict';
	this._rawdata.location = loc;
};

CMEvent.prototype.isPublic = function() {
	'use strict';
	return this._rawdata.isPublic;
};
CMEvent.prototype.setPublic = function(pub) {
	'use strict';
	this._rawdata.isPublic = pub;
};

CMEvent.prototype.isFavorite = function() {
	'use strict';
	return this._favorite !== undefined;
};
CMEvent.prototype.getFavorite = function() {
	'use strict';
	return this._favorite;
};
CMEvent.prototype.setFavorite = function(fav) {
	'use strict';
	this._favorite = fav;
};

CMEvent.prototype.getDisplayTime = function() {
	'use strict';
	var start = this.getStart(), end, ret;
	if (start) {
		ret = start.format('hh:mma');
		end = this.getEnd();
		if (end) {
			ret += '-' + end.format('hh:mma');
		}
		return ret;
	}
	return undefined;
};

CMEvent.prototype.toEditableBean = function() {
	'use strict';
	var end = this.getEnd();

	var bean = {
		id: this.getId(),
		revision: this.getRevision(),
		startDate: this.getStart().format(dateStringFormat),
		endDate: end? end.format(dateStringFormat) : undefined,
		summary: this.getSummary(),
		description: this.getDescription(),
		location: this.getLocation(),
		isPublic: this.isPublic()
	};

	bean.isValid = function() {
		if (bean.summary === undefined || bean.summary === '') { return false; }
		if (bean.startDate === undefined || bean.startDate === '') { return false; }

		if (bean.endDate && moment(bean.endDate).isBefore(moment(bean.startDate))) {
			return false;
		}

		return true;
	};

	return bean;
};

CMEvent.prototype.fromEditableBean = function(bean) {
	'use strict';
	this.setId(bean.id);
	this.setRevision(bean.revision);
	this.setStart(moment(bean.startDate));
	this.setEnd(bean.endDate? moment(bean.endDate) : undefined);
	this.setSummary(bean.summary);
	this.setDescription(bean.description);
	this.setLocation(bean.location);
	this.setPublic(bean.isPublic);
};

CMEvent.prototype.toString = function() {
	'use strict';
	return 'CMEvent[id=' + this._rawdata._id + ',summary=' + this._rawdata.summary + ',favorite=' + this.isFavorite() + ',public=' + this.isPublic() + ']';
};

CMEvent.prototype.getRawData = function() {
	'use strict';
	return this._rawdata;
};

CMEvent.prototype.matches = function(searchString) {
	'use strict';
	if (searchString === undefined || searchString === '') {
		return true;
	}

	if (this.getSummary() !== undefined && this.getSummary().contains(searchString)) {
		return true;
	} else if (this.getDescription() !== undefined && this.getDescription().contains(searchString)) {
		return true;
	} else if (this.getLocation() !== undefined && this.getLocation().contains(searchString)) {
		return true;
	}

	return false;
};

CMFavorite.prototype.getId = function() {
	'use strict';
	return this._rawdata._id;
};
CMFavorite.prototype.setId = function(id) {
	'use strict';
	this._rawdata._id = id;
};
CMFavorite.prototype.getEventId = function() {
	'use strict';
	return this._rawdata.eventId;
};
CMFavorite.prototype.setEventId = function(eventId) {
	'use strict';
	this._rawdata.eventId = eventId;
};
CMFavorite.prototype.getUsername = function() {
	'use strict';
	return this._rawdata.username;
};
CMFavorite.prototype.setUsername = function(username) {
	'use strict';
	this._rawdata.username = username;
};

CMFavorite.prototype.getEvent = function() {
	'use strict';
	return this._event;
};
CMFavorite.prototype.setEvent = function(ev) {
	'use strict';
	this._event = ev;
};

CMFavorite.prototype.getLastUpdated = function() {
	'use strict';
	return moment(this._rawdata.lastUpdated);
};
CMFavorite.prototype.refreshLastUpdated = function() {
	'use strict';
	this._rawdata.lastUpdated = stringifyDate(moment());
};

CMFavorite.prototype.toString = function() {
	'use strict';
	return 'CMFavorite[id=' + this.getId() + ',username=' + this.getUsername() + ',eventId=' + this.getEventId() + ']';
};

CMFavorite.prototype.getRawData = function() {
	'use strict';
	return this._rawdata;
};

(function() {
	'use strict';

	angular.module('cruisemonkey.Events', ['cruisemonkey.Config', 'cruisemonkey.Database', 'cruisemonkey.User', 'cruisemonkey.Logging'])
	.factory('EventService', ['$q', '$rootScope', '$timeout', '$location', 'Database', 'UserService', 'LoggingService', 'config.database.host', 'config.database.name', 'config.database.replicate', function($q, $rootScope, $timeout, $location, db, UserService, log, databaseHost, databaseName, replicate) {
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
					$rootScope.safeApply(function() {
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

		var reconcileEvents = function(events, favorites) {
			var _events = {}, _favs = {}, fav, i, ret = [];
			for (i=0; i < events.length; i++) {
				_events[events[i]._rawdata._id] = events[i];
			}
			for (i=0; i < favorites.length; i++) {
				fav = favorites[i];
				_favs[fav.getEventId()] = fav;
			}

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
					/*reduce: true,*/
					include_docs:true,
					key:username
				}, function(err, res) {
					$rootScope.safeApply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var events = [];
							var favorites = [];
							var lastEvent;
							var doc;
							angular.forEach(res.rows, function(row, index) {
								// console.log('row=',row);
								if (!row.doc) {
									return;
								}
								doc = row.doc;
								if (doc.type === 'event') {
									if (matchFunc(doc)) {
										events.push(new CMEvent(doc));
									} else {
										log.debug('EventService.doEventQuery(): event (' + doc._id + ') did not match matchFunc()!  Skipping.');
										lastEvent = undefined;
									}
								} else if (doc.type === 'favorite') {
									favorites.push(new CMFavorite(doc));
								} else {
									log.warn('EventService.doEventQuery(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(reconcileEvents(events, favorites));
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
				if (eventToAdd.getUsername() === undefined) {
					log.warn('EventService.addEvent(): no username in the event!');
					deferred.reject('no username specified');
				} else {
					log.debug('EventService.addEvent(): posting event "' + eventToAdd.getSummary() + '" for user "' + eventToAdd.getUsername() + '"');
					eventToAdd.refreshLastUpdated();
					database.post(eventToAdd.getRawData(), function(err, response) {
						$rootScope.safeApply(function() {
							if (err) {
								log.error(err);
								deferred.reject(err);
							} else {
								eventToAdd.setId(response.id);
								eventToAdd.setRevision(response.rev);
								log.trace('eventToAdd: ' + eventToAdd.toString());
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

			$q.when(db.getDatabase()).then(function(database) {
				ev.refreshLastUpdated();
				database.put(ev.getRawData(), function(err, response) {
					$rootScope.safeApply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							ev.setRevision(response.rev);
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
				ev = doc;
			} else {
				ev = new CMEvent(doc);
			}

			log.debug('EventService.removeEvent(' + ev.getId() + ')');
			var deferred = $q.defer();

			$q.when(db.getDatabase()).then(function(database) {
				database.remove(ev.getRawData(), function(err, response) {
					$rootScope.safeApply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							deferred.resolve(response);
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
			}, {/*reduce: true*/});
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

			log.debug('EventService.getAllFavorites()');
			_allFavorites = doQuery(CMFavorite, function(doc) {
				if (doc.type === 'favorite') {
					emit(doc.username, doc);
				}
			}, {/*reduce: true*/});
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
					/*reduce: true,*/
					include_docs:true
				}, function(err, res) {
					$rootScope.safeApply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var username = UserService.getUsername();

							var events = [],
								favorites = [],
								doc;
							angular.forEach(res.rows, function(row, index) {
								doc = row.doc;
								if (doc.type === 'event') {
									if (doc.username === 'official') {
										events.push(new CMEvent(doc));
									} else {
										log.debug('EventService.getOfficialEvents(): event (' + doc._id + ') did not match matchFunc()!  Skipping.');
									}
								} else if (doc.type === 'favorite') {
									if (username && doc.username === username) {
										favorites.push(new CMFavorite(doc));
									}
								} else {
									log.warn('EventService.getOfficialEvents(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(reconcileEvents(events, favorites));
						}
					});
				});
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
					/*reduce: true,*/
					include_docs:true
				}, function(err, res) {
					$rootScope.safeApply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var username = UserService.getUsername();

							var events = [],
								favorites = [],
								doc;
							angular.forEach(res.rows, function(row, index) {
								doc = row.doc;
								if (doc.type === 'event') {
									if (doc.isPublic) {
										events.push(new CMEvent(doc));
									} else {
										log.debug('EventService.getUnofficialEvents(): event (' + doc._id + ') did not match matchFunc()!  Skipping.');
									}
								} else if (doc.type === 'favorite') {
									if (username && doc.username === username) {
										favorites.push(new CMFavorite(doc));
									}
								} else {
									log.warn('EventService.getUnofficialEvents(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(reconcileEvents(events, favorites));
						}
					});
				});
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

			_userEvents = doEventQuery(username, function(doc) {
				if (doc.type === 'event' && doc.username !== 'official') {
					emit(doc.username, {'_id': doc._id, 'type': doc.type});
				}
			}, function(doc) {
				return (doc.username === username);
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
					/*reduce: true,*/
					include_docs:true,
					key:username
				}, function(err, res) {
					$rootScope.safeApply(function() {
						if (err) {
							log.error(err);
							deferred.reject(err);
						} else {
							var events = [],
								favorites = [],
								doc;
							angular.forEach(res.rows, function(row, index) {
								doc = row.doc;
								if (doc.type === 'event') {
									if (doc.username === username || doc.isPublic) {
										events.push(new CMEvent(doc));
									}
								} else if (doc.type === 'favorite') {
									favorites.push(new CMFavorite(doc));
								} else {
									log.warn('EventService.getMyFavorites(): unknown document type (' + doc.type + ') matched for id: ' + doc._id);
								}
							});
							deferred.resolve(reconcileEvents(events, favorites));
						}
					});
				});
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

			$q.when(db.getDatabase()).then(function(database) {
				/*jshint camelcase: false */
				database.query({
					map: function(doc) {
						if (doc.type === 'favorite') {
							emit({ username: doc.username, eventId: doc.eventId }, null);
						}
					}
				}, {
					/*reduce: true,*/
					include_docs:true,
					key: {username: username, eventId: eventId}
				}, function(err, res) {
					$rootScope.safeApply(function() {
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
				favId = 'favorite-' + username + '-' + eventId;

			$q.when(db.getDatabase()).then(function(database) {
				var fav = {
					'_id': favId,
					'type': 'favorite',
					'username': username,
					'eventId': eventId,
					'lastModified': stringifyDate(moment())
				};

				var checkExisting = $q.defer();

				/*jshint camelcase: false */
				database.get(favId, {
					revs: true,
					open_revs: 'all',
					conflicts: true
				}, function(err, res) {
					$rootScope.safeApply(function() {
						if (err) {
							log.error('Error getting existing (deleted) favorite.');
							console.log(err);
							checkExisting.resolve(false);
						} else if (res && res.length > 0) {
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
					});
				});

				checkExisting.promise.then(function() {
					database.post(fav, function(err, res) {
						$rootScope.safeApply(function() {
							if (err) {
								log.error(err);
								deferred.reject(err);
							} else {
								log.debug('EventService.addFavorite(): favorite added.');
								fav._rev = res.rev;
								deferred.resolve(new CMFavorite(fav));
							}
						});
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
					/*reduce: true,*/
					include_docs: true,
					key: { 'username': username, 'eventId': eventId }
				},
				function(err, res) {
					$rootScope.safeApply(function() {
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
										$rootScope.safeApply(function() {
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
								log.debug('EventService.removeFavorite(): finished.');
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
