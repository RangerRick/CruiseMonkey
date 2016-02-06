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

		var beginning = datetime.create('1970-01-01');
		var resetEverything = function resetEverything() {
			delete $scope.newestAnnouncementSeen;
			delete $scope.newestAnnouncementPosted;
			delete $scope.tagAnnouncements;
			delete $scope.newestMentionSeen;
			delete $scope.newestMentionPosted;
			delete $scope.tagMentions;
			delete $scope.tagSeamails;
		};
		resetEverything();

		var watchFor = ['newestMentionSeen', 'newestMentionPosted', 'newestAnnouncementSeen', 'newestAnnouncementPosted'];
		$scope.$watchGroup(watchFor, function(newValues, oldValues) {
			for (var i=0; i < 4; i++) {
				if (newValues[i] !== oldValues[i]) {
					$log.debug('Tabs: ' + watchFor[i] + ': ' + oldValues[i] + ' -> ' + newValues[i]);
				}
			}
		});

		$scope.$on('cruisemonkey.user.updated', function tabsUserUpdated(ev, newUser, oldUser) {
			if (!newUser.loggedIn || !newUser.key) {
				resetEverything();
			}
		});

		/* Mentions */
		var updateMentionState = function() {
			if (!$scope.newestMentionSeen || !$scope.newestMentionPosted) {
				return;
			}
			$scope.tagMentions = $scope.newestMentionSeen.isBefore($scope.newestMentionPosted);
			kv.set('cruisemonkey.tabs.newest-mention-seen', $scope.newestMentionSeen);
		};
		kv.get('cruisemonkey.tabs.newest-mention-seen').then(function(timestamp) {
			if (timestamp) {
				var ts = datetime.create(timestamp);
				if (!$scope.newestMentionSeen) {
					$scope.newestMentionSeen = ts;
				} else if (ts.isAfter($scope.newestMentionSeen)) {
					$scope.newestMentionSeen = ts;
				}
			} else {
				return $q.reject('no timestamp in db');
			}
		}, function() {
			if (!$scope.newestMentionSeen) {
				$scope.newestMentionSeen = beginning;
			}
		}).finally(function() {
			updateMentionState();
		});
		$scope.$on('cruisemonkey.notify.mentions', function(ev, mentions) {
			if (mentions && mentions.length > 0) {
				var newestMention = mentions[0];
				var ts = datetime.create(newestMention.timestamp);
				if (!$scope.newestMentionPosted || ts.isAfter($scope.newestMentionPosted)) {
					$scope.newestMentionPosted = ts;
				}
				updateMentionState();
			}
		});
		$scope.$on('cruisemonkey.notify.mention-seen', function(ev, timestamp) {
			var stamp = datetime.create(timestamp);
			if (!$scope.newestMentionSeen || stamp.isAfter($scope.newestMentionSeen)) {
				$scope.newestMentionSeen = stamp;
				updateMentionState();
			}
		});

		/* Announcements */
		var updateAnnouncementState = function() {
			if (!$scope.newestAnnouncementSeen || !$scope.newestAnnouncementPosted) {
				return;
			}
			$scope.tagAnnouncements = $scope.newestAnnouncementSeen.isBefore($scope.newestAnnouncementPosted);
			kv.set('cruisemonkey.tabs.newest-announcement-seen', $scope.newestAnnouncementSeen);
		};
		kv.get('cruisemonkey.tabs.newest-announcement-seen').then(function(timestamp) {
			if (timestamp) {
				var ts = datetime.create(timestamp);
				if (!$scope.newestAnnouncementSeen) {
					$scope.newestAnnouncementSeen = ts;
				} else if (ts.isAfter($scope.newestAnnouncementSeen)) {
					$scope.newestAnnouncementSeen = ts;
				}
			} else {
				return $q.reject('no timestamp in db');
			}
		}, function() {
			if (!$scope.newestAnnouncementSeen) {
				$scope.newestAnnouncementSeen = beginning;
			}
		}).finally(function() {
			updateAnnouncementState();
		});
		$scope.$on('cruisemonkey.notify.announcements', function(ev, announcements) {
			if (announcements) {
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
			var stamp = datetime.create(timestamp);
			if (!$scope.newestAnnouncementSeen || stamp.isAfter($scope.newestAnnouncementSeen)) {
				$scope.newestAnnouncementSeen = stamp;
				updateAnnouncementState();
			}
		});

		/* Seamails */
		$scope.$on('cruisemonkey.notify.tabs.showSeamails', function(ev, show) {
			$scope.tagSeamails = show? '*':undefined;
		});

	})
	;
}());
