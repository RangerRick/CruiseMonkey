const moment = require('moment-timezone');
const day0 = parseInt(moment('2019-03-07').format('DDD'), 10);
const todayListTemplate = require('./today-list.html');

const defaultData = require('./today.json');

require('ngstorage');

angular.module('cruisemonkey.controllers.Today', [
	'ngStorage',
	'cruisemonkey.today.TodayService'
])
.config(($stateProvider) => {
	$stateProvider
		.state('tab.info-todayList', {
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

	const updateToday = (data) => {
		$log.debug('CMTodayCtrl: updating today');
		const today = moment().format('YYYY-MM-DD');
		const tomorrow = moment(today).add(1, 'day').format('YYYY-MM-DD');
		let found = false;
		angular.forEach(data, (day) => {
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

		$scope.todayData = data;
		$scope.ready = data && data.length > 0;
		$scope.error = !found;
	};

	const updateAnnouncements = (announcements) => {
		$scope.announcements = announcements ? announcements.reverse().map((announcement) => {
			announcement.timestamp = moment(announcement.timestamp);
			return announcement;
		}) : [];
		$log.debug('CMTodayCtrl: got updated announcements: ' + angular.toJson($scope.announcements));
	};

	$scope.$on('cruisemonkey.notify.today', (ev, todayData) => {
		$scope.$storage['cruisemonkey.today.data'] = todayData;
		updateToday(todayData);
	});

	$scope.$on('cruisemonkey.notify.announcements', (ev, announcements) => {
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
