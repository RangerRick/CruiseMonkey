import { Plugins } from '@capacitor/core';
const {
	App,
	Toast,
} = Plugins;

const ln = Plugins.LocalNotifications;

require('../data/DB');

const icon = require('./icon-512.png').default;

angular.module('cruisemonkey.Notifications', [
	'ngCordova',
	'cruisemonkey.DB',
	'cruisemonkey.Initializer'
])
.factory('LocalNotifications', ($log, $q, $rootScope, kv) => {
	$log.info('Initializing local notifications service.');

	const scope = $rootScope.$new();

	App.addListener('appStateChange', (state) => {
		scope.$evalAsync(() => {
			$log.debug('App.isActive=' + state.isActive);
			scope.isActive = state.isActive;
		});
	});

	kv.get(['cruisemonkey.notifications.allowed', 'cruisemonkey.notifications.registered', 'cruisemonkey.notifications']).then(function(n) {
		scope.allowed = n[0] || false;
		scope.registered = n[1] || false;
		scope.seen = n[2] || {};
		scope.canNotify = false;
	});

	/*
	const updateAllowed = function() {
		return kv.set('cruisemonkey.notifications.allowed', scope.allowed);
	};
	const updateRegistered = function() {
		return kv.set('cruisemonkey.notifications.registered', scope.registered);
	};
	*/

	const updateSeen = function() {
		if (scope.seen === undefined) {
			return kv.remove('cruisemonkey.notifications');
		} else {
			return kv.set('cruisemonkey.notifications', scope.seen);
		}
	};

	let nextId = 1;

	const shouldNotifyNative = () => {
		return $q.when(ln.areEnabled()).then((result) => {
			return result.value;
		})
	};

	const sendNotification = (notif) => {
		const data = notif.data || {};
		data.original_id = notif.id;
		notif.id = nextId++;
		notif.json = angular.toJson(data);
		delete notif.data;

		if (scope.seen[notif.id]) {
			$log.warn('LocalNotifications: notification ' + notif.id + ' has already been sent!');
			return $q.when(notif.id);
		}

		return shouldNotifyNative().then((doNative) => {
			if (doNative) {
				// if local notifications are available
				if (scope.isActive) {
					// if we're in the foreground, just do a toast
					$rootScope.$broadcast('cruisemonkey.notify.toast', { message: notif.message });
					scope.seen[data.original_id] = notif.id;
					return updateSeen();
				}

				// otherwise, schedulo a notification
				const options = angular.extend({}, {
					autoCancel: true,
					icon: icon,
					sound: null
				}, notif);

				$log.debug('Notifications: Posting local notification:' + angular.toJson(options));

				return ln.schedule({ notifications: [options] }, (res) => {
					$log.debug('Notifications: posted: ' + options.id + ': ' + angular.toJson(res));
					scope.seen[data.original_id] = notif.id;
					updateSeen();
					return res;
				}, scope);
			} else {
				// otherwise always schedule a toast
				$rootScope.$broadcast('cruisemonkey.notify.toast', { message: notif.message });
				scope.seen[data.original_id] = notif.id;
				return updateSeen();
			}
		});
	};

	const clearNotifications = () => {
		return shouldNotifyNative().then((doNative) => {
			if (doNative) {
				return $q.when(ln.getPending()).then((result) => {
					return $q.when(ln.cancel(result.notifications));
				});
			}
			return doNative;
		});
	};

	return {
		canNotify: shouldNotifyNative,
		send: sendNotification,
		clear: clearNotifications
	};
})
.factory('Notifications', ($cordovaDialogs, $cordovaSpinnerDialog, $ionicLoading, $ionicPopup, $log, $q, $rootScope, $timeout, $window, LocalNotifications) => {
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

	$rootScope.$on('cruisemonkey.notify.newEvent', (ev, newEvent) => {
		$log.debug('Notifications: A new event was added to the database: ' + angular.toJson(newEvent));
	});

	$rootScope.$on('cruisemonkey.notify.newSeamail', (ev, newSeamail) => {
		$log.debug('Notifications: There are ' + newSeamail.length + ' new seamail messages.');
	});

	$rootScope.$on('cruisemonkey.notify.newMentions', (ev, newMentions) => {
		$log.debug('Notifications: There are ' + newMentions.length + ' unnoticed mentions.');
	});

	$rootScope.$on('cruisemonkey.notify.newAlerts', (ev, newAlerts) => {
		$log.debug('Notifications: There are ' + newAlerts.length + ' unnoticed alerts.');
	});

	$rootScope.$on('cruisemonkey.notify.newAnnouncements', (ev, newAnnouncements) => {
		$log.debug('Notifications: There are ' + newAnnouncements.length + ' unnoticed announcements.');
	});

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

	$rootScope.$on('cruisemonkey.notify.spinner', (ev, spinner) => {
		const timeout = spinner.timeout || 3000;
		if ($window.plugins && $window.plugins.spinnerDialog) {
			$cordovaSpinnerDialog.show(spinner.message);
			$timeout(() => {
				$cordovaSpinnerDialog.hide();
			}, timeout);
		} else {
			let template = '<i class="icon ion-spin ion-load-a"></i>';
			if (spinner.message) {
				template += '<br/>' + spinner.message;
			}
			$ionicLoading.show({
				template: template,
				noBackdrop: true,
				duration: timeout
			});
		}
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
