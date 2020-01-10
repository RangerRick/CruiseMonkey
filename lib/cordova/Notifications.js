require('../data/DB');

const icon = require('./icon-512.png').default;

angular.module('cruisemonkey.Notifications', [
	'ngCordova',
	'ionic-toast',
	'cruisemonkey.DB',
	'cruisemonkey.Initializer'
])
.factory('LocalNotifications', ($cordovaLocalNotification, $log, $q, $rootScope, $window, Cordova, kv) => {
	$log.info('Initializing local notifications service.');

	const scope = $rootScope.$new();

	kv.get(['cruisemonkey.notifications.allowed', 'cruisemonkey.notifications.registered', 'cruisemonkey.notifications']).then(function(n) {
		scope.allowed = n[0] || false;
		scope.registered = n[1] || false;
		scope.seen = n[2] || {};
		scope.canNotify = false;
	});

	const updateAllowed = function() {
		return kv.set('cruisemonkey.notifications.allowed', scope.allowed);
	};
	const updateRegistered = function() {
		return kv.set('cruisemonkey.notifications.registered', scope.registered);
	};
	const updateSeen = function() {
		if (scope.seen === undefined) {
			return kv.remove('cruisemonkey.notifications');
		} else {
			return kv.set('cruisemonkey.notifications', scope.seen);
		}
	};

	scope.isForeground = true;
	scope.$on('cruisemonkey.app.paused', () => {
		scope.isForeground = false;
	});
	scope.$on('cruisemonkey.app.locked', () => {
		scope.isForeground = false;
	});
	scope.$on('cruisemonkey.app.resumed', () => {
		scope.isForeground = true;
	});

	let nextId = 1;

	const hasLocalNotifications = () => {
		return Cordova.inCordova().then(() => {
			return $window && $window.cordova && $window.cordova.plugins && $window.cordova.plugins.notification && $window.cordova.plugins.notification.local && $window.cordova.plugins.notification.local.requestPermission;
		}, () => {
			return false;
		});
	};

	const hasPermission = () => {
		return hasLocalNotifications().then(function(hasLocal) {
			if (hasLocal) {
				if (scope.allowed) {
					$log.debug('LocalNotifications.hasPermission: already allowed.');
					scope.canNotify = true;
					return true;
				} else {
					$log.info('LocalNotifications.hasPermission: checking local notification permission.');
					return $cordovaLocalNotification.hasPermission(function(granted) {
						$log.debug('LocalNotifications.hasPermission: current permissions: ' + granted);
						scope.allowed = granted;
						return granted;
					});
				}
			} else {
				scope.allowed = false;
				return false;
			}
		}, function() {
			scope.allowed = false;
			return false;
		});
	};

	const registerPermission = () => {
		if (scope.registered) {
			$log.debug('LocalNotifications.registerPermission: already registered.');
			return $q.when(scope.registered);
		} else {
			return hasLocalNotifications().then((/* hasLocal */) => {
				try {
					return $cordovaLocalNotification.requestPermission((granted) => {
						if (granted) {
							$log.info('LocalNotifications.registerPermission: permission has been granted.');
						} else {
							$log.warn('LocalNotifications.registerPermission: user rejected notifications permission.');
						}
						scope.registered = true;
						updateRegistered();

						scope.allowed = granted;
						updateAllowed();

						return true;
					});
				} catch (err) {
					return $q.reject(err);
				}
			}, (err) => {
				$log.debug('LocalNotifications.registerPermission: error: ' + angular.toJson(err));
				scope.registered = scope.allowed = false;
				updateRegistered();
				updateAllowed();
				return false;
			});
		}
	};

	const shouldNotifyNative = () => {
		return hasLocalNotifications().then((hasLocal) => {
			return scope.isForeground === false && scope.canNotify && hasLocal;
		});
	};

	const sendNotification = (notif) => {
		if (scope.seen[notif.id]) {
			$log.error('LocalNotifications: notification ' + notif.id + ' has already been sent!');
			return $q.when(notif.id);
		}

		const data = notif.data || {};
		data.original_id = notif.id;
		notif.id = nextId++;
		notif.json = angular.toJson(data);
		delete notif.data;

		return shouldNotifyNative().then((doNative) => {
			if (doNative) {
				const options = angular.extend({}, {
					autoCancel: true,
					icon: icon,
					sound: null
				}, notif);

				$log.debug('Notifications: Posting local notification:' + angular.toJson(options));

				return cordova.plugins.notification.local.schedule(options, (res) => {
					$log.debug('Notifications: posted: ' + options.id + ': ' + angular.toJson(res));
					scope.seen[data.original_id] = notif.id;
					updateSeen();
					return res;
				}, scope);
			} else {
				$rootScope.$broadcast('cruisemonkey.notify.toast', { message: notif.message });
				scope.seen[data.original_id] = notif.id;
				return updateSeen();
			}
		});
	};

	const clearNotifications = () => {
		return hasLocalNotifications().then((hasLocal) => {
			if (hasLocal) {
				return $cordovaLocalNotification.cancelAll();
			} else {
				return true;
			}
		});
	};

	// check initialization
	registerPermission();

	return {
		canNotify: shouldNotifyNative,
		send: sendNotification,
		clear: clearNotifications
	};
})
.factory('Notifications', ($cordovaDialogs, $cordovaSpinnerDialog, $cordovaToast, $ionicLoading, $ionicPopup, $log, $q, $rootScope, $timeout, $window, ionicToast, LocalNotifications) => {
	$log.info('Initializing notification service.');

	/* let nextId = 1; */
	const ids = {};

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
		if ($window.plugins && $window.plugins.toast) {
			$cordovaToast.show(toast.message, 'short', 'top');
		} else {
			ionicToast.showLongTop(toast.message);
		}
	};
	$rootScope.$on('cruisemonkey.notify.toast', (ev, toast) => {
		sendToast(toast);
	});

	return {
		local: sendNotification,
		toast: sendToast
	};
});
