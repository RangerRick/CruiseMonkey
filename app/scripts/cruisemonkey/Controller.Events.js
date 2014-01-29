(function() {
	'use strict';

	/*global moment: true*/
	/*global Modernizr: true*/
	/*global CMEvent: true*/
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
	.controller('CMEventCtrl', ['storage', '$scope', '$rootScope', '$timeout', '$stateParams', '$location', '$q', '$ionicModal', '$templateCache', 'UserService', 'EventService', 'EventCache', 'LoggingService', 'NotificationService', function(storage, $scope, $rootScope, $timeout, $stateParams, $location, $q, $ionicModal, $templateCache, UserService, EventService, EventCache, log, notifications) {
		if (!$stateParams.eventType) {
			$location.path('/events/official');
			return;
		}

		log.info('Initializing CMEventCtrl');

		$scope.eventType = $stateParams.eventType;
		$rootScope.title = $scope.eventType.capitalize() + ' Events';

		var message = 'Updating ' + $scope.eventType.capitalize() + ' events...';

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.event.' + $scope.eventType
		});
		log.debug('$scope.searchString: ' + $scope.searchString);

		$scope.events = EventCache.get($scope.eventType) || [];
		if ($scope.events.length === 0) {
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

		eventMethod().then(function(events) {
			log.debug('CMEventCtrl: got ' + events.length + ' ' + $scope.eventType + ' events');
			$scope.events = events;
			EventCache.put($scope.eventType, events);
			notifications.removeStatus(message);
		}, function() {
			log.warn('CMEventCtrl: failed to get ' + $scope.eventType + ' events');
			notifications.removeStatus(message);
		});

		var timeout = null;

		var doRefresh = function() {
			var deferred = $q.defer();

			log.debug('CMEventCtrl.doRefresh(): refreshing.');
			if ($scope.eventType === 'official') {
				$q.when(EventService.getOfficialEvents()).then(function(e) {
					deferred.resolve(true);
					$scope.events = e;
					$scope.$broadcast('scroll.resize');
				}, function() {
					deferred.resolve(false);
				});
			} else if ($scope.eventType === 'unofficial') {
				$q.when(EventService.getUnofficialEvents()).then(function(e) {
					deferred.resolve(true);
					$scope.events = e;
					$scope.$broadcast('scroll.resize');
				}, function() {
					deferred.resolve(false);
				});
			} else if ($scope.eventType === 'my') {
				$q.when(EventService.getMyEvents()).then(function(e) {
					deferred.resolve(true);
					$scope.events = e;
					$scope.$broadcast('scroll.resize');
				}, function() {
					deferred.resolve(false);
				});
			} else {
				log.warn('CMEventCtrl.doRefresh(): unknown event type: ' + $scope.eventType);
				$timeout(function() {
					deferred.resolve(false);
				});
			}

			return deferred.promise;
		};

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

		$scope.$on('cm.documentUpdated', function(ev, doc) {
			refreshEvents();
		});
		$scope.$on('cm.documentDeleted', function(ev, doc) {
			refreshEvents();
		});
		$scope.$on('cm.main.databaseInitialized', function() {
			log.debug('CMEventCtrl: Database initialized, refreshing.');
			$timeout(function() {
				refreshEvents(true);
			}, 1000);
		});

		$scope.clearSearchString = function() {
			$scope.searchString = undefined;
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

		$scope.trash = function(ev) {
			var eventId = ev.getId();
			for (var i=0; i < $scope.events.length; i++) {
				if ($scope.events[i].getId() === eventId) {
					$scope.events.splice(i, 1);
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

		$scope.onFavoriteChanged = function(event) {
			$scope.safeApply(function() {
				var i, eventId = event.getId();
				log.debug('CMEventCtrl.onFavoriteChanged(' + eventId + ')');

				if (event.isFavorite()) {
					event.setFavorite(undefined);
					for (i = 0; i < $scope.events.length; i++) {
						if ($scope.events[i].getId() === eventId) {
							$scope.events.splice(i, 1);
							$scope.$broadcast('scroll.resize');
							break;
						}
					}
					EventService.removeFavorite(eventId);
				} else {
					var existing;
					for (i = 0; i < $scope.events.length; i++) {
						if ($scope.events[i].getId() === eventId) {
							existing = $scope.events[i];
							break;
						}
					}

					if (!existing) {
						log.warn('Somehow favorited an event that does not exist! (' + eventId + ')');
						return;
					}

					EventService.addFavorite(eventId).then(function(fav) {
						fav.setEvent(existing);
						existing.setFavorite(fav);
						$scope.$broadcast('scroll.resize');
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

			if (ev.getRevision() && $scope.events) {
				// update the existing event in the UI
				for (var i = 0; i < $scope.events.length; i++) {
					var existing = $scope.events[i];
					if (existing.getId() === ev.getId()) {
						$scope.events[i] = ev;
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

		var newButtons = [];
		if (UserService.getUsername() && UserService.getUsername() !== '') {
			newButtons = [
				{
					type: 'button-positive',
					content: '<i class="icon icon-cm active ion-ios7-plus"></i>',
					tap: function(e) {
						var ev = new CMEvent();
						ev.setStart(moment());
						ev.setEnd(ev.getEnd().add('hours', 1));
						ev.setUsername(UserService.getUsername());
						ev.setPublic(true);

						$scope.event = ev;
						$scope.eventData = ev.toEditableBean();

						$scope.modal.show();
					}
				}
			];
		}
		$rootScope.rightButtons = newButtons;
	}]);
}());
