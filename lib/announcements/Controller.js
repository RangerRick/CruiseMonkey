(function() {
	'use strict';

	var moment = require('moment');

	require('../data/DB');
	require('../twitarr/Service');
	require('../user/Detail');

	angular.module('cruisemonkey.announcements.Controller', [
		'ionic',
		'cruisemonkey.DB',
		'cruisemonkey.Twitarr',
		'cruisemonkey.user.Detail'
	])
	.controller('CMAnnouncementsCtrl', function($ionicLoading, $log, $scope, kv, Twitarr, UserDetail) {
		$log.info('Initializing CMAnnouncementsCtrl');

		$scope.openUser = UserDetail.open;

		kv.get('cruisemonkey.announcements').then(function(announcements) {
			if (!announcements) {
				return;
			}
			for (var i=0, len=announcements.length; i < len; i++) {
				$log.debug('timestamp = ' + angular.toJson(announcements[i].timestamp));
				announcements[i].timestamp = moment(announcements[i].timestamp);
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

		$scope.doRefresh = function() {
			return Twitarr.getAlerts(true).then(function(alerts) {
				$scope.announcements = alerts.announcements;
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
