(function() {
	'use strict';

	/*global cordova: true*/
	/*global isMobile: true*/
	/*global ionic: true*/
	/*global toastr: true*/

	function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	angular.module('cruisemonkey.Notifications', [
		'angularLocalStorage',
		'ngCordova',
		'cruisemonkey.Initializer',
	])
	.factory('LocalNotifications', function($q, $rootScope, $window, $cordovaLocalNotification, storage, Cordova) {
		console.log('Initializing local notifications service.');

		var scope        = $rootScope.$new();
		scope.allowed    = storage.get('cruisemonkey.notifications.allowed')    || false;
		scope.registered = storage.get('cruisemonkey.notifications.registered') || false;
		scope.seen       = storage.get('cruisemonkey.notifications')            || {};
		scope.canNotify  = false;

		var updateAllowed = function() {
			storage.set('cruisemonkey.notifications.allowed', scope.allowed);
		};
		var updateRegistered = function() {
			storage.set('cruisemonkey.notifications.registered', scope.registered);
		};
		var updateSeen = function() {
			if (scope.seen === undefined) {
				storage.remove('cruisemonkey.notifications');
			} else {
				storage.set('cruisemonkey.notifications', scope.seen);
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
				console.log('LocalNotifications.hasPermission: already allowed.');
				scope.canNotify = true;
				deferred.resolve(true);
			} else {
				Cordova.inCordova().then(function() {
					console.log('LocalNotifications.hasPermission: checking local notification permission.');
					$cordovaLocalNotification.hasPermission(function(granted) {
						console.log('LocalNotifications.hasPermission: current permissions: ' + granted);
						scope.allowed = granted;
						deferred.resolve(granted);
					});
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
				console.log('LocalNotifications.registerPermission: already registered.');
				deferred.resolve(scope.registered);
			} else {
				Cordova.inCordova().then(function() {
					$cordovaLocalNotification.registerPermission(function(granted) {
						if (granted) {
							console.log('LocalNotifications.registerPermission: permission has been granted.');
						} else {
							console.log('LocalNotifications.registerPermission: user rejected notifications permission.');
						}
						scope.registered = true;
						updateRegistered();

						scope.allowed = granted;
						updateAllowed();

						deferred.resolve(true);
					});
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
				console.log('LocalNotifications: notification ' + notif.id + ' has already been sent!');
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
						sound: null,
					}, notif);

					console.log('Notifications: Posting local notification:' + angular.toJson(options));

					$cordovaLocalNotification.schedule(options, function(res) {
						console.log('Notifications: posted: ' + options.id + ': ' + angular.toJson(res));
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
			clear: clearNotifications,
		};
	})
	.factory('Notifications', function($q, $rootScope, $timeout, $window, $ionicLoading, $ionicPopup, $cordovaDialogs, $cordovaSpinnerDialog, $cordovaToast, LocalNotifications) {
		console.log('Initializing notification service.');

		toastr.options.preventDuplicates = true;

		var nextId = 1;
		var ids = {};

		var sendNotification = function(notif) {
			if (!notif.id) {
				console.log('Notifications: Local: No unique identifier specified!  Skipping notification:',notif);
				return;
			}

			LocalNotifications.send(notif);
		};

		$rootScope.$on('cruisemonkey.notify.newEvent', function(ev, newEvent) {
			console.log('Notifications: A new event was added to the database:',newEvent);
		});

		$rootScope.$on('cruisemonkey.notify.newSeamail', function(ev, newSeamail) {
			console.log('Notifications: There are ' + newSeamail.length + ' new seamail messages.');
		});

		$rootScope.$on('cruisemonkey.notify.newMentions', function(ev, newMentions) {
			console.log('Notifications: There are ' + newMentions.length + ' unnoticed mentions.');
		});

		$rootScope.$on('cruisemonkey.notify.newAlerts', function(ev, newAlerts) {
			console.log('Notifications: There are ' + newAlerts.length + ' unnoticed alerts.');
		});

		$rootScope.$on('cruisemonkey.notify.newAnnouncements', function(ev, newAnnouncements) {
			console.log('Notifications: There are ' + newAnnouncements.length + ' unnoticed announcements.');
		});

		$rootScope.$on('cruisemonkey.notify.alert', function(ev, alert) {
			console.log('Notifications: Alert: ' + alert.message);
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
			console.log('Notifications: Toast(' + timeout + '): ' + toast.message);
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
