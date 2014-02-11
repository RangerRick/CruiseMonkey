(function() {
	'use strict';

	/*global moment: true*/
	/*global Modernizr: true*/
	/*global CMEvent: true*/
	/*global CMFavorite: true*/
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
	.filter('orderByEvent', function() {
		return function(input, searchString) {
			if (!angular.isObject(input)) { return input; }

			var array = [];
			angular.forEach(input, function(obj, index) {
				obj.setNewDay(false);
				if (obj.matches(searchString)) {
					array.push(obj);
				}
			});

			var attrA, attrB;

			array.sort(function(a,b) {
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
			});

			var lastStart, start;
			angular.forEach(array, function(value, index) {
				value.setNewDay(false);
				start = value.getStart();

				if (index === 0) {
					value.setNewDay(true);
				} else {
					if (start.isAfter(lastStart, 'day')) {
						value.setNewDay(true);
					}
				}

				lastStart = start;
			});

			if (array.length > 0) {
				array[0].setNewDay(true);
			}

			return array;
		};
	})
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
		
		return {
			get: function(name) {
				return cache[name];
			},
			put: function(name, data) {
				cache[name] = data;
			}
		};
	}])
	.controller('CMEventCtrl', [ 'storage', '$scope', '$rootScope', '$interval', '$timeout', '$stateParams', '$location', '$q', '$ionicModal', '$ionicScrollDelegate', '$window', 'UserService', 'EventService', 'EventCache', 'LoggingService', 'NotificationService', 'orderByEventFilter', function(storage, $scope, $rootScope, $interval, $timeout, $stateParams, $location, $q, $ionicModal, $ionicScrollDelegate, $window, UserService, EventService, EventCache, log, notifications, orderByEventFilter) {
		if (!$stateParams.eventType) {
			$location.path('/events/official');
			return;
		}

		log.info('Initializing CMEventCtrl');

		$scope.eventType = $stateParams.eventType;
		$rootScope.title = $scope.eventType.capitalize() + ' Events';

		var message = 'Updating ' + $scope.eventType.capitalize() + ' events...';
		var scrolled = false;

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.event.' + $scope.eventType
		});
		log.debug('$scope.searchString: ' + $scope.searchString);

		$scope.entries = EventCache.get($scope.eventType) || [];
		if ($scope.entries.length === 0) {
			notifications.status(message);
		}

		var eventMethod = EventService.getOfficialEvents;
		if ($scope.eventType === 'official') {
			eventMethod = EventService.getOfficialEvents;
		} else if ($scope.eventType === 'unofficial') {
			eventMethod = EventService.getUnofficialEvents;
		} else if ($scope.eventType === 'my') {
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

		var refreshing = null;
		var doRefresh = function() {
			if (refreshing) {
				return refreshing;
			}

			var deferred = $q.defer();
			refreshing = deferred.promise;

			log.debug('CMEventCtrl.doRefresh(): refreshing.');
			$q.when(eventMethod()).then(function(e) {
				log.debug('CMEventCtrl: got ' + e.length + ' ' + $scope.eventType + ' events');
				deferred.resolve(true);
				$scope.entries = e;
				EventCache.put($scope.eventType, e);
				notifications.removeStatus(message);
				$scope.$broadcast('scroll.resize');
			}, function() {
				log.warn('CMEventCtrl: failed to get ' + $scope.eventType + ' events');
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
				i,
				ev;

			if ($scope.entries && $scope.entries.length > 0) {
				var sorted = orderByEventFilter($scope.entries, $scope.searchString);
				for (i=0; i < sorted.length; i++) {
					ev = sorted[i];
					log.info('start: ' + ev.getStart() + ', now: ' + now + ', ' + ev.getSummary());
					if (now.isBefore(ev.getStart())) {
						log.info('matched! ' + ev.getId());
						goToHash(ev.getId());
						matched = true;
						break;
					}
				}
				if (!matched) {
					goToHash('the-end');
				}
			}
		};

		$scope.trash = function(ev) {
			var eventId = ev.getId();
			for (var i=0; i < $scope.entries.length; i++) {
				if ($scope.entries[i].getId() === eventId) {
					$scope.entries.splice(i, 1);
					$scope.$broadcast('scroll.resize');
					break;
				}
			}
			EventService.removeEvent(ev);
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
				var i, eventId = ev.getId();
				log.debug('CMEventCtrl.onFavoriteChanged(' + eventId + ')');

				if (ev.isFavorite()) {
					// Event was favorited, unfavorite it
					ev.setFavorite(undefined);

					// If we're in the 'my' browser, it should disappear from the list
					if ($scope.eventType === 'my') {
						for (i = 0; i < $scope.entries.length; i++) {
							if ($scope.entries[i].getId() === eventId) {
								$scope.entries.splice(i, 1);
								$scope.$broadcast('scroll.resize');
								break;
							}
						}
					}

					// Remove from the database
					EventService.removeFavorite(eventId);
				} else {
					var existing;
					for (i = 0; i < $scope.entries.length; i++) {
						if ($scope.entries[i].getId() === eventId) {
							existing = $scope.entries[i];
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

		$scope.cancelModal = function() {
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
				for (var i = 0; i < $scope.entries.length; i++) {
					var existing = $scope.entries[i];
					if (existing.getId() === ev.getId()) {
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

		$rootScope.leftButtons = [
			/*
			{
				type: 'button-positive',
				content: '<i class="icon icon-cm active ion-clock"></i>',
				tap: $scope.goToNow
			}
			*/
		];
		$rootScope.rightButtons = [];

		if (UserService.getUsername() && UserService.getUsername() !== '') {
			$rootScope.rightButtons.push({
				type: 'button-positive',
				content: '<i class="icon icon-cm active ion-ios7-plus"></i>',
				tap: function(e) {
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
