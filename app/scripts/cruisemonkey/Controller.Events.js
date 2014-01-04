(function() {
	'use strict';

	/*global moment: true*/
	/*global Modernizr: true*/
	angular.module('cruisemonkey.controllers.Events', ['ngRoute', 'cruisemonkey.User', 'cruisemonkey.Events', 'cruisemonkey.Logging', 'ui.bootstrap.modal'])
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
	.controller('CMEventCtrl', ['$scope', '$rootScope', '$timeout', '$routeParams', '$location', '$q', '$modal', '$templateCache', 'UserService', 'EventService', 'LoggingService', function($scope, $rootScope, $timeout, $routeParams, $location, $q, $modal, $templateCache, UserService, EventService, log) {
		log.info('Initializing CMEventCtrl');

		$rootScope.eventType = $routeParams.eventType;
		$rootScope.title = $routeParams.eventType.capitalize() + ' Events';

		var refreshEvents = function() {
			log.info('CMEventCtrl.refreshEvents()');
			if ($routeParams.eventType === 'official') {
				$rootScope.events = EventService.getOfficialEvents();
			} else if ($routeParams.eventType === 'unofficial') {
				$rootScope.events = EventService.getUnofficialEvents();
			} else if ($routeParams.eventType === 'my') {
				$rootScope.events = EventService.getMyEvents();
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
				console.log('edit: ', ev);

				$rootScope.editEvent = ev;

				var modalInstance = $modal.open({
					templateUrl:'edit-event.html',
					controller:'CMEditEventCtrl'
				});
				modalInstance.result.then(function(newEvent) {
					log.info("Save finished!");
					console.log(newEvent);
					$q.all([EventService.updateEvent(newEvent), $scope.events]).then(function(results) {
						var events = results[1];
						newEvent.start = moment(newEvent.start);
						newEvent.end   = moment(newEvent.end);
						events[newEvent._id] = newEvent;
						log.info('Finished updating event.');
					});
				}, function() {
					log.warn("Add canceled!");
				});
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

		$rootScope.actions = [];
		if (UserService.getUsername() && UserService.getUsername() !== '') {
			$rootScope.actions.push({
				'name': 'Add Event',
				'iconClass': 'add',
				'launch': function() {
					log.info('launching modal');
					var modalInstance = $modal.open({
						templateUrl:'edit-event.html',
						controller:'CMEditEventCtrl'
					});
					modalInstance.result.then(function(result) {
						log.info("Save finished!");
						console.log(result);
						$q.all([EventService.addEvent(result), $scope.events]).then(function(results) {
							var added = results[0];
							var events = results[1];
							added.start = moment(added.start);
							added.end   = moment(added.end);
							events[added._id] = added;
						});
					}, function() {
						log.warn("Add canceled!");
					});
				}
			});
		}
	}]);
}());