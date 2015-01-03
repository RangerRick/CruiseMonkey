(function() {
	'use strict';

	/*global ionic: true*/

	angular.module('cruisemonkey.Seamail', [
		'angularLocalStorage',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.User'
	])
	.factory('SeamailService', ['$q', '$rootScope', '$timeout', '$interval', '$http', 'SettingsService', 'NotificationService', 'UserService', 'storage', function($q, $rootScope, $timeout, $interval, $http, SettingsService, notifications, UserService, storage) {
		var interval = null;

		storage.bind($rootScope, 'seamailCount', {
			'defaultValue': 0,
			'storeName': 'cm.seamail.count'
		});

		var getSeamailCount = function() {
			if (!UserService.loggedIn()) {
				console.debug('SeamailService: Skipping update, user is not logged in.');
				return;
			}

			console.debug('SeamailService: Checking for seamail updates.');
			var twitarrRoot = SettingsService.getTwitarrRoot();
			var user = UserService.get();

			$http({
				method: 'GET',
				url: twitarrRoot + 'api/v2/user/new_seamail',
				params: {
					key: user.key
				},
				cache: false,
				timeout: 5000,
				headers: {
					Accept: 'application/json'
				}
			})
			.success(function(data, status, headers, config) {
				console.debug('SeamailService: Success!');
				if (data.status === 'ok') {
					if (data.email_count > $rootScope.seamailCount) {
						var message = 'You have ' + data.email_count + ' new messages in your Seamail inbox!';
						if ($rootScope.foreground) {
							notifications.status(message, 5000);
						} else {
							if (ionic.Platform.isWebView()) {
								notifications.alert(message, function() {
									console.info('Acknowledged notification message: ' + message);
								});
							} else {
								notifications.status(message, 5000);
							}
						}
					}
					$rootScope.seamailCount = data.email_count;
				}
			})
			.error(function(data, status, headers, config) {
				console.warn('SeamailService: Failed to get seamail update.');
				/*
				console.debug('data:', data);
				console.debug('status:',status);
				console.debug('headers:',headers);
				console.debug('config:',config);
				*/
			});
		};

		var startSynchronization = function() {
			if (interval) {
				console.info('SeamailService.startSynchronization(): sync already active.');
				return;
			}

			console.info('SeamailService.startSynchronization(): starting synchronization.');
			interval = $interval(getSeamailCount, (10 * 60 * 1000)); // 10 minutes
			getSeamailCount();
		};

		var stopSynchronization = function() {
			if (!interval) {
				console.info('SeamailService.startSynchronization(): sync not active.');
				return;
			}

			var ret = $interval.cancel(interval);
			interval = null;
			return ret;
		};

		return {
			'online': startSynchronization,
			'offline': stopSynchronization
		};
	}]);
}());
