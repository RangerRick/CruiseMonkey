function CMDay(d) {
	'use strict';
	this.day = d;
	this.getId = function() {
		return 'day-' + this.day.unix();
	};
	this.clone = function() {
		return new CMDay(this.day);
	};
}

(function() {
	'use strict';

	/*global moment: true*/
	/*global Modernizr: true*/
	/*global CMEvent: true*/
	/*global CMFavorite: true*/

	var attrA, attrB;

	var sortEvent = function(a,b) {
		attrA = a.getStart();
		attrB = b.getStart();

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

		if (attrA.isBefore(attrB)) { return -1; }
		if (attrA.isAfter(attrB)) { return 1; }

		return 0;
	};
	var sortDay = function(a,b) {
		attrA = a.day;
		attrB = b.day;
		
		if (attrA.isBefore(attrB)) {
			return -1;
		}
		if (attrA.isAfter(attrB)) {
			return 1;
		}
		return 0;
	};
	var sortFunc = function(a,b) {
		if (a.day !== undefined) {
			return sortDay(a,b);
		} else {
			return sortEvent(a,b);
		}
	};

	angular.module('cruisemonkey.controllers.Events', [
		'ui.router',
		'ionic',
		'angularLocalStorage',
		'pasvaz.bindonce',
		'cruisemonkey.User',
		'cruisemonkey.Events',
		'cruisemonkey.Logging',
		'cruisemonkey.Notifications'
	])
	.controller('CMEditEventCtrl', ['$q', '$scope', '$rootScope', 'UserService', 'LoggingService', function($q, $scope, $rootScope, UserService, log) {
		log.info('Initializing CMEditEventCtrl');

		if ($rootScope.editEvent) {
			$scope.event = $rootScope.editEvent.toEditableBean();
			delete $rootScope.editEvent;

			log.debug('Found existing event to edit.');
			// console.log($scope.event);
		} else {
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().add('hours', 1));
			ev.setUsername(UserService.getUsername());
			ev.setPublic(true);
			$scope.event = ev.toEditableBean();

			log.debug('Created fresh event.');
			// console.log($scope.event);
		}
	}])
	.factory('EventCache', [function() {
		var cache = {};
		
		var getCacheEntry = function(name) {
			if (cache[name]) {
				return cache[name];
			}
			return [];
		};

		return {
			get: function(name, searchString) {
				var even = false,
					i, j, day = null,
					entry = null,
					ret = [],
					matches = [];
					
				var cacheEntry = getCacheEntry(name);
				if (!searchString) {
					for (i=0; i < cacheEntry.length; i++) {
						ret.push(cacheEntry[i]);
					}
				} else {
					for (i=0; i < cacheEntry.length; i++) {
						entry = cacheEntry[i];
						if (entry.matches(searchString)) {
							ret.push(entry);
						}
					}
				}

				ret.sort(sortEvent);
				return ret;
			},
			put: function(name, data) {
				var evs = {}, i, entry, entries = [];
				for (i=0; i < data.length; i++) {
					entry = data[i];
					evs[entry.getId()] = entry;
				}

				angular.forEach(evs, function(e) {
					entries.push(e);
				});
				entries.sort(sortFunc);
				cache[name] = entries;
			}
		};
	}])
	.controller('CMEventCtrl', [ 'storage', '$scope', '$rootScope', '$interval', '$timeout', '$stateParams', '$location', '$q', '$ionicModal', '$ionicScrollDelegate', '$window', 'UserService', 'EventService', 'EventCache', 'LoggingService', 'NotificationService', function(storage, $scope, $rootScope, $interval, $timeout, $stateParams, $location, $q, $ionicModal, $ionicScrollDelegate, $window, UserService, EventService, EventCache, log, notifications) {
		if (!$stateParams.eventType) {
			$location.path('/events/official');
			return;
		}

		var eventType = $stateParams.eventType;
		log.info('Initializing CMEventCtrl');
		var refreshInterval = 2; // seconds

		$rootScope.headerTitle = eventType.capitalize() + ' Events';

		$scope.isDisabled = true;
		$timeout(function() {
			$scope.isDisabled = false;
		}, 500);

		var message = 'Updating ' + eventType.capitalize() + ' events...';
		var scrolled = false;

		var withDays = function(events) {
			var ret = [],
				ev, i,
				lastDay = moment('1970-01-01 00:00'),
				currentDay = null;

			for (i=0; i < events.length; i++) {
				ev = events[i];
				currentDay = ev.getDay();
				if (!lastDay.isSame(currentDay)) {
					ret.push(new CMDay(currentDay));
					lastDay = currentDay;
				}
				ret.push(ev);
			}

			return ret;
		};

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.event.' + eventType
		});
		log.debug('$scope.searchString: ' + $scope.searchString);

		$scope.entries = withDays(EventCache.get(eventType, $scope.searchString) || []);
		if ($scope.entries.length === 0) {
			notifications.status(message, 2000);
		}

		var eventMethod = EventService.getOfficialEvents;
		if (eventType === 'official') {
			eventMethod = EventService.getOfficialEvents;
		} else if (eventType === 'unofficial') {
			eventMethod = EventService.getUnofficialEvents;
		} else if (eventType === 'my') {
			eventMethod = EventService.getMyEvents;
		}

		var timeout = null;

		var getTextForElement = function(el) {
			var ret = '<' + el.nodeName.toLowerCase(),
				i, attr;
			if (el.attributes.length > 0) {
				for (i=0; i < el.attributes.length; i++) {
					attr = el.attributes[i];
					ret += ' ' + attr.name + '="' + attr.value + '"';
				}
			}
			ret += '>';
			return ret;
		};

		var goToHash = function(hash) {
			var elm, scrollEl, position = 0;
			elm = document.getElementById(hash);
			if (elm) {
				scrollEl = angular.element(elm);
				while (scrollEl) {
					if (scrollEl.hasClass('scroll-content')) {
						break;
					}
					var offsetTop = scrollEl[0].offsetTop,
						scrollTop = scrollEl[0].scrollTop,
						clientTop = scrollEl[0].clientTop;
					//console.log(offsetTop + ', ' + scrollTop + ', ' + clientTop + ': ' + getTextForElement(scrollEl[0]));
					position += (offsetTop - scrollTop + clientTop);
					scrollEl = scrollEl.parent();
				}
				console.log('offset='+position);
				$scope.$broadcast('scroll.scrollTo', 0, position, true);
			} else {
				console.log("can't find element " + hash);
			}
		};

		var updateEntries = function() {
			var cached = withDays(EventCache.get(eventType, $scope.searchString));
			console.log('cached events:',cached);
			$scope.entries = cached;
			$scope.$broadcast('scroll.resize');
		};

		var delayTimeout = null;
		var updateDelayed = function(delay) {
			if (delayTimeout) {
				$timeout.cancel(delayTimeout);
			}
			delayTimeout = $timeout(function() {
				log.debug('CMEventCtrl.doUpdateDelayed()');
				delayTimeout = null;
				updateEntries();
			}, delay || 300);
		};

		$scope.searchChanged = function(newSearchString) {
			$scope.searchString = newSearchString;
			updateDelayed();
		};

		var refreshing = null;
		var doRefresh = function() {
			if (refreshing) {
				return refreshing;
			}

			var deferred = $q.defer();
			refreshing = deferred.promise;

			log.debug('CMEventCtrl.doRefresh(): refreshing.');
			$q.when(eventMethod()).then(function(e) {
				log.debug('CMEventCtrl: got ' + e.length + ' ' + eventType + ' events');
				notifications.removeStatus(message);
				deferred.resolve(true);

				e.sort(sortEvent);
				EventCache.put(eventType, e);
				updateEntries();
			}, function() {
				log.warn('CMEventCtrl: failed to get ' + eventType + ' events');
				notifications.removeStatus(message);
				deferred.resolve(false);
			});

			refreshing['finally'](function() {
				refreshing = null;
			});

			return refreshing;
		};

		doRefresh();

		var refreshEvents = function(immediately) {
			if (timeout) {
				log.trace('CMEventCtrl.refreshEvents(): Refresh already in-flight.  Skipping.');
				return;
			} else if (immediately) {
				log.debug('CMEventCtrl.refreshEvents(): Refreshing immediately.');
				doRefresh();
			} else {
				log.debug('CMEventCtrl.refreshEvents(): Refreshing in ' + refreshInterval + ' seconds.');
				timeout = $timeout(function() {
					timeout = null;
					doRefresh();
				}, refreshInterval * 1000);
			}
		};

		var removeEventFromDisplay = function(ev) {
			var eventId = ev.getId(),
				i, entry, removeDay = false, previousEntry, nextEntry;
			for (i=0; i < $scope.entries.length; i++) {
				entry = $scope.entries[i];
				if (entry.getId() === eventId) {
					// remove the event from the list
					$scope.entries.splice(i,1);

					previousEntry = $scope.entries[i-1];
					nextEntry     = $scope.entries[i+1];
					console.log('previousEntry=',previousEntry);
					console.log('nextEntry=',nextEntry);
					console.log('i=',i);
					console.log('length=',$scope.entries.length);
					// if this is the first entry of the day...
					if (previousEntry && previousEntry.getId().indexOf('day-') === 0) {
						if ((i+1) === $scope.entries.length) {
							// ...and it's the last entry in the list, remove the day
							removeDay = true;
						} else if (nextEntry && nextEntry.getId().indexOf('day-') === 0) {
							// ...and the next entry is a new day, remove the day
							removeDay = true;
						}

						if (removeDay) {
							$scope.entries.splice(i-1, 1);
						}
					}
					break;
				}
			}
		};

		$ionicModal.fromTemplateUrl('edit-event.html', function(modal) {
			$scope.modal = modal;
		}, {
			scope: $scope,
			animation: 'slide-in-up'
		});

		$scope.$on('cm.main.refreshEvents', function() {
			log.debug('CMEventCtrl: Manual refresh triggered.');
			$timeout(function() {
				refreshEvents(true);
			}, 100);
		});
		$scope.$on('cm.database.documentchanged', function() {
			//log.debug('CMEventCtrl: Document changed.');
			refreshEvents();
		});
		$scope.$on('cm.database.changesprocessed', function() {
			log.debug('CMEventCtrl: Changes processed.');
			refreshEvents();
		});
		$scope.$on('cm.main.databaseInitialized', function() {
			log.debug('CMEventCtrl: Database initialized.');
			$timeout(function() {
				refreshEvents(true);
			}, 100);
		});
		$scope.$on('cm.localDatabaseSynced', function() {
			log.debug('CMEventCtrl: Local database synced, refreshing.');
			$timeout(function() {
				refreshEvents(true);
			}, 100);
		});
		$scope.$on('cm.EventService.remoteDocsUpdated', function() {
			log.debug('CMEventCtrl: Remote docs fetched, refreshing.');
			$timeout(function() {
				refreshEvents(true);
			}, 100);
		});
		$scope.$on('cm.main.databaseInitialized', function() {
			log.debug('CMEventCtrl: Database initialized, refreshing.');
			$timeout(function() {
				refreshEvents(true);
			}, 100);
		});

		$scope.clearSearchString = function() {
			log.info('clear search string');
			var element = document.getElementById('search');
			element.value = '';
			if ("createEvent" in document) {
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent('change', false, true);
				element.dispatchEvent(evt);
			} else {
				element.fireEvent('change');
			}
		};

		$scope.getDateId = function(date) {
			return 'date-' + date.unix();
		};

		$scope.isDay = function(entry) {
			return entry && entry.day !== undefined;
		};

		$scope.prettyDate = function(date) {
			return date? date.format('dddd, MMMM Do') : undefined;
		};

		$scope.fuzzy = function(date) {
			return date? date.fromNow() : undefined;
		};

		$scope.justTime = function(date) {
			return date? date.format('hh:mma') : undefined;
		};

		$scope.goToNow = function() {
			var now = moment().unix(),
				matched = -1,
				nextEntry,
				i, entry,
				start, end;

			//log.debug('now = ' + now);
			if ($scope.entries && $scope.entries.length > 0) {
				for (i=0; i < $scope.entries.length; i++) {
					entry = $scope.entries[i];
					if (entry.getId().indexOf('day-') === 0) {
						// skip day markers, we'll fix them at the end anyways
						continue;
					} else {
						// this is an event
						start = entry.getStart().unix();
						end   = entry.getEnd() === undefined? start : entry.getEnd().unix();

						//log.debug('now=' + now + ',start=' + start + ',end=' + end + ': ' + entry.getSummary());
						if (now < start) {
							// we're still before the current event
							//log.debug(i + ': now < start: inexact match');
							matched = i;
							break;
						} else {
							// we're after the start of the current event

							if (now <= end) {
								// we're in the event, match!
								//log.debug(i + ': now <= end: exact match');
								matched = i;
								break;
							} else {
								var j = i+1;
								nextEntry = $scope.entries[j];
								while (nextEntry) {
									if (nextEntry.getId().indexOf('day-') === 0) {
										// next entry is a day marker, skip it
										continue;
									} else {
										//log.debug('nextEntry = ' + nextEntry.getSummary());
										start = nextEntry.getStart().unix();
										end   = nextEntry.getEnd() === undefined? start : nextEntry.getEnd().unix();
										j = $scope.entries.length;
									}

									// the next entry is after now, we'll consider it the best match
									if (now <= start) {
										//log.debug(j + ': now > end: inexact match');
										matched = j;
										break;
									}
									nextEntry = $scope.entries[j++];
								}
							}
						}
					}
				}

				//log.debug('matched = ' + matched);
				entry = undefined;
				if (matched > -1) {
					entry = $scope.entries[matched];
					log.debug('matched ' + entry.getId());
				}

				if (matched === -1) {
					goToHash('the-end');
					return;
				}

				if (entry.day === undefined && matched > 0 && $scope.entries[matched - 1].day !== undefined) {
					log.debug('entry ' + entry.getId() + ' was the first of the day, scrolling to the day marker instead.');
					entry = $scope.entries[matched-1];
				}
				goToHash(entry.getId());
			}
		};

		$scope.trash = function(ev) {
			if (window.confirm('Are you sure you want to delete "' + ev.getSummary() + '"?')) {
				removeEventFromDisplay(ev);
				EventService.removeEvent(ev).then(function() {
					refreshEvents(true);
				});
			}
		};

		$scope.onFavoriteChanged = function(ev) {
			$scope.safeApply(function() {
				var i, entry, eventId = ev.getId();
				log.debug('CMEventCtrl.onFavoriteChanged(' + eventId + ')');

				if (ev.isFavorite()) {
					// Event was favorited, unfavorite it
					ev.setFavorite(undefined);

					// If we're in the 'my' browser, it should disappear from the list
					if (eventType === 'my') {
						removeEventFromDisplay(ev);
					}

					EventService.removeFavorite(eventId).then(function() {
						refreshEvents(true);
					});
				} else {
					var existing;
					for (i=0; i < $scope.entries.length; i++) {
						entry = $scope.entries[i];
						if (entry.getId() === eventId) {
							existing = entry;
							break;
						}
					}

					if (!existing) {
						log.warn('Somehow favorited an event that does not exist! (' + eventId + ')');
						return;
					}

					// Add a temporary favorite object so the UI updates
					existing.setFavorite(new CMFavorite());

					EventService.addFavorite(eventId).then(function(fav) {
						refreshEvents(true);
						/*
						fav.setEvent(existing);
						existing.setFavorite(fav);
						*/
					}, function() {
						notifications.alert('Failed to favorite ' + ev.getSummary() + '!');
						refreshEvents(true);
						/*
						existing.setFavorite(undefined);
						*/
					});
				}
			});
		};

		$scope.onPublicChanged = function(ev) {
			console.log('onPublicChanged(' + ev.getId() + ')');
			$scope.safeApply(function() {
				ev.setPublic(!ev.isPublic());
				$scope.$broadcast('scroll.resize');
				refreshEvents(true);
				EventService.updateEvent(ev);
			});
		};

		$scope.edit = function(ev) {
			$scope.safeApply(function() {
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$scope.modal.show();
			});
		};

		$scope.cancelModal = function(e) {
			e.preventDefault();
			e.stopPropagation();

			log.debug('closing modal (cancel)');
			$scope.event = undefined;
			$scope.eventData = undefined;
			$scope.modal.hide();
		};

		$scope.saveModal = function(data) {
			log.debug('closing modal (save)');

			var username = UserService.getUsername();

			if (!username) {
				log.error('No username!');
				$scope.modal.hide();
				return;
			}

			var ev = $scope.event;
			ev.fromEditableBean(data);
			ev.setUsername(username);
			if (!ev.getId()) {
				log.debug('no id, creating one');
				var u = uuid(32, 16).toLowerCase();
				log.debug('uuid=' + u);
				ev.setId(u);
			}

			console.log('saving=', ev.getRawData());

			if (ev.getRevision() && $scope.entries) {
				// update the existing event in the UI
				var eventId = ev.getId(), i, existing;
				for (i=0; i < $scope.entries.length; i++) {
					existing = $scope.entries[i];
					if (existing.getId() === eventId) {
						$scope.entries[i] = ev;
						$scope.$broadcast('scroll.resize');
						break;
					}
				}
			}

			$q.when(EventService.addEvent(ev)).then(function(res) {
				console.log('event added:', res);
				$scope.modal.hide();
				refreshEvents(true);
			});
		};

		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		  $scope.modal.remove();
		});

		$rootScope.leftButtons = [
			{
				type: 'button-positive',
				content: '<i class="icon icon-cm active ion-clock"></i>',
				tap: $scope.goToNow
			}
		];
		$rootScope.rightButtons = [];

		if (UserService.getUsername() && UserService.getUsername() !== '') {
			$rootScope.rightButtons.push({
				type: 'button-positive',
				content: '<i class="icon icon-cm active ion-ios7-plus"></i>',
				tap: function(e) {
					e.preventDefault();
					e.stopPropagation();

					var ev = new CMEvent();
					ev.setStart(moment());
					ev.setEnd(ev.getStart().clone());
					ev.setEnd(ev.getEnd().add('hours', 1));
					ev.setUsername(UserService.getUsername());
					ev.setPublic(true);

					$scope.event = ev;
					$scope.eventData = ev.toEditableBean();

					$scope.modal.show();
				}
			});
		}
	}]);
}());
