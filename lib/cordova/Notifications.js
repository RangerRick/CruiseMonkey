import { LocalNotifications as ln } from '@ionic-native/local-notifications';
import { Badge } from '@ionic-native/badge';

import { Plugins } from '@capacitor/core';
const {
	App,
	Toast,
} = Plugins;

import hashFunc from 'string-hash';

import { MessageTracker } from '../util/MessageTracker';
const translator = require('../twitarr/translator');

require('../data/DB');
const datetime = require('../util/datetime');

const icon = require('./icon-512.png').default;

angular.module('cruisemonkey.Notifications', [
	'ngCordova',
	'cruisemonkey.DB',
	'cruisemonkey.Initializer'
])
.factory('LocalNotifications', ($log, $q, $rootScope, kv) => {
	$log.info('Initializing local notifications service.');

	const announcementTracker = new MessageTracker('announcements', kv);
	const tweetMentionTracker = new MessageTracker('tweet-mentions', kv);
	const seamailTracker = new MessageTracker('seamail', kv);

	const scope = $rootScope.$new();

	App.addListener('appStateChange', (state) => {
		scope.$evalAsync(() => {
			$log.debug('App.isActive=' + state.isActive);
			scope.isActive = state.isActive;
		});
	});

	kv.get('cruisemonkey.notifications').then(function(seen) {
		scope.seen = seen || {};
	});

	const updateSeen = function() {
		if (scope.seen === undefined) {
			return kv.remove('cruisemonkey.notifications');
		} else {
			return kv.set('cruisemonkey.notifications', scope.seen);
		}
	};

	let nextId = 1;

	let hasPermission;

	const canNotify = () => {
		if (hasPermission !== undefined) {
			if (!hasPermission) {
				return $q.reject();
			}
			return $q.when(hasPermission);
		}

		try {
			return $q.when(ln.hasPermission()).catch(() => {
				return $q.when(ln.requestPermission());
			}).catch(() => {
				return $q.when(false);
			}).then((ret) => {
				if (!ret) {
					return $q.reject();
				}
				hasPermission = ret;
				return ret;
			});
		} catch(err) {
			hasPermission = false;
			return $q.when(false);
		}
	};

	const sendNotification = (notif) => {
		const data = notif.data || {};
		data.original_id = notif.id;
		notif.data = data;
		notif.id = nextId++;

		if (notif.body) {
			notif.text = notif.body;
			delete notif.body;
		}
		if (notif.message) {
			notif.text = notif.message;
			delete notif.message;
		}

		if (scope.seen[notif.id]) {
			$log.warn('LocalNotifications: notification ' + notif.id + ' has already been sent!');
			return $q.when(notif.id);
		}

		return canNotify().then(() => {
			// local notifications are available

			const options = angular.extend({}, {
				autoClear: true,
				icon: icon,
				sound: null
			}, notif);

			$log.debug('Notifications: Posting local notification:' + angular.toJson(options));

			return $q.when(ln.schedule(options)).then((res) => {
				$log.debug('Notifications: posted: ' + options.id + ': ' + angular.toJson(res));
				scope.seen[data.original_id] = notif.id;
				updateSeen();
				return res;
			});
		}).catch(() => {
			// otherwise always schedule a toast
			$rootScope.$broadcast('cruisemonkey.notify.toast', { message: notif.message });
			scope.seen[data.original_id] = notif.id;
			return updateSeen();
		});
	};

	const clearNotifications = () => {
		return canNotify().then((doNative) => {
			if (doNative) {
				return $q.when(ln.clearAll());
			}
			return doNative;
		});
	};

	Badge.isSupported().then(async () => {
		await Badge.requestPermission();
	});

	const setBadge = async (count) => {
		Badge.isSupported().then(async () => {
			Badge.set(count);
		});
	};

	const sendAnnouncementNotifications = (announcements) => {
		return canNotify().then(() => {
			const notifications = announcements.map((announcement) => {
				announcement.timestamp = datetime.create(announcement.timestamp);
				const timestamp = announcement.timestamp.valueOf();
				if (announcementTracker.seen('announcements', timestamp)) {
					return undefined;
				}
				announcementTracker.touch('announcements', timestamp);
				return announcement;
			});

			return $q.all(notifications).then((n) => {
				const filtered = n.filter((notif) => notif !== undefined);
				if (filtered.length > 0) {
					const ids = filtered.map((announcement) => announcement.id).join('-');
					const notif = {
						id: hashFunc(`announcements-${ids}`),
						title: `You have ${filtered.length} unread announcements.`,
						group: 'announcements',
						data: filtered,
						vibrate: true,
						foreground: true,
						wakeup: true,
					};

					$log.info('Sending announcement notifications: ' + angular.toJson(notif));
					ln.schedule(notif);
					return true;
				} else {
					$log.debug('No new announcement notifications to send.');
					return false;
				}
			});
		});
	};

	const sendMentionNotifications = (mentions) => {
		return canNotify().then(() => {
			const options = {
				vibrate: true,
				foreground: true,
				wakeup: true,
			};

			const notifications = mentions.map((mention) => {
				mention.timestamp = datetime.create(mention.timestamp);
				const timestamp = mention.timestamp.valueOf();
				if (tweetMentionTracker.seen('tweets', timestamp)) {
					return undefined;
				}
				tweetMentionTracker.touch('tweets', timestamp);
				return mention;
			});

			return $q.all(notifications).then((n) => {
				const filtered = n.filter((mention) => mention !== undefined);
				if (filtered.length > 0) {
					filtered.forEach((mention) => {
						const id = hashFunc(`mentions-stream-${mention.id}-${mention.timestamp.valueOf()}`);
						const text = translator.formatText(mention.text);
						const notif = Object.assign({
							id: id,
							title: `@${mention.author.username} mentioned you`,
							text: text,
							group: `mentions-stream`,
							data: mention,
						}, options);
						$log.info('Sending mention notification: ' + angular.toJson(notif));
						ln.schedule(notif);
					});
					return true;
				} else {
					$log.debug('No new mention notifications to send.');
					return false;
				}
			});
		});
	};

	const sendSeamailNotifications = (seamails) => {
		return canNotify().then(() => {
			const options = {
				vibrate: true,
				foreground: true,
				wakeup: true,
			};

			const notifications = seamails.map((seamail) => {
				seamail.timestamp = datetime.create(seamail.timestamp);
				const id = String(seamail.id);
				const timestamp = seamail.timestamp.valueOf();
				if (seamailTracker.seen(id, timestamp)) {
					return undefined;
				}
				seamailTracker.touch(id, timestamp);
				return seamail;
			});

			return $q.all(notifications).then((n) => {
				const filtered = n.filter((notif) => notif !== undefined);
				if (filtered.length > 0) {

					if (filtered.length > 5) {
						// don't send more than 5 notifications for unread seamails
						const ids = filtered.map((seamail) => seamail.id).join('-');
						const notif = {
							id: hashFunc(`seamails-${ids}`),
							title: `You have ${filtered.length} unread seamail threads.`,
							group: 'seamails',
							data: filtered,
							vibrate: true,
							foreground: true,
							wakeup: true,
						};
						$log.info('Sending rollup seamail notification: ' + angular.toJson(notif));
						ln.schedule(notif);
						return true;
					}

					filtered.forEach((seamail) => {
						const id = hashFunc(`seamail-${seamail.id}-${seamail.timestamp.valueOf()}`);
						const notif = Object.assign({
							id: id,
							title: `${seamail.message_count} unread posts in seamail: ${seamail.subject}`,
							group: 'seamails',
							data: seamail,
						}, options);
						$log.info('Sending seamail notification: ' + angular.toJson(notif));
						ln.schedule(notif);
					});
					return true;
				} else {
					$log.debug('No new seamail notifications to send.');
					return false;
				}
			});
		});
	};

	// initialize local notifications
	canNotify().then(async () => {
		// await ln.clearAll();
		await ln.requestPermission();
		await ln.fireQueuedEvents();
	});

	return {
		canNotify: canNotify,
		send: sendNotification,
		clear: clearNotifications,
		badge: setBadge,
		announcements: sendAnnouncementNotifications,
		mentions: sendMentionNotifications,
		seamail: sendSeamailNotifications,
	};
})
.factory('Notifications', ($cordovaDialogs, $ionicPopup, $log, $rootScope, LocalNotifications) => {
	$log.info('Initializing notification service.');

	// const ids = {};

	const sendNotification = (notif) => {
		if (!notif.id) {
			$log.warn('Notifications: Local: No unique identifier specified!  Skipping notification: ' + angular.toJson(notif));
			return;
		}

		$log.debug('sendNotification: ' + angular.toJson(notif));
		LocalNotifications.send(notif);
	};

	$rootScope.$on('cruisemonkey.notify.alert', (ev, alert) => {
		$log.debug('Notifications: Alert: ' + alert.message);
		if (navigator.notification && navigator.notification.alert) {
			$cordovaDialogs.alert(alert.message, alert.title, alert.buttonName);
		} else {
			const opts = {};
			if (alert.title) {
				opts.title = alert.title;
				opts.message = alert.message;
			} else {
				opts.title = alert.message;
			}
			if (alert.buttonName) {
				opts.okText = alert.buttonName;
			}
			$ionicPopup.alert(opts);
		}
	});

	$rootScope.$on('cruisemonkey.notify.local', (ev, notif) => {
		sendNotification(notif);
	});

	const sendToast = (toast) => {
		const timeout = toast.timeout || 3000;
		$log.info('Notifications: Toast(' + timeout + '): ' + toast.message);

		Toast.show({
			duration: timeout,
			text: toast.message,
			position: 'top',
		});
	};

	$rootScope.$on('cruisemonkey.notify.toast', (ev, toast) => {
		sendToast(toast);
	});

	return {
		local: sendNotification,
		toast: sendToast
	};
});
