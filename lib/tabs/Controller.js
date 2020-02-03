require('../data/DB');

const datetime = require('../util/datetime');

require('../data/DB');
require('../twitarr/Service');

angular.module('cruisemonkey.tabs.Controller', [
	'ionic',
	'cruisemonkey.DB',
	'cruisemonkey.Twitarr'
])
.controller('CMTabsCtrl', ($log, $q, $scope, kv) => {
	$log.info('Initializing CMTabsCtrl');

	const beginning = datetime.create('1970-01-01');
	const resetEverything = function resetEverything() {
		delete $scope.newestAnnouncementSeen;
		delete $scope.newestAnnouncementPosted;
		delete $scope.tagAnnouncements;
		delete $scope.newestMentionSeen;
		delete $scope.newestMentionPosted;
		delete $scope.tagMentions;
		delete $scope.tagSeamails;
	};
	resetEverything();

	const watchFor = ['newestMentionSeen', 'newestMentionPosted', 'newestAnnouncementSeen', 'newestAnnouncementPosted'];
	$scope.$watchGroup(watchFor, (newValues, oldValues) => {
		for (let i=0; i < 4; i++) {
			if (newValues[i] !== oldValues[i]) {
				$log.debug('Tabs: ' + watchFor[i] + ': ' + oldValues[i] + ' -> ' + newValues[i]);
			}
		}
	});

	$scope.$on('cruisemonkey.user.updated', (ev, newUser) => {
		if (!newUser.loggedIn || !newUser.key) {
			resetEverything();
		}
	});

	/* Mentions */
	const updateMentionState = () => {
		if (!$scope.newestMentionSeen || !$scope.newestMentionPosted) {
			return;
		}
		$scope.tagMentions = $scope.newestMentionSeen.isBefore($scope.newestMentionPosted);
		kv.set('cruisemonkey.tabs.newest-mention-seen', $scope.newestMentionSeen);
	};
	kv.get('cruisemonkey.tabs.newest-mention-seen').then((timestamp) => {
		if (timestamp) {
			const ts = datetime.create(timestamp);
			if (!$scope.newestMentionSeen) {
				$scope.newestMentionSeen = ts;
			} else if (ts.isAfter($scope.newestMentionSeen)) {
				$scope.newestMentionSeen = ts;
			}
		} else {
			return $q.reject('no timestamp in db');
		}
	}).catch((/* err */) => {
		// if we find no timestamp or get some kind of other error, mark the beginning as "newest"
		if (!$scope.newestMentionSeen) {
			$scope.newestMentionSeen = beginning;
		}
		return $q.resolve(beginning);
	}).finally(() => {
		updateMentionState();
	});
	$scope.$on('cruisemonkey.notify.mentions', (ev, mentions) => {
		if (mentions && mentions.length > 0) {
			const newestMention = mentions[0];
			const ts = datetime.create(newestMention.timestamp);
			if (!$scope.newestMentionPosted || ts.isAfter($scope.newestMentionPosted)) {
				$scope.newestMentionPosted = ts;
			}
			updateMentionState();
		}
	});
	$scope.$on('cruisemonkey.notify.mention-seen', (ev, timestamp) => {
		const stamp = datetime.create(timestamp);
		if (!$scope.newestMentionSeen || stamp.isAfter($scope.newestMentionSeen)) {
			$scope.newestMentionSeen = stamp;
			updateMentionState();
		}
	});

	/* Announcements */
	const updateAnnouncementState = () => {
		if (!$scope.newestAnnouncementSeen || !$scope.newestAnnouncementPosted) {
			return;
		}
		$scope.tagAnnouncements = $scope.newestAnnouncementSeen.isBefore($scope.newestAnnouncementPosted);
		kv.set('cruisemonkey.tabs.newest-announcement-seen', $scope.newestAnnouncementSeen);
	};
	kv.get('cruisemonkey.tabs.newest-announcement-seen').then((timestamp) => {
		if (timestamp) {
			const ts = datetime.create(timestamp);
			if (!$scope.newestAnnouncementSeen) {
				$scope.newestAnnouncementSeen = ts;
			} else if (ts.isAfter($scope.newestAnnouncementSeen)) {
				$scope.newestAnnouncementSeen = ts;
			}
		} else {
			return $q.reject('no timestamp in db');
		}
	})
	.catch((/* err */) => {
		// if we find no timestamp or get some kind of other error, mark the beginning as "newest"
		if (!$scope.newestAnnouncementSeen) {
			$scope.newestAnnouncementSeen = beginning;
		}
		return $q.resolve(beginning);
	}).finally(() => {
		updateAnnouncementState();
	});
	$scope.$on('cruisemonkey.notify.announcements', (ev, announcements) => {
		if (announcements) {
			for (let i=0, len=announcements.length, ts; i < len; i++) {
				ts = datetime.create(announcements[i].timestamp);
				if (!$scope.newestAnnouncementPosted || ts.isAfter($scope.newestAnnouncementPosted)) {
					$scope.newestAnnouncementPosted = ts;
				}
			}
		}
		updateAnnouncementState();
	});
	$scope.$on('cruisemonkey.notify.announcement-seen', (ev, timestamp) => {
		const stamp = datetime.create(timestamp);
		if (!$scope.newestAnnouncementSeen || stamp.isAfter($scope.newestAnnouncementSeen)) {
			$scope.newestAnnouncementSeen = stamp;
			updateAnnouncementState();
		}
	});

	/* Seamails */
	$scope.$on('cruisemonkey.notify.tabs.showSeamails', (ev, show) => {
		$scope.tagSeamails = show? '*':undefined;
	});

})
;
