(function() {
	'use strict';

	/*global moment: true*/
	/*global Modernizr: true*/
	/*global CMEvent: true*/
	/*global CMFavorite: true*/
	/*global CMDay: true*/

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
		'cruisemonkey.Notifications'
	])
	.controller('CMEditEventCtrl', ['$q', '$scope', '$rootScope', 'UserService', function($q, $scope, $rootScope, UserService) {
		console.info('Initializing CMEditEventCtrl');

		if ($rootScope.editEvent) {
			$scope.event = $rootScope.editEvent.toEditableBean();
			delete $rootScope.editEvent;

			console.debug('Found existing event to edit.');
		} else {
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().add('hours', 1));
			ev.setUsername(UserService.getUsername());
			ev.setPublic(true);
			$scope.event = ev.toEditableBean();

			console.debug('Created fresh event.');
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
				var even = false, i, entry = null, ret = [];

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
				for (i=0; i < ret.length; i++) {
					ret[i].setEven(even);
					even = !even;
				}
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
	.controller('CMEventsBarCtrl', ['$scope', '$timeout', 'storage', function($scope, $timeout, storage) {
	}])
	.controller('CMEventCtrl', ['$q', '$scope', '$rootScope', '$timeout', '$ionicScrollDelegate', 'EventService', 'NotificationService', 'UserService', 'EventCache', function($q, $scope, $rootScope, $timeout, $ionicScrollDelegate, EventService, notifications, UserService, EventCache) {
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

		var refreshing = null;
		var doRefresh = function() {
			console.debug('doRefresh()');
			if (refreshing) {
				return refreshing;
			}

			var deferred = $q.defer();
			refreshing = deferred.promise;

			EventService.getAllEvents().then(function(events) {
				var filteredEvents = [], ev, i;
				var user = UserService.get();
				switch ($scope.eventType) {
					case 'official': {
						for (i=0; i < events.length; i++) {
							ev = events[i];
							if (ev.getUsername() === 'official') {
								filteredEvents.push(ev);
							}
						}
					}; break;
					case 'unofficial': {
						for (i=0; i < events.length; i++) {
							ev = events[i];
							if (ev.isPublic() && ev.getUsername() !== 'official') {
								filteredEvents.push(ev);
							} else if (user.loggedIn && ev.getUsername() === user.username) {
								filteredEvents.push(ev);
							}
						}
					}; break;
					case 'all': {
						for (i=0; i < events.length; i++) {
							ev = events[i];
							if (ev.isPublic()) {
								filteredEvents.push(ev);
							} else if (user.loggedIn && ev.getUsername() === user.username) {
								filteredEvents.push(ev);
							}
						}
					}; break;
					case 'my': {
						for (i=0; i < events.length; i++) {
							ev = events[i];
							if (ev.getUsername() === user.username) {
								filteredEvents.push(ev);
							} else if (ev.isPublic() && ev.isFavorite()) {
								filteredEvents.push(ev);
							}
						}
					}; break;
				}

				filteredEvents.sort(sortEvent);
				console.debug('CMEventCtrl: got ' + filteredEvents.length + ' ' + $scope.eventType + ' events');
				EventCache.put($scope.eventType, filteredEvents);
				deferred.resolve(true);
				updateEntries();
			}, function(err) {
				console.warn('CMEventCtrl: failed to get ' + $scope.eventType + ' events: ' + err);
				deferred.resolve(false);
			});

			refreshing['finally'](function() {
				refreshing = null;
			});

			return refreshing;
		};

		var updateEntries = function() {
			var cached = withDays(EventCache.get($scope.eventType, $scope.searchString));
			//console.debug('cached events:',cached);
			$scope.entries = cached;
			$scope.$broadcast('scroll.resize');
		};

		var findHash = function(hash) {
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
					position += (offsetTop - scrollTop + clientTop);
					scrollEl = scrollEl.parent();
				}
				console.debug('offset='+position);
				return position;
				/* $scope.$broadcast('scroll.scrollTo', 0, position, true); */
			} else {
				console.debug("can't find element " + hash);
				return 0;
			}
		};

		var timeout = null,
			refreshInterval = 5;
		var refreshEvents = function(immediately) {
			if (timeout) {
				console.debug('CMEventCtrl.refreshEvents(): Refresh already in-flight.  Skipping.');
				return;
			} else if (immediately) {
				console.debug('CMEventCtrl.refreshEvents(): Refreshing immediately.');
				doRefresh();
			} else {
				console.debug('CMEventCtrl.refreshEvents(): Refreshing in ' + refreshInterval + ' seconds.');
				timeout = $timeout(function() {
					timeout = null;
					doRefresh();
				}, refreshInterval * 1000);
			}
		};

		var updateDelayTimeout = null;
		var updateDelayed = function(delay) {
			if (updateDelayTimeout) {
				$timeout.cancel(updateDelayTimeout);
			}
			updateDelayTimeout = $timeout(function() {
				console.debug('CMEventCtrl.doUpdateDelayed()');
				updateDelayTimeout = null;
				updateEntries();
			}, delay || 300);
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
					console.debug('previousEntry=',previousEntry);
					console.debug('nextEntry=',nextEntry);
					console.debug('i=',i);
					console.debug('length=',$scope.entries.length);
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
			var nextEvent = EventService.getNextEvent($scope.entries);
			if (nextEvent) {
				var hashLocation = findHash(nextEvent.getId());
				console.debug('scrolling to hash location: ' + hashLocation);
				$ionicScrollDelegate.$getByHandle('eventScroll').scrollTo(0, hashLocation);
			} else {
				$ionicScrollDelegate.$getByHandle('eventScroll').scrollBottom();
			}
		};

		$scope.searchChanged = function(newSearchString) {
			$scope.searchString = newSearchString;
			updateDelayed();
		};

		$scope.clearSearchString = function() {
			console.info('clear search string');
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

		$scope.trash = function(ev) {
			if (window.confirm('Are you sure you want to delete "' + ev.getSummary() + '"?')) {
				removeEventFromDisplay(ev);
				EventService.removeEvent(ev).then(function() {
					refreshEvents(true);
				});
			}
		};

		$scope.onFavoriteChanged = function(ev) {
			$scope.$evalAsync(function() {
				var i, entry, eventId = ev.getId();
				console.debug('CMEventCtrl.onFavoriteChanged(' + eventId + ')');

				if (ev.isFavorite()) {
					// Event was favorited, unfavorite it
					ev.setFavorite(undefined);

					// If we're in the 'my' browser, it should disappear from the list
					if ($scope.eventType === 'my') {
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
						console.warn('Somehow favorited an event that does not exist! (' + eventId + ')');
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
			console.debug('onPublicChanged(' + ev.getId() + ')');
			$scope.$evalAsync(function() {
				ev.setPublic(!ev.isPublic());
				$scope.$broadcast('scroll.resize');
				refreshEvents(true);
				EventService.updateEvent(ev);
			});
		};

		$scope.eventTitle = 'Events';

		$scope.$on('$ionicView.loaded', function(ev, info) {
			$scope.searchString = '';
		});
		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			$scope.eventType = info.stateName.replace('app.events.', '');
			doRefresh();
		});
		$scope.$on('$ionicView.afterEnter', function(ev, info) {
			$scope.eventTitle = 'Events: ' + ($scope.eventType === 'my'? 'Mine' : $scope.eventType.capitalize());
		});
		$scope.$on('cm.main.database-initialized', function() {
			console.debug('CMEventCtrl: Database initialized.');
			$timeout(function() {
				refreshEvents(true);
			}, 100);
		});

		/*
		$scope.$on('$ionicView.enter', function(ev, info) {
			console.info('CMEventCtrl.enter:', info);
			var eventType = info.stateName.replace('app.events.', '');
			$scope.eventTitle = 'Events: ' + (eventType == 'my'? 'Mine' : eventType.capitalize());
		});
		$scope.$on('$ionicView.leave', function(ev, info) {
			console.info('CMEventCtrl.leave:', info);
		});
		$scope.$on('$ionicView.unloaded', function(ev, info) {
			console.info('CMEventCtrl.unloaded:', info);
		});
		*/
	}])
	.controller('OldCMEventCtrl', [ 'storage', '$scope', '$rootScope', '$interval', '$timeout', '$stateParams', '$location', '$q', '$ionicModal', '$ionicScrollDelegate', '$window', 'UserService', 'EventService', 'EventCache', 'NotificationService', function(storage, $scope, $rootScope, $interval, $timeout, $stateParams, $location, $q, $ionicModal, $ionicScrollDelegate, $window, UserService, EventService, EventCache, notifications) {
		console.info('Initializing CMEventCtrl');

		/*
		var message = 'Updating ' + eventType.capitalize() + ' events...';
		var scrolled = false;

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.event.' + eventType
		});
		console.debug('$scope.searchString: ' + $scope.searchString);

		$ionicModal.fromTemplateUrl('template/event-edit.html', function(modal) {
			$scope.modal = modal;
		}, {
			scope: $scope,
			animation: 'slide-in-up'
		});

		$scope.$on('cm.main.database-initialized', function() {
			console.debug('CMEventCtrl: Database initialized.');
			$timeout(function() {
				refreshEvents(true);
			}, 100);
		});

		$scope.edit = function(ev) {
			$scope.$evalAsync(function() {
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$scope.modal.show();
			});
		};

		$scope.cancelModal = function(e) {
			e.preventDefault();
			e.stopPropagation();

			console.debug('closing modal (cancel)');
			$scope.event = undefined;
			$scope.eventData = undefined;
			$scope.modal.hide();
		};

		$scope.saveModal = function(data) {
			console.debug('closing modal (save)');

			var username = UserService.getUsername();

			if (!username) {
				console.error('No username!');
				$scope.modal.hide();
				return;
			}

			var ev = $scope.event;
			ev.fromEditableBean(data);
			ev.setUsername(username);

			console.debug('saving=', ev.getRawData());

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
				console.debug('event added:', res);
				$scope.modal.hide();
				refreshEvents(true);
			});
		};

		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			if ($scope.modal) {
				$scope.modal.remove();
			}
		});

		$scope.activateModal = function(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}

			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().clone());
			ev.setEnd(ev.getEnd().add('hours', 1));
			ev.setUsername(UserService.getUsername());
			ev.setPublic(true);

			$scope.event = ev;
			$scope.eventData = ev.toEditableBean();

			$scope.modal.show();
		};

		if (UserService.getUsername() && UserService.getUsername() !== '') {
			$rootScope.rightButtons.push({
				type: 'button-clear',
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
		
		*/
	}]);
}());
