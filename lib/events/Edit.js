(function() {
	'use strict';

	var angular = require('angular'),
		moment = require('moment'),
		model = require('../data/Model'),
		CMEvent = model.CMEvent,
		CMDay = model.CMDay;

	require('moment-timezone');
	var editEventHtml = require('ngtemplate!html!./edit.html');

	angular.module('cruisemonkey.events.Edit', [
		'ui.router',
		'ionic',
		'ion-sticky',
		'jett.ionic.filter.bar',
		'cruisemonkey.DB',
		'cruisemonkey.user.User',
		'cruisemonkey.Events'
	])
	.controller('CMEditEventCtrl', function($ionicPopup, $log, $q, $rootScope, $scope, EventService, UserService) {
		$log.info('Initializing CMEditEventCtrl');

		var initialize = function() {
			if ($scope.event) {
				$scope.eventData = $scope.event.toEditableBean();
				$log.info('Found existing event to edit.');
			} else {
				var ev = new CMEvent();
				ev.setStart(moment());
				ev.setEnd(ev.getStart().add(1, 'hours'));
				ev.setUsername(UserService.getUsername());
				ev.setVisibility('all');
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$log.info('Created fresh event.');
			}
		};

		$scope.$watch('eventData', function(ev) {
			if (ev && $scope.eventData) {
				var startDate = moment(ev.startDate);
				var endDate = moment(ev.endDate);
				if (endDate.isBefore(startDate)) {
					$log.error('end date ' + endDate.format() + ' is before start date ' + startDate.format());
					$scope.eventData.endDate = angular.copy(ev.startDate);
				}
			}
		});

		$scope.saveEvent = function() {
			$log.debug('CMEditEventCtrl.saveEvent: ' + angular.toJson($scope.eventData));

			var username = UserService.getUsername();

			if (!username) {
				$log.error('No username!');
				$scope.closeEditEvent();
				return;
			}

			if (!$scope.eventData.isValid()) {
				$log.error('Cannot save, bean is invalid:' + angular.toJson($scope.eventData));
				return;
			}

			$scope.event.fromEditableBean($scope.eventData);

			$log.debug('saving event: ' + angular.toJson($scope.event.toString()));

			if ($scope.event.getId()) {
				// updating an existing event
				EventService.updateEvent($scope.event).then(function(res) {
					$log.debug('event updated: ' + angular.toJson(res));
					$rootScope.$broadcast('cruisemonkey.notify.eventUpdated', res);
					$scope.closeEditEvent();
				}, function(err) {
					$log.error('event update failed: ' + angular.toJson(err));
					$ionicPopup.alert({
						title: 'Failed',
						template: 'Failed to update event: ' + err[0]
					});
				});
			} else {
				// saving a new event
				EventService.addEvent($scope.event).then(function(res) {
					$log.debug('event added: ' + angular.toJson(res));
					$rootScope.$broadcast('cruisemonkey.notify.eventAdded', res);
					$scope.closeEditEvent();
				}, function(err) {
					$log.error('event post failed: ' + angular.toJson(err));
					$ionicPopup.alert({
						title: 'Failed',
						template: 'Failed to add event: ' + err[0]
					});
				});
			}
		};

		$scope.$on('modal.shown', function() {
			initialize();
		});
		$scope.$on('modal.hidden', function() {
			delete $scope.event;
			delete $scope.eventData;
		});
	})
	.factory('EditEvent', function($injector, $ionicModal, $log, $q, $rootScope) {
		var $scope = $rootScope.$new();
		$scope.modal = $q.defer();

		$ionicModal.fromTemplateUrl(editEventHtml, {
			animation: 'slide-in-up',
			focusFirstInput: true,
			scope: $scope
		}).then(function(modal) {
			$log.debug('Edit event modal initialized.');
			$scope.modal.resolve(modal);
		});

		$scope.closeEditEvent = function() {
			return $scope.modal.promise.then(function(modal) {
				return $q.all([
					$scope.closeKeyboard(),
					modal.hide()
				]);
			}).finally(function() {
				delete $scope.event;
			});
		};

		var openEditEvent = function(ev) {
			$log.debug('EditEvent.openEditEvent: ' + angular.toJson(ev));
			return $scope.modal.promise.then(function(modal) {
				if ($injector.has('UserDetail')) {
					var UserDetail = $injector.get('UserDetail');
					UserDetail.close();
				}
				$scope.event = ev;
				modal.show();
			});
		};

		$scope.$on('$destroy', function() {
			$scope.modal.promise.then(function(modal) {
				modal.remove();
			});
		});

		return {
			open: openEditEvent,
			close: $scope.closeEditEvent
		};
	})
	;
}());
