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
		'ngCordova',
		'ionic',
		'ion-sticky',
		'jett.ionic.filter.bar',
		'cruisemonkey.DB',
		'cruisemonkey.user.User',
		'cruisemonkey.Events'
	])
	.controller('CMEditEventCtrl', function($cordovaDatePicker, $ionicPopup, $log, $q, $rootScope, $scope, $timeout, $window, EventService, UserService) {
		$log.info('Initializing CMEditEventCtrl');

		$scope.hasNative = $window && $window.plugins && $window.plugins.datePicker;
		$scope.maxEndDate = moment('2016-03-01');
		$scope.maxStartDate = $scope.maxEndDate.subtract(1, 'hour');

		$log.debug('hasNative: ' + $scope.hasNative);

		var startUpdated = function() {
			var start = moment($scope.eventData.startDate),
				end = moment($scope.eventData.endDate);

			if (end.isBefore(start)) {
				$scope.eventData.endDate = start.add(1, 'hour').toDate();
			}
		};

		var endUpdated = function() {
			var start = moment($scope.eventData.startDate),
				end = moment($scope.eventData.endDate);

			if (end.isBefore(start)) {
				$scope.eventData.startDate = end.subtract(1, 'hour').toDate();
			}
		};

		$scope.datePicker = function(type) {
			if (type === 'end' && $scope.eventData.noEndDate) {
				return;
			}
			$log.debug('starting datepicker: ' + type);
			var d = type === 'start'? $scope.eventData.startDate : $scope.eventData.endDate;
			$cordovaDatePicker.show({
				mode: 'datetime',
				date: d,
				maxDate: type === 'start'? $scope.maxStartDate.toDate() : $scope.maxEndDate.toDate(),
				minuteInterval: 5
			}).then(function (newDate) {
				if (newDate) {
					$log.debug('datePicker: old=' + moment(d).format() + ', new=' + moment(newDate).format());
					if (type === 'start') {
						$scope.eventData.startDate = newDate;
						startUpdated();
					} else {
						$scope.eventData.endDate = newDate;
						endUpdated();
					}
				}
			});
		};

		$scope.timePicker = function(type) {
			if (type === 'end' && $scope.eventData.noEndDate) {
				return;
			}
			$log.debug('starting timepicker: ' + type);
			var d = type === 'start'? $scope.eventData.startDate : $scope.eventData.endDate;
			$cordovaDatePicker.show({
				mode: 'time',
				date: d,
				maxDate: type === 'start'? $scope.maxStartDate.toDate() : $scope.maxEndDate.toDate(),
				minuteInterval: 5
			}).then(function (newDate) {
				$log.debug('datePicker: old=' + moment(d).format() + ', new=' + moment(newDate).format());
				if (newDate) {
					if (type === 'start') {
						$scope.eventData.startDate = newDate;
						startUpdated();
					} else {
						$scope.eventData.endDate = newDate;
						endUpdated();
					}
				}
			});
		};

		var initialize = function() {
			$scope.user = UserService.get();
			if ($scope.event) {
				$scope.eventData = $scope.event.toEditableBean();
				$log.info('Found existing event to edit.');
			} else {
				var ev = new CMEvent();
				var now = moment();
				ev.setStart(now);
				ev.setEnd(now.add(1, 'hours'));
				ev.setUsername($scope.user.username);
				ev.setShared(true);
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$log.info('Created fresh event.');
			}
		};

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
			if ($scope.eventData.noEndDate) {
				$scope.event.setEnd(null);
			}

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
						template: 'Failed to update event.'
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
						template: 'Failed to add event.'
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
