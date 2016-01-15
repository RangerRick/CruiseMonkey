(function() {
	'use strict';

	require('toastr/toastr.scss');

	var angular = require('angular'),
		toastr = require('toastr/toastr');

	function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	angular.module('cruisemonkey.Notifications', [
		'ngCordova',
		'cruisemonkey.DB',
		'cruisemonkey.Initializer'
	])
	.factory('LocalNotifications', function($cordovaLocalNotification, $log, $q, $rootScope, $window, Cordova, kv) {
		$log.info('Initializing local notifications service.');

		var scope = $rootScope.$new();

		kv.get(['cruisemonkey.notifications.allowed', 'cruisemonkey.notifications.registered', 'cruisemonkey.notifications']).then(function(n) {
			scope.allowed = n[0] || false;
			scope.registered = n[1] || false;
			scope.seen = n[2] || {};
			scope.canNotify = false;
		});

		var updateAllowed = function() {
			return kv.set('cruisemonkey.notifications.allowed', scope.allowed);
		};
		var updateRegistered = function() {
			return kv.set('cruisemonkey.notifications.registered', scope.registered);
		};
		var updateSeen = function() {
			if (scope.seen === undefined) {
				return kv.remove('cruisemonkey.notifications');
			} else {
				return kv.set('cruisemonkey.notifications', scope.seen);
			}
		};

		scope.isForeground = true;
		scope.$on('cruisemonkey.app.paused', function() {
			scope.isForeground = false;
		});
		scope.$on('cruisemonkey.app.locked', function() {
			scope.isForeground = false;
		});
		scope.$on('cruisemonkey.app.resumed', function() {
			scope.isForeground = true;
		});

		var nextId = 1;

		var hasPermission = function() {
			var deferred = $q.defer();

			if (scope.allowed) {
				$log.debug('LocalNotifications.hasPermission: already allowed.');
				scope.canNotify = true;
				deferred.resolve(true);
			} else {
				Cordova.inCordova().then(function() {
					$log.info('LocalNotifications.hasPermission: checking local notification permission.');
					if ($window.cordova.plugins.notification && $window.cordova.plugins.notification.local) {
						$cordovaLocalNotification.hasPermission(function(granted) {
							$log.debug('LocalNotifications.hasPermission: current permissions: ' + granted);
							scope.allowed = granted;
							deferred.resolve(granted);
						});
					} else {
						$log.info('No notification plugin!  Skipping.');
						scope.allowed = false;
						deferred.resolve(false);
					}
				}, function() {
					scope.allowed = false;
					deferred.resolve(false);
				});
			}

			return deferred.promise;
		};

		var registerPermission = function() {
			var deferred = $q.defer();

			if (scope.registered) {
				$log.debug('LocalNotifications.registerPermission: already registered.');
				deferred.resolve(scope.registered);
			} else {
				Cordova.inCordova().then(function() {
					if ($window.cordova.plugins.notification && $window.cordova.plugins.notification.local) {
						$cordovaLocalNotification.registerPermission(function(granted) {
							if (granted) {
								$log.info('LocalNotifications.registerPermission: permission has been granted.');
							} else {
								$log.warn('LocalNotifications.registerPermission: user rejected notifications permission.');
							}
							scope.registered = true;
							updateRegistered();

							scope.allowed = granted;
							updateAllowed();

							deferred.resolve(true);
						});
					} else {
						scope.registered = false;
						scope.allowed = false;
						updateRegistered();
						updateAllowed();
						deferred.resolve(false);
					}
				});
			}

			return deferred.promise;
		};

		var canNotify = function() {
			var deferred = $q.defer();

			if (scope.isForeground === false && scope.canNotify) {
				deferred.resolve(scope.allowed);
			} else {
				deferred.resolve(false);
			}

			return deferred.promise;
		};

		var sendNotification = function(notif) {
			var deferred = $q.defer();

			if (scope.seen[notif.id]) {
				$log.error('LocalNotifications: notification ' + notif.id + ' has already been sent!');
				deferred.resolve();
				return deferred.promise;
			}

			var data = notif.data || {};
			data.original_id = notif.id;
			notif.id = nextId++;
			notif.json = angular.toJson(data);
			delete notif.data;

			canNotify().then(function(doNative) {
				if (doNative) {
					var options = angular.extend({}, {
						autoCancel: true,
						icon: 'file://images/monkey.png',
						sound: null
					}, notif);

					$log.debug('Notifications: Posting local notification:' + angular.toJson(options));

					$cordovaLocalNotification.schedule(options, function(res) {
						$log.debug('Notifications: posted: ' + options.id + ': ' + angular.toJson(res));
						scope.seen[data.original_id] = notif.id;
						updateSeen();
						deferred.resolve(res);
					}, scope);
				} else {
					$rootScope.$broadcast('cruisemonkey.notify.toast', { message: notif.message });
					scope.seen[data.original_id] = notif.id;
					updateSeen();
					deferred.resolve();
				}
			});

			return deferred.promise;
		};

		var clearNotifications = function() {
			return $cordovaLocalNotification.cancelAll();
		};

		// check initialization
		registerPermission();

		return {
			canNotify: canNotify,
			send: sendNotification,
			clear: clearNotifications
		};
	})
	.factory('Notifications', function($cordovaDialogs, $cordovaSpinnerDialog, $cordovaToast, $ionicLoading, $ionicPopup, $log, $q, $rootScope, $timeout, $window, LocalNotifications) {
		$log.info('Initializing notification service.');

		toastr.options.preventDuplicates = true;

		var nextId = 1;
		var ids = {};

		var sendNotification = function(notif) {
			if (!notif.id) {
				$log.warn('Notifications: Local: No unique identifier specified!  Skipping notification: ' + angular.toJson(notif));
				return;
			}

			LocalNotifications.send(notif);
		};

		$rootScope.$on('cruisemonkey.notify.newEvent', function(ev, newEvent) {
			$log.debug('Notifications: A new event was added to the database: ' + angular.toJson(newEvent));
		});

		$rootScope.$on('cruisemonkey.notify.newSeamail', function(ev, newSeamail) {
			$log.debug('Notifications: There are ' + newSeamail.length + ' new seamail messages.');
		});

		$rootScope.$on('cruisemonkey.notify.newMentions', function(ev, newMentions) {
			$log.debug('Notifications: There are ' + newMentions.length + ' unnoticed mentions.');
		});

		$rootScope.$on('cruisemonkey.notify.newAlerts', function(ev, newAlerts) {
			$log.debug('Notifications: There are ' + newAlerts.length + ' unnoticed alerts.');
		});

		$rootScope.$on('cruisemonkey.notify.newAnnouncements', function(ev, newAnnouncements) {
			$log.debug('Notifications: There are ' + newAnnouncements.length + ' unnoticed announcements.');
		});

		$rootScope.$on('cruisemonkey.notify.alert', function(ev, alert) {
			$log.debug('Notifications: Alert: ' + alert.message);
			if (navigator.notification && navigator.notification.alert) {
				$cordovaDialogs.alert(alert.message, alert.title, alert.buttonName);
			} else {
				var opts = {};
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

		$rootScope.$on('cruisemonkey.notify.local', function(ev, notif) {
			sendNotification(notif);
		});

		$rootScope.$on('cruisemonkey.notify.spinner', function(ev, spinner) {
			var timeout = spinner.timeout || 3000;
			if ($window.plugins && $window.plugins.spinnerDialog) {
				$cordovaSpinnerDialog.show(spinner.message);
				$timeout(function() {
					$cordovaSpinnerDialog.hide();
				}, timeout);
			} else {
				var template = '<i class="icon ion-spin ion-load-a"></i>';
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

		$rootScope.$on('cruisemonkey.notify.toast', function(ev, toast) {
			var timeout = toast.timeout || 3000;
			$log.debug('Notifications: Toast(' + timeout + '): ' + toast.message);
			if ($window.plugins && $window.plugins.toast) {
				var duration = 'short';
				if (timeout >= 5000) {
					duration = 'long';
				}
				$cordovaToast.show(toast.message, duration, 'top');
			} else {
				toastr.info(toast.message);
			}
		});

		return {};
	});
}());
