(function() {
	'use strict';

	/*global isMobile: true*/
	/*global ionic: true*/

	function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	angular.module('cruisemonkey.Notifications', [
		'cruisemonkey.Config',
		'toaster'
	])
	.factory('NotificationService', ['$q', '$rootScope', '$timeout', '$window', 'config.notifications.timeout', 'toaster', function($q, $rootScope, $timeout, $window, notificationTimeout, toaster) {
		var notificationQueue = [];
		var nextId = 0;

		var doAlert = function(message, callback) {
			if (ionic.Platform.isWebView()) {
				console.info('NotificationService.doAlert(): native cordova: ' + message);
				navigator.notification.alert(message, callback);
			} else {
				console.info('NotificationService.doAlert(): not native cordova: ' + message);
				toaster.pop('note', message);
				//$window.alert(message);
				callback();
			}
		};

		var alert = function(message, alertCallback) {
			console.info('NotificationService.alert(): message = "' + message + '"');

			var deferred = $q.defer();

			$timeout(function() {
				doAlert(message, function() {
					if (alertCallback) {
						deferred.resolve(alertCallback());
					} else {
						deferred.resolve(undefined);
					}
				});
			});

			return deferred.promise;
		};

		var updateStatusNotification = function(message) {
			if (message) {
				notificationQueue.push(message);
			}
			if (notificationQueue.length > 0) {
				$rootScope.statusNotification = notificationQueue[notificationQueue.length - 1];
			} else {
				$rootScope.statusNotification = undefined;
			}
		};

		var removeStatusNotification = function(message) {
			for (var i = notificationQueue.length; i >= 0; --i) {
				var queueEntry = notificationQueue[i];
				if (queueEntry === message) {
					console.debug('Removing message "' + message + '" from the queue.');
					notificationQueue.splice(i, 1);
					updateStatusNotification();
					break;
				}
			}
			//console.debug('Unable to remove notification for message "' + message + '".');
		};

		var statusNotification = function(message, arg) {
			var id = ++nextId;
			if (isNumber(arg)) {
				updateStatusNotification(message);
				$timeout(function() {
					removeStatusNotification(message);
				}, arg);
			} else {
				updateStatusNotification(message);
				if (arg) {
					$q.when(arg).then(function() {
						removeStatusNotification(message);
					});
				} else {
					console.warn('No timeout specified for message "' + message + '", you had better clear it yourself!');
				}
			}
		};

		return {
			'alert': alert,
			'status': statusNotification,
			'removeStatus': removeStatusNotification
		};

	}]);
}());
