'use strict';

(function() {
	var moment = require('moment-timezone');
	var day0 = parseInt(moment('2019-03-08').format('DDD'), 10);
	var todayListTemplate = require('ngtemplate!html!./today-list.html');

	var defaultData = require('json!./today.json');

	require('ngstorage');

	angular.module('cruisemonkey.controllers.Today', [
		'ngStorage',
		'cruisemonkey.today.TodayService'
	])
	.config(function($stateProvider) {
		$stateProvider
			.state('tab.info-today-list', {
				url: '/info/today-list',
				views: {
					'tab-info': {
						templateUrl: todayListTemplate,
						controller: 'CMTodayCtrl'
					}
				}
			})
	})
	.controller('CMTodayCtrl', function CMTodayCtrl($log, $scope, $timeout, $localStorage, TodayService) {
		$log.info('Initializing CMTodayCtrl');

		$scope.$storage = $localStorage;

		var updateToday = function(data) {
			$log.debug('CMTodayCtrl: updating today');
			var today = moment().format('YYYY-MM-DD');
			var tomorrow = moment(today).add(1, 'day').format('YYYY-MM-DD');
			var found = false;
			angular.forEach(data, function(day) {
				day.displayDate = moment(day.date).format('dddd M/D');
				day.dayNumber = parseInt(moment(day.date).format('DDD'), 10) - day0;
				if (day.date === today) {
					$log.info('Found today: ' + angular.toJson(day));
					$scope.today = day;
					found = true;
				} else if (day.date === tomorrow) {
					$log.info('Found tomorrow: ' + angular.toJson(day));
					$scope.tomorrow = day;
				}
			});

			$scope.date = moment(today).format('dddd M/D');
			$scope.day = parseInt(moment(today).format('DDD'), 10) - day0;

			$log.debug('today: ' + angular.toJson($scope.today));
			$log.debug('tomorrow: ' + angular.toJson($scope.tomorrow));

			$scope.ready = data && data.length > 0;
			$scope.error = !found;
		};

		var updateAnnouncements = function(announcements) {
			$scope.announcements = announcements ? announcements.reverse().map(function(announcement) {
				announcement.timestamp = moment(announcement.timestamp);
				return announcement;
			}) : [];
			$log.debug('CMTodayCtrl: got updated announcements: ' + angular.toJson($scope.announcements));
		};

		$scope.$on('cruisemonkey.notify.today', function(ev, todayData) {
			$scope.$storage['cruisemonkey.today.data'] = todayData;
			updateToday(todayData);
		});

		$scope.$on('cruisemonkey.notify.announcements', function(ev, announcements) {
			$scope.$storage['cruisemonkey.today.announcements'] = announcements;
			updateAnnouncements(announcements);
		});

		$scope.ready = false;
		$scope.error = false;

		if ($scope.$storage['cruisemonkey.today.data']) {
			updateToday($scope.$storage['cruisemonkey.today.data']);
		} else {
			$scope.todayData = TodayService.get();
		}
		updateToday(defaultData);

		if ($scope.$storage['cruisemonkey.today.announcements']) {
			updateAnnouncements($scope.$storage['cruisemonkey.today.announcements']);
		}

		TodayService.start();
	});
}());
