const datetime = require('../util/datetime');

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
.controller('CMAnnouncementsCtrl', ($ionicLoading, $log, $rootScope, $scope, $localStorage, Twitarr, UserDetail) => {
	$log.info('Initializing CMAnnouncementsCtrl');

	$scope.openUser = UserDetail.open;

	$scope.$storage = $localStorage;

	if ($scope.$storage['cruisemonkey.announcements']) {
		for (let i=0, len=$scope.$storage['cruisemonkey.announcements'].length, announcement; i < len; i++) {
			announcement = $scope.$storage['cruisemonkey.announcements'][i];
			announcement.timestamp = datetime.create(announcement.timestamp, 'America/New_York');
		}
	}

	$scope.getDisplayName = (announcement) => {
		if (announcement.author.display_name && announcement.author.display_name !== announcement.author.username) {
			return announcement.author.display_name;
		} else {
			return '@' + announcement.author.username;
		}
	};

	$scope.getDisplayHandle = (announcement) => {
		if (announcement.author.display_name && announcement.author.display_name !== announcement.author.username) {
			return '(@' + announcement.author.username + ')';
		} else {
			return '';
		}
	};

	const byMoment = (a, b) => {
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

	$scope.doRefresh = () => {
		return Twitarr.getAlerts(true).then((alerts) => {
			if (alerts && alerts.announcements) {
				alerts.announcements.sort(byMoment).reverse();
				$scope.$storage['cruisemonkey.announcements'] = alerts.announcements;
			}

			let newest = datetime.create('1970-01-01');
			if ($scope.$storage['cruisemonkey.announcements']) {
				for (let i=0, len=$scope.$storage['cruisemonkey.announcements'].length, ts; i < len; i++) {
					ts = datetime.create($scope.$storage['cruisemonkey.announcements'][i].timestamp);
					if (ts.isAfter(newest)) {
						newest = ts;
					}
				}
			}
			$rootScope.$broadcast('cruisemonkey.notify.announcement-seen', newest);
			return $scope.$storage['cruisemonkey.announcements'];
		}).finally(() => {
			$ionicLoading.hide();
		});
	};

	$scope.$on('cruisemonkey.user.updated', $scope.doRefresh);
	$scope.$on('$ionicView.beforeEnter', () => {
		$ionicLoading.show({
			template: 'Loading...',
			duration: 5000,
			noBackdrop: true
		});
		$scope.doRefresh();
	});
})
;
