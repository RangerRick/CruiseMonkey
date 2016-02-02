(function() {
	'use strict';

	var datetime = require('../util/datetime');

	require('../data/DB');
	require('../twitarr/Service');

	angular.module('cruisemonkey.tabs.Controller', [
		'ionic',
		'cruisemonkey.DB',
		'cruisemonkey.Twitarr'
	])
	.controller('CMTabsCtrl', function($log, $q, $scope, kv, Twitarr) {
		$log.info('Initializing CMTabsCtrl');

		var updateAnnouncementState = function() {
			$log.debug('newest announcement seen: ' + $scope.newestAnnouncementSeen.format());
			$log.debug('newest announcement posted: ' + $scope.newestAnnouncementPosted.format());
			$scope.tagAnnouncements = $scope.newestAnnouncementSeen.isBefore($scope.newestAnnouncementPosted);
			kv.set('cruisemonkey.tabs.newest-announcement-seen', $scope.newestAnnouncementSeen);
		};

		kv.get('cruisemonkey.tabs.newest-announcement-seen').then(function(timestamp) {
			if (timestamp && !$scope.newestAnnouncementSeen) {
				$scope.newestAnnouncementSeen = datetime.create(timestamp);
			} else {
				$scope.newestAnnouncementSeen = datetime.create('1970-01-01');
			}
		}, function() {
			$scope.newestAnnouncementSeen = datetime.create('1970-01-01');
		});

		$scope.$on('cruisemonkey.notify.tabs.showMentions', function(ev, show) {
			$log.debug('CMTabsCtrl: tagMentions: ' + show);
			$scope.tagMentions = show? '*':undefined;
		});
		$scope.$on('cruisemonkey.notify.tabs.showAnnouncements', function(ev, show) {
			$log.debug('CMTabsCtrl: tagAnnouncements: ' + show);
			$scope.tagAnnouncements = show? '*':undefined;
		});
		$scope.$on('cruisemonkey.notify.tabs.showSeamails', function(ev, show) {
			$log.debug('CMTabsCtrl: tagSeamails: ' + show);
			$scope.tagSeamails = show? '*':undefined;
		});
		$scope.$on('cruisemonkey.notify.allAnnouncements', function(ev, announcements) {
			if (announcements) {
				$log.debug('CMTabsCtrl: announcements: ' + announcements.length);
				for (var i=0, len=announcements.length, ts; i < len; i++) {
					ts = datetime.create(announcements[i].timestamp);
					if (!$scope.newestAnnouncementPosted || ts.isAfter($scope.newestAnnouncementPosted)) {
						$scope.newestAnnouncementPosted = ts;
					}
				}
			}
			updateAnnouncementState();
		});
		$scope.$on('cruisemonkey.notify.announcement-seen', function(ev, timestamp) {
			$scope.newestAnnouncementSeen = datetime.create(timestamp);
			$log.debug('announcement seen: ' + $scope.newestAnnouncementSeen);
			updateAnnouncementState();
		});
	})
	;
}());
