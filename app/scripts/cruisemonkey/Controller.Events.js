(function() {
	'use strict';

	/*global moment: true*/
	/*global Modernizr: true*/
	/*global CMEvent: true*/
	angular.module('cruisemonkey.controllers.Events', [
		'ui.router',
		'ionic',
		'angularLocalStorage',
		'cruisemonkey.User',
		'cruisemonkey.Events',
		'cruisemonkey.Logging'
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

				attrA = a.end;
				attrB = b.end;

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
	.controller('CMEditEventCtrl', ['$q', '$scope', '$rootScope', '$modal', 'UserService', 'LoggingService', function($q, $scope, $rootScope, $modal, UserService, log) {
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
	.controller('CMEventCtrl', ['storage', '$scope', '$rootScope', '$timeout', '$stateParams', '$location', '$q', 'Modal', '$templateCache', 'UserService', 'EventService', 'LoggingService', function(storage, $scope, $rootScope, $timeout, $stateParams, $location, $q, Modal, $templateCache, UserService, EventService, log) {
		log.info('Initializing CMEventCtrl');

		$rootScope.eventType = $stateParams.eventType;

		//console.log('eventType=',$rootScope.eventType);
		if (!$rootScope.eventType) {
			$location.path('/events/official');
			return;
		}

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.event.' + $rootScope.eventType
		});
		log.debug('$scope.searchString: ' + $scope.searchString);

		/*
		storage.bind($scope, '_lastEvent', {
			'storeName': 'cm.event.' + $rootScope.eventType
		});
		log.info('$scope._lastEvent: ' + $scope._lastEvent);
		*/

		$rootScope.title = $rootScope.eventType.capitalize() + ' Events';

		var refreshEvents = function() {
			log.debug('CMEventCtrl.refreshEvents()');
			if ($rootScope.eventType === 'official') {
				$q.when(EventService.getOfficialEvents()).then(function(e) {
					$rootScope.events = e;
					$scope.$broadcast('scroll.resize');
				});
			} else if ($rootScope.eventType === 'unofficial') {
				$q.when(EventService.getUnofficialEvents()).then(function(e) {
					$rootScope.events = e;
					$scope.$broadcast('scroll.resize');
				});
			} else if ($rootScope.eventType === 'my') {
				$q.when(EventService.getMyEvents()).then(function(e) {
					$rootScope.events = e;
					$scope.$broadcast('scroll.resize');
				});
			} else {
				log.warn('CMEventCtrl: unknown event type: ' + $rootScope.eventType);
			}
		};

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
			$scope.safeApply(function() {
				$q.all([EventService.removeEvent(ev), $scope.events]).then(function(response) {
					var removed = response[0];
					var events  = response[1];
					console.log('removed = ', removed.toString());
					delete events[removed.getId()];
				});
			});
		};

		$scope.edit = function(ev) {
			$scope.safeApply(function() {
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$scope.modal.show();
			});
		};

		$scope.onFavoriteChanged = function(event) {
			var eventId = event.getId();
			log.debug('CMEventCtrl.onFavoriteChanged(' + eventId + ')');
			if (event.isFavorite()) {
				for (var i = 0; i < $scope.events; i++) {
					if ($scope.events[i]._id === eventId) {
						$scope.events.splice(i, 1);
					}
				}
				EventService.removeFavorite(eventId);
			} else {
				EventService.addFavorite(eventId);
			}
		};

		$scope.onPublicChanged = function(ev) {
			console.log('onPublicChanged(' + ev.getId() + ')');
			ev.setPublic(!ev.isPublic());
			$q.when($scope.events).then(function(events) {
				EventService.updateEvent(ev);
			});
		};

		$rootScope.$on('cm.eventUpdated', function(ev, doc) {
			refreshEvents();
		});
		$rootScope.$on('cm.eventDeleted', function(ev, doc) {
			refreshEvents();
		});
		$timeout(function() {
			refreshEvents();
		}, 0);

		Modal.fromTemplateUrl('edit-event.html', function(modal) {
			$scope.modal = modal;
		}, {
			scope: $scope,
			animation: 'slide-in-up'
		});

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

			$q.when(EventService.addEvent(ev)).then(function(res) {
				console.log('event added:', res);
				$scope.modal.hide();
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
