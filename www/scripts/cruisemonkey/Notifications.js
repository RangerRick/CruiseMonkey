(function() {
	'use strict';

	/*global isMobile: true*/
	/*global ionic: true*/
	/*global toastr: true*/

	function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	angular.module('cruisemonkey.Notifications', [
		'angularLocalStorage',
		'ngCordova'
	])
	.factory('LocalNotifications', ['$q', '$rootScope', '$cordovaLocalNotification', 'storage', function($q, $rootScope, $cordovaLocalNotification, storage) {
		console.log('Initializing local notifications service.');

		var scope = $rootScope.$new();
		storage.bind(scope, 'seen', {
			'storeName': 'cruisemonkey.notifications',
			'defaultValue': {}
		});

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

		var printObj = function(obj) {
			for (var prop in obj) {
				console.log('  ' + prop + '=' + obj[prop]);
			}
		};

		var registered = function() {
			var deferred = $q.defer();

			ionic.Platform.ready(function() {
				scope.$evalAsync(function() {
					$cordovaLocalNotification.hasPermission().then(function(granted) {
						if (!granted) {
							$cordovaLocalNotification.promptForPermission().then(function(granted) {
								if (!granted) {
									console.log('LocalNotifications: user rejected notifications permissions.');
								}
								deferred.resolve(granted);
							});
						} else {
							deferred.resolve(granted);
						}
					});
				});
			});

			return deferred.promise;
		};

		var canNotify = function() {
			var deferred = $q.defer();

			ionic.Platform.ready(function() {
				$rootScope.$evalAsync(function() {
					if (scope.isForeground === false && window.plugin && window.plugin.notification && window.plugin.notification.local) {
						registered().then(function(granted) {
							deferred.resolve(granted);
						});
					} else {
						deferred.resolve(false);
					}
				});
			});

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

					console.log('Notifications: Posting local notification:');
					printObj(options);

					$cordovaLocalNotification.add(options).then(function(res) {
						console.log('Notifications: posted: ' + options.id);
						printObj(res);
						scope.seen[data.original_id] = notif.id;
						deferred.resolve(res);
					}, function(err) {
						console.log('Notifications: failed to post ' + options.id);
						printObj(err);
						deferred.reject(err);
					});
				} else {
					$rootScope.$broadcast('cruisemonkey.notify.toast', { message: notif.message });
					scope.seen[data.original_id] = notif.id;
					deferred.resolve();
				}
			});

			return deferred.promise;
		};

		return {
			canNotify: canNotify,
			send: sendNotification,
		};
	}])
	.factory('Notifications', ['$q', '$rootScope', '$timeout', '$window', '$ionicLoading', '$ionicPopup', '$cordovaDialogs', '$cordovaSpinnerDialog', '$cordovaToast', 'LocalNotifications', function($q, $rootScope, $timeout, $window, $ionicLoading, $ionicPopup, $cordovaDialogs, $cordovaSpinnerDialog, $cordovaToast, LocalNotifications) {
		console.log('Initializing notification service.');
		var newEvents = [];
		var newSeamails = [];

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
			newEvents.push(newEvent);
		});

		$rootScope.$on('cruisemonkey.notify.newSeamail', function(ev, newSeamail) {
			console.log('Notifications: There are ' + newSeamail + ' new seamail messages.');
		});

		$rootScope.$on('cruisemonkey.notify.newMentions', function(ev, newMentions) {
			console.log('Notifications: There are ' + newMentions + ' unnoticed mentions.');
		});

		$rootScope.$on('cruisemonkey.notify.newAlerts', function(ev, newAlerts) {
			console.log('Notifications: There are ' + newAlerts + ' unnoticed alerts.');
		});

		$rootScope.$on('cruisemonkey.notify.newAnnouncements', function(ev, newAnnouncements) {
			console.log('Notifications: There are ' + newAnnouncements + ' unnoticed announcements.');
		});

		$rootScope.$on('cruisemonkey.notify.alert', function(ev, alert) {
			console.log('Notifications: Alert: ' + alert.message);
			ionic.Platform.ready(function() {
				$rootScope.$evalAsync(function() {
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
			});
		});

		$rootScope.$on('cruisemonkey.notify.local', function(ev, notif) {
			sendNotification(notif);
		});

		$rootScope.$on('cruisemonkey.notify.spinner', function(ev, spinner) {
			var timeout = spinner.timeout || 3000;
			ionic.Platform.ready(function() {
				$rootScope.$evalAsync(function() {
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
			});
		});

		$rootScope.$on('cruisemonkey.notify.toast', function(ev, toast) {
			var timeout = toast.timeout || 3000;
			console.log('Notifications: Toast(' + timeout + '): ' + toast.message);
			ionic.Platform.ready(function() {
				$rootScope.$evalAsync(function() {
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
			});
		});

		return {};
	}]);
}());
