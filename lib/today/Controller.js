'use strict';

(function() {
	var moment = require('moment-timezone');
	var day0 = parseInt(moment('2018-02-17').format('DDD'), 10);
	var todayListTemplate = require('ngtemplate!html!./today-list.html');

	angular.module('cruisemonkey.controllers.Today', [
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
	.controller('CMTodayCtrl', function CMTodayCtrl($log, $scope, $timeout, TodayService) {
		$log.info('Initializing CMTodayCtrl');

		$scope.$on('cruisemonkey.notify.today', function(event, todayData) {
			//$log.debug('CMTodayCtrl: got updated today data: ' + angular.toJson(todayData));
			$scope.todayData = todayData;
		});

		$scope.$watch('todayData', function(data) {
			$log.debug('CMTodayCtrl: todayData updated');
			var today = moment().format('YYYY-MM-DD');
			//var today = '2018-02-18';
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

			$scope.ready = data && data.length > 0;
			$scope.error = !found;
		});

		$scope.todayData = TodayService.get();
		TodayService.start();
		$scope.ready = false;
		$scope.error = false;
	});
}());
