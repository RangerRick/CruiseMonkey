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
		attrA = a.date;
		attrB = b.date;
		
		if (attrA.isBefore(attrB)) {
			return -1;
		}
		if (attrA.isAfter(attrB)) {
			return 1;
		}
		return 0;
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
					ret = [],
					i, j, day,
					entry,
					matches;
				var cacheEntry = getCacheEntry(name);
				if (!searchString) {
					for (i=0; i < cacheEntry.length; i++) {
						day = cacheEntry[i];
						for (j=0; j < day.entries.length; j++) {
							day.entries[j].setEven(even);
							even = !even;
						}
					}
					return cacheEntry;
				}

				for (i=0; i < cacheEntry.length; i++) {
					day = cacheEntry[i];
					matches = [];
					for (j=0; j < day.entries.length; j++) {
						entry = day.entries[j];
						if (entry.matches(searchString)) {
							entry.setEven(even);
							even = !even;
							matches.push(entry);
						}
					}
					if (matches.length > 0) {
						ret.push({
							date: day.date,
							entries: matches
						});
					}
				}
				return ret;
			},
			put: function(name, data) {
				cache[name] = data;
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

		$rootScope.headerTitle = eventType.capitalize() + ' Events';

		$scope.isDisabled = true;
		$timeout(function() {
			$scope.isDisabled = false;
		}, 500);

		var message = 'Updating ' + eventType.capitalize() + ' events...';
		var scrolled = false;

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.event.' + eventType
		});
		log.debug('$scope.searchString: ' + $scope.searchString);

		$scope.entries = EventCache.get(eventType, $scope.searchString) || [];
		if ($scope.entries.length === 0) {
			notifications.status(message);
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

		var goToHash = function(hash) {
			if (hash) {
				$location.hash(hash);
			} else {
				$location.hash(undefined);
			}
			$ionicScrollDelegate.anchorScroll();
		};

		var updateEntries = function() {
			$scope.entries = EventCache.get(eventType, $scope.searchString);
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

				e = e.sort(sortEvent);
				var entries = [], lastDay = null, i, entry;
				for (i=0; i < e.length; i++) {
					entry = e[i];
					log.debug(entry.getSummary() + ' ' + entry.getDay());
					if (entry.getDay() !== lastDay) {
						log.debug(entry.getDay() + ' !== ' + lastDay);
						lastDay = entry.getDay();
						entries.push({
							date: lastDay,
							entries: []
						});
					}
					entries[entries.length - 1].entries.push(entry);
				}

				//console.log('doRefresh:',entries);
				EventCache.put(eventType, entries);
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

		var refreshInterval = 5;
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
			var now = moment(),
				matched = false,
				i, j, day,
				ev;

			if ($scope.entries && $scope.entries.length > 0) {
				dayloop:
				for (i=0; i < $scope.entries.length; i++) {
					day = $scope.entries[i];
					for (j=0; j < day.entries.length; j++) {
						ev = day.entries[j];
						log.info('start: ' + ev.getStart() + ', now: ' + now + ', ' + ev.getSummary());
						if (now.isBefore(ev.getStart())) {
							log.info('matched! ' + ev.getId());
							if (j === 0) {
								// first entry in the day, go to the header instead
								goToHash($scope.getDateId(ev.getDay()));
							} else {
								goToHash(ev.getId());
							}
							matched = true;
							break dayloop;
						}
					}
				}
				if (!matched) {
					goToHash('the-end');
				}
			}
		};

		$scope.trash = function(ev) {
			if (window.confirm('Are you sure you want to delete "' + ev.getSummary() + '"?')) {
				var eventId = ev.getId(),
					i, j, day;
				dayloop:
				for (i=0; i < $scope.entries.length; i++) {
					day = $scope.entries[i];
					for (j=0; j < day.entries.length; j++) {
						if (day.entries[j].getId() === eventId) {
							// remove the event from the day list
							day.entries.splice(j, 1);
							if (day.entries.length === 0) {
								// if there are no events left in the day, remove the day too
								$scope.entries.splice(i, 1);
							}
							$scope.$broadcast('scroll.resize');
							break dayloop;
						}
					}
				}
				EventService.removeEvent(ev);
			}
		};

		$scope.edit = function(ev) {
			$scope.safeApply(function() {
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$scope.modal.show();
			});
		};

		$scope.onFavoriteChanged = function(ev) {
			$scope.safeApply(function() {
				var i, j, day, eventId = ev.getId();
				log.debug('CMEventCtrl.onFavoriteChanged(' + eventId + ')');

				if (ev.isFavorite()) {
					// Event was favorited, unfavorite it
					ev.setFavorite(undefined);

					// If we're in the 'my' browser, it should disappear from the list
					if (eventType === 'my') {
						favdayloop:
						for (i=0; i < $scope.entries.length; i++) {
							day = $scope.entries[i];
							for (j=0; j < day.entries.length; j++) {
								if (day.entries[j].getId() === eventId) {
									day.entries.splice(j, 1);
									if (day.entries.length === 0) {
										$scope.entries.splice(i, 1);
									}
									$scope.$broadcast('scroll.resize');
									break favdayloop;
								}
							}
						}
					}

					// Remove from the database
					EventService.removeFavorite(eventId);
				} else {
					var existing;
					nofavdayloop:
					for (i = 0; i < $scope.entries.length; i++) {
						day = $scope.entries[i];
						for (j=0; j < day.entries.length; j++) {
							if (day.entries[j].getId() === eventId) {
								existing = day.entries[j];
								break nofavdayloop;
							}
						}
					}

					if (!existing) {
						log.warn('Somehow favorited an event that does not exist! (' + eventId + ')');
						return;
					}

					// Add a temporary favorite object so the UI updates
					existing.setFavorite(new CMFavorite());

					EventService.addFavorite(eventId).then(function(fav) {
						fav.setEvent(existing);
						existing.setFavorite(fav);
					}, function() {
						notifications.alert('Failed to favorite ' + ev.getSummary() + '!');
						existing.setFavorite(undefined);
					});
				}
			});
		};

		$scope.onPublicChanged = function(ev) {
			console.log('onPublicChanged(' + ev.getId() + ')');
			$scope.safeApply(function() {
				ev.setPublic(!ev.isPublic());
				$scope.$broadcast('scroll.resize');
				EventService.updateEvent(ev).then(function() {
					refreshEvents(true);
				});
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
			
			var ev = $scope.event;
			ev.fromEditableBean(data);

			console.log('saving=', ev.toEditableBean());

			if (ev.getRevision() && $scope.entries) {
				// update the existing event in the UI
				var i, j, day;
				dayloop:
				for (i=0; i < $scope.entries.length; i++) {
					day = $scope.entries[i];
					for (j=0; j < day.entries.length; j++) {
						var existing = day.entries[j];
						if (existing.getId() === ev.getId()) {
							day.entries[j] = ev;
							$scope.$broadcast('scroll.resize');
							break dayloop;
						}
					}
				}
			}
			$q.when(EventService.addEvent(ev)).then(function(res) {
				console.log('event added:', res);
				$scope.modal.hide();
				refreshEvents(true);
			});
		};

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
