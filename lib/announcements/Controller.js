(function() {
	'use strict';

	var datetime = require('../util/datetime');

	require('../data/DB');
	require('../twitarr/Service');
	require('../user/Detail');

	require('ngstorage');

	angular.module('cruisemonkey.announcements.Controller', [
		'ngStorage',
		'ionic',
		'cruisemonkey.Twitarr',
		'cruisemonkey.user.Detail'
	])
	.controller('CMAnnouncementsCtrl', function($ionicLoading, $log, $rootScope, $scope, $localStorage, Twitarr, UserDetail) {
		$log.info('Initializing CMAnnouncementsCtrl');

		$scope.openUser = UserDetail.open;

		$scope.$storage = $localStorage;

		if ($scope.$storage['cruisemonkey.announcements']) {
			for (var i=0, len=$scope.$storage['cruisemonkey.announcements'].length, announcement; i < len; i++) {
				announcement = $scope.$storage['cruisemonkey.announcements'][i];
				announcement.timestamp = datetime.create(announcement.timestamp, 'America/New_York');
			}
		}

		$scope.getDisplayName = function(announcement) {
			if (announcement.author.display_name && announcement.author.display_name !== announcement.author.username) {
				return announcement.author.display_name;
			} else {
				return '@' + announcement.author.username;
			}
		};

		$scope.getDisplayHandle = function(announcement) {
			if (announcement.author.display_name && announcement.author.display_name !== announcement.author.username) {
				return '(@' + announcement.author.username + ')';
			} else {
				return '';
			}
		};

		var byMoment = function(a, b) {
			if (a === undefined) {
				if (b === undefined) {
					return 0;
				} else {
					return 1;
				}
			} else {
				if (b === undefined) {
					return -1;
				} else {
					if (a.timestamp.isSame(b.timestamp)) {
						return 0;
					} else {
						return a.timestamp.isBefore(b.timestamp)? -1 : 1;
					}
				}
			}
		};

		$scope.doRefresh = function() {
			return Twitarr.getAlerts(true).then(function(alerts) {
				if (alerts && alerts.announcements) {
					alerts.announcements.sort(byMoment).reverse();
					$scope.$storage['cruisemonkey.announcements'] = alerts.announcements;
				}

				var newest = datetime.create('1970-01-01');
				if ($scope.$storage['cruisemonkey.announcements']) {
					for (var i=0, len=$scope.$storage['cruisemonkey.announcements'].length, ts; i < len; i++) {
						ts = datetime.create($scope.$storage['cruisemonkey.announcements'][i].timestamp);
						if (ts.isAfter(newest)) {
							newest = ts;
						}
					}
				}
				$rootScope.$broadcast('cruisemonkey.notify.announcement-seen', newest);
				return $scope.$storage['cruisemonkey.announcements'];
			}).finally(function() {
				$ionicLoading.hide();
			});
		};

		$scope.$on('cruisemonkey.user.updated', $scope.doRefresh);
		$scope.$on('$ionicView.beforeEnter', function() {
			$ionicLoading.show({
				template: 'Loading...',
				duration: 5000,
				noBackdrop: true
			});
			$scope.doRefresh();
		});
	})
	;
}());
