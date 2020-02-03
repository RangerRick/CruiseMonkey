const datetime = require('../util/datetime'),
	model = require('../data/Model'),
	CMDay = model.CMDay,
	CMEvent = model.CMEvent;

require('angular-uuid4');
require('ngstorage');

angular.module('cruisemonkey.Events', [
	'ngStorage',
	'uuid4',
	'cruisemonkey.Config',
	'cruisemonkey.user.User'
])
.factory('EventService', ($log, $q, $rootScope, $localStorage, Twitarr, UserService) => {
	const scope = $rootScope.$new();

	// re-initialize objects
	if ($localStorage['cruisemonkey.events.events']) {
		for (let i=0, len=$localStorage['cruisemonkey.events.events'].length, ev; i < len; i++) {
			ev = $localStorage['cruisemonkey.events.events'][i];
			if (ev && ev._rawdata) {
				$localStorage['cruisemonkey.events.events'][i] = new CMEvent(ev._rawdata);
			}
		}
	}

	const wipeDatabase = () => {
		$log.info('EventService: wiping event cache.');
		delete $localStorage['cruisemonkey.events.events'];
		delete $localStorage['cruisemonkey.events.last-user'];
		return true;
	};

	scope.$on('cruisemonkey.wipe-cache', () => {
		return wipeDatabase();
	});

	scope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
			return wipeDatabase();
		}
	});

	scope.$on('cruisemonkey.user.updated', (ev, user) => {
		const lastUser = $localStorage['cruisemonkey.events.last-user'];
		if (lastUser && (lastUser.username !== user.username || lastUser.loggedIn !== user.loggedIn)) {
			// User has changed enough that the event cache is not trustworthy.  Clear it.
			$log.info('User info has changed.  Clearing event database.');
			wipeDatabase();
			$localStorage['cruisemonkey.events.last-user'] = user;
		} else {
			$localStorage['cruisemonkey.events.last-user'] = user;
		}
	});

	const sortEvent = (a,b) => {
		if (a === null) {
			if (b === null) {
				return 0;
			} else {
				return -1;
			}
		} else if (b === undefined) {
			return 1;
		}

		let attrA = a.getStart(),
			attrB = b.getStart();

		if (attrA === undefined) {
			//$log.warn('event start is undefined: ' + a.toString());
			if (attrB === undefined) {
				//$log.warn('BOTH event starts are undefined: ' + a.toString() + ' / ' + b.toString());
				return 0;
			} else {
				return -1;
			}
		} else if (attrB === undefined) {
			return 1;
		}

		if (attrA.isBefore(attrB)) {
			return -1;
		}
		if (attrA.isAfter(attrB)) {
			return 1;
		}

		attrA = a.getSummary().toLowerCase();
		attrB = b.getSummary().toLowerCase();

		if (attrA > attrB) { return 1; }
		if (attrA < attrB) { return -1; }

		attrA = a.getEnd();
		attrB = b.getEnd();

		if (attrA === undefined) {
			//$log.warn('event end is undefined: ' + a.toString());
			if (attrB === undefined) {
				//$log.warn('BOTH event ends are undefined: ' + a.toString() + ' / ' + b.toString());
				return 0;
			} else {
				return -1;
			}
		} else if (attrB === undefined) {
			return 1;
		}

		if (attrA.isBefore(attrB)) { return -1; }
		if (attrA.isAfter(attrB)) { return 1; }

		return 0;
	};

	const getEvents = () => {
		$log.debug('EventService.getEvents()');
		if (!$localStorage['cruisemonkey.events.events']) {
			$localStorage['cruisemonkey.events.events'] = {};
		}
		const existingEvents = $localStorage['cruisemonkey.events.events'];
		return Twitarr.getEvents().then((events) => {
			const seen = {};
			for (let i=0, len=events.length, event; i < len; i++) {
				event = events[i];
				seen[event.id]++;
				event.lastUpdated = CMEvent._stringifyDate(datetime.create());
				existingEvents[event.id] = event;
			}
			const keys = Object.keys(existingEvents);
			for (let i=0, len=keys.length, key; i < len; i++) {
				if (!seen[key]) {
					delete existingEvents[key];
				}
			}
			$localStorage['cruisemonkey.events.events'] = existingEvents;
			//$log.debug('Got events: ' + angular.toJson(events));
			return events;
		});
	};

	const doCachedQuery = (/* where */) => {
		const existingEvents = $localStorage['cruisemonkey.events.events'];
		if (existingEvents) {
			const keys = Object.keys(existingEvents);
			return $q.resolve(keys.map((id) => {
				return new CMEvent(existingEvents[id]);
			}).sort(sortEvent));
		}
		return $q.when([]);
	};

	const doQuery = (where) => {
		return getEvents().then((events) => {
			return events.filter(where).map((event) => {
				return new CMEvent(event);
			}).sort(sortEvent);
		}, (err) => {
			let json = angular.toJson(err);
			if (json && json.length > 500) {
				json = json.substring(0, 500) + '...';
			}
			$log.debug('doQuery: getEvents() failed, falling back to cache: ' + json);
			return doCachedQuery(where);
		});
	};

	const getAllEvents = (cached) => {
		const query = function AllEvents() {
			return true;
		};
		return cached? doCachedQuery(query) : doQuery(query);
	};

	const getOfficialEvents = (cached) => {
		const query = function OfficialEvents(ev) {
			return ev.official;
		};
		return cached? doCachedQuery(query) : doQuery(query);
	};

	const getUnofficialEvents = (cached) => {
		const query = function ShadowEvents(ev) {
			return !ev.official;
		};
		return cached? doCachedQuery(query) : doQuery(query);
	};

	const getUserEvents = (cached) => {
		const user = UserService.get();
		if (!user.loggedIn) {
			return $q.reject('User is not logged in!');
		}
		const query = function UserEvents(ev) {
			return ev.author.username === user.username;
		};
		return cached? doCachedQuery(query) : doQuery(query);
	};


	const getFollowedEvents = (cached) => {
		const user = UserService.get();
		if (!user.loggedIn) {
			return $q.reject('User is not logged in!');
		}
		const query = function FollowedEvents(ev) {
			return !!ev.following;
		};
		return cached? doCachedQuery(query) : doQuery(query);
	};

	const addEvent = (event) => {
		return Twitarr.addEvent(event.getRawData()).then((ret) => {
			$log.debug('EventService.addEvent: success: ' + angular.toJson(ret));
			return ret;
		}, (err) => {
			$log.debug('EventService.addEvent: failed: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const updateEvent = (event) => {
		return Twitarr.updateEvent(event.getRawData()).then((ret) => {
			$log.debug('EventService.updateEvent: success: ' + angular.toJson(ret));
			return ret;
		}, (err) => {
			$log.debug('EventService.updateEvent: failed: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const removeEvent = (event) => {
		return Twitarr.removeEvent(event.getId()).then((ret) => {
			$log.debug('EventService.removeEvent: success: ' + angular.toJson(ret));
			return ret;
		}, (err) => {
			$log.debug('EventService.removeEvent: failed: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const follow = (event) => {
		return Twitarr.followEvent(event.getId()).then((ret) => {
			$log.debug('EventService.follow: success: ' + angular.toJson(ret));
			return ret;
		}, (err) => {
			$log.debug('EventService.follow: failed: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const unfollow = (event) => {
		return Twitarr.unfollowEvent(event.getId()).then((ret) => {
			$log.debug('EventService.unfollow: success: ' + angular.toJson(ret));
			return ret;
		}, (err) => {
			$log.debug('EventService.unfollow: failed: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const getEventForTime = (time, eventList) => {
		const now = datetime.create(time).unix();
		let matched = -1,
			entry,
			nextEntry,
			j,
			start, end;

		//$log.debug('now = ' + now);
		if (eventList && eventList.length > 0) {
			for (let i = 0, len=eventList.length; i < len; i++) {
				entry = eventList[i];
				if (entry instanceof CMDay) {
					// skip day markers, we'll fix them at the end anyways
					continue;
				} else {
					// this is an event
					start = entry.getStart().unix();
					end = entry.getEnd() === undefined ? start : entry.getEnd().unix();
					if (end - start > 43200) {
						end = start + 43200;
					}

					//$log.debug('now=' + now + ',start=' + start + ',end=' + end + ': ' + entry.getSummary());
					if (now < start) {
						// we're still before the current event
						//$log.debug(i + ': now < start: inexact match');
						matched = i;
						break;
					} else {
						// we're after the start of the current event

						if (now <= end) {
							// we're in the event, match!
							//$log.debug(i + ': now <= end: exact match');
							matched = i;
							break;
						} else {
							j = i + 1;
							nextEntry = eventList[j];
							while (nextEntry) {
								//$log.debug(j + '/' + len + ': nextEntry = ' + nextEntry);
								if (nextEntry instanceof CMDay) {
									// next entry is a day marker, skip it
									nextEntry = eventList[j++];
									continue;
								} else {
									start = nextEntry.getStart().unix();
									end = nextEntry.getEnd() === undefined ? start : nextEntry.getEnd().unix();
									j = len;
								}

								// the next entry is after now, we'll consider it the best match
								if (now <= start) {
									//$log.debug(j + ': now > end: inexact match');
									matched = j;
									break;
								}
								nextEntry = eventList[j++];
							}
						}
					}
				}
			}

			//$log.debug('matched = ' + matched);
			entry = undefined;
			if (matched > -1) {
				entry = eventList[matched];
				$log.debug('matched ' + entry.getId());
			}

			if (matched === -1) {
				return undefined;
			}

			/*
			if (entry instanceof CMEvent && matched > 0 && eventList[matched - 1] instanceof CMDay) {
				$log.debug('entry ' + entry.getId() + ' was the first of the day, scrolling to the day marker instead.');
				entry = eventList[matched - 1];
			}
			*/
			return entry;
		} else {
			// no events, return nothing
			return undefined;
		}
	};

	return {
		addEvent: addEvent,
		updateEvent: updateEvent,
		removeEvent: removeEvent,
		getAllEvents: getAllEvents,
		getOfficialEvents: getOfficialEvents,
		getUnofficialEvents: getUnofficialEvents,
		getUserEvents: getUserEvents,
		getFollowedEvents: getFollowedEvents,
		follow: follow,
		unfollow: unfollow,
		getEventForTime: getEventForTime,
		getNextEvent: (events) => { return getEventForTime(datetime.create(), events); },
		wipeDatabase: wipeDatabase
	};
})
;
