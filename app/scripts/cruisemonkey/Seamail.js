(function() {
	'use strict';

	angular.module('cruisemonkey.Seamail', [
		'angularLocalStorage',
		'cruisemonkey.Cordova',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.User'
	])
	.factory('SeamailService', ['$q', '$rootScope', '$timeout', '$interval', '$http', 'SettingsService', 'NotificationService', 'UserService', '$log', 'storage', 'CordovaService', function($q, $rootScope, $timeout, $interval, $http, SettingsService, notifications, UserService, log, storage, cor) {
		var interval = null;

		storage.bind($rootScope, 'seamailCount', {
			'defaultValue': 0,
			'storeName': 'cm.seamail.count'
		});

		var getSeamailCount = function() {
			if (!UserService.loggedIn()) {
				log.debug('SeamailService: Skipping update, user is not logged in.');
				return;
			}

			log.debug('SeamailService: Checking for seamail updates.');
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
				log.debug('SeamailService: Success!');
				if (data.status === 'ok') {
					if (data.email_count > $rootScope.seamailCount) {
						var message = 'You have ' + data.email_count + ' new messages in your Seamail inbox!';
						if ($rootScope.foreground) {
							notifications.status(message, 5000);
						} else {
							cor.ifCordova(function() {
								notifications.alert(message, function() {
									log.info('Acknowledged notification message: ' + message);
								});
							}).otherwise(function() {
								notifications.status(message, 5000);
							});
						}
					}
					$rootScope.seamailCount = data.email_count;
				}
			})
			.error(function(data, status, headers, config) {
				log.warn('SeamailService: Failed to get seamail update.');
				/*
				log.debug('data:', data);
				log.debug('status:',status);
				log.debug('headers:',headers);
				log.debug('config:',config);
				*/
			});
		};

		var startSynchronization = function() {
			if (interval) {
				log.info('SeamailService.startSynchronization(): sync already active.');
				return;
			}

			log.info('SeamailService.startSynchronization(): starting synchronization.');
			interval = $interval(getSeamailCount, (10 * 60 * 1000)); // 10 minutes
			getSeamailCount();
		};

		var stopSynchronization = function() {
			if (!interval) {
				log.info('SeamailService.startSynchronization(): sync not active.');
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
