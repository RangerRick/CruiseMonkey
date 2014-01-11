(function() {
	'use strict';

	/*global moment: true*/
	/*global Modernizr: true*/
	/*global CMEvent: true*/
	angular.module('cruisemonkey.controllers.Events', ['ngRoute', 'cruisemonkey.User', 'cruisemonkey.Events', 'cruisemonkey.Logging', 'ionic'])
	.filter('orderByEvent', function() {
		return function(input) {
			if (!angular.isObject(input)) { return input; }

			var array = [];
			for(var objectKey in input) {
				var obj = input[objectKey];
				obj.setNewDay(false);
				array.push(obj);
			}

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

			for (var i = 0; i < array.length; i++) {
				if (i === 0) {
					array[i].setNewDay(true);
				}
			}

			return array;
		};
	})
	.controller('CMEditEventCtrl', ['$q', '$scope', '$rootScope', '$modal', 'UserService', 'LoggingService', function($q, $scope, $rootScope, $modal, UserService, log) {
		log.info('Initializing CMEditEventCtrl');

		if ($rootScope.editEvent) {
			$scope.event = $rootScope.editEvent.toEditableBean();
			delete $rootScope.editEvent;

			log.info('Found existing event to edit.');
			console.log($scope.event);
		} else {
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().add('hours', 1));
			ev.setUsername(UserService.getUsername());
			ev.setPublic(true);
			$scope.event = ev.toEditableBean();

			log.info('Created fresh event.');
			console.log($scope.event);
		}
	}])
	.controller('CMEventCtrl', ['$scope', '$rootScope', '$timeout', '$routeParams', '$location', '$q', 'Modal', '$templateCache', 'UserService', 'EventService', 'LoggingService', function($scope, $rootScope, $timeout, $routeParams, $location, $q, Modal, $templateCache, UserService, EventService, log) {
		log.info('Initializing CMEventCtrl');

		$rootScope.eventType = $routeParams.eventType;
		$rootScope.title = $routeParams.eventType.capitalize() + ' Events';

		var refreshEvents = function() {
			log.info('CMEventCtrl.refreshEvents()');
			if ($routeParams.eventType === 'official') {
				$q.when(EventService.getOfficialEvents()).then(function(e) {
					$rootScope.events = e;
					$scope.$broadcast('scroll.resize');
				});
			} else if ($routeParams.eventType === 'unofficial') {
				$q.when(EventService.getUnofficialEvents()).then(function(e) {
					$rootScope.events = e;
					$scope.$broadcast('scroll.resize');
				});
			} else if ($routeParams.eventType === 'my') {
				$q.when(EventService.getMyEvents()).then(function(e) {
					$rootScope.events = e;
					$scope.$broadcast('scroll.resize');
				});
			} else {
				log.warn('CMEventCtrl: unknown event type: ' + $routeParams.eventType);
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

		$scope.onFavoriteChanged = function(eventId, checked) {
			log.info('CMEventCtrl.onFavoriteChanged(' + eventId + ', ' + checked + ')');
			if (checked) {
				EventService.addFavorite(eventId);
			} else {
				for (var i = 0; i < $scope.events; i++) {
					if ($scope.events[i]._id === eventId) {
						$scope.events.splice(i, 1);
					}
				}
				EventService.removeFavorite(eventId);
			}
		};

		$scope.onPublicChanged = function(ev, pub) {
			console.log('onPublicChanged: ', ev, pub);
			ev.setPublic(pub);
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
			log.info('closing modal (cancel)');
			$scope.event = undefined;
			$scope.eventData = undefined;
			$scope.modal.hide();
		};

		$scope.saveModal = function(data) {
			log.info('closing modal (save)');
			
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
					content: '<i class="icon icon-add"></i>',
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
