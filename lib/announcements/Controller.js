(function() {
	'use strict';

	var datetime = require('../util/datetime');

	require('../data/DB');
	require('../twitarr/Service');
	require('../user/Detail');

	angular.module('cruisemonkey.announcements.Controller', [
		'ionic',
		'cruisemonkey.DB',
		'cruisemonkey.Twitarr',
		'cruisemonkey.user.Detail'
	])
	.controller('CMAnnouncementsCtrl', function($ionicLoading, $log, $rootScope, $scope, kv, Twitarr, UserDetail) {
		$log.info('Initializing CMAnnouncementsCtrl');

		$scope.openUser = UserDetail.open;

		kv.get('cruisemonkey.announcements').then(function(announcements) {
			if (!announcements) {
				return;
			}
			for (var i=0, len=announcements.length; i < len; i++) {
				announcements[i].timestamp = datetime.create(announcements[i].timestamp, 'America/New_York');
			}
			$scope.announcements = announcements;
		});

		$scope.getDisplayName = function(announcement) {
			if (announcement.display_name && announcement.display_name !== announcement.author) {
				return announcement.display_name;
			} else {
				return '@' + announcement.author;
			}
		};

		$scope.getDisplayHandle = function(announcement) {
			if (announcement.display_name && announcement.display_name !== announcement.author) {
				return '(@' + announcement.author + ')';
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
					$scope.announcements = alerts.announcements;
				}

				var newest = datetime.create('1970-01-01');
				if ($scope.announcements) {
					for (var i=0, len=$scope.announcements.length, ts; i < len; i++) {
						ts = datetime.create($scope.announcements[i].timestamp);
						if (ts.isAfter(newest)) {
							newest = ts;
						}
					}
				}
				$rootScope.$broadcast('cruisemonkey.notify.announcement-seen', newest);

				return kv.set('cruisemonkey.announcements', $scope.announcements);
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
		$scope.$on('$ionicView.unloaded', function() {
			delete $scope.announcements;
		});
	})
	;
}());
