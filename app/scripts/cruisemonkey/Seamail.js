(function() {
	'use strict';

	angular.module('cruisemonkey.Seamail', [
		'cruisemonkey.Config',
		'cruisemonkey.Logging',
		'cruisemonkey.User'
	])
	.factory('SeamailService', ['$q', '$rootScope', '$timeout', '$interval', '$http', 'SettingsService', 'UserService', 'LoggingService', function($q, $rootScope, $timeout, $interval, $http, SettingsService, UserService, log) {
		var lastEmailCount = 0;
		var interval = null;

		var startSynchronization = function() {
			if (interval) {
				log.info('SeamailService.startSynchronization(): sync already active.');
				return;
			}

			log.info('SeamailService.startSynchronization(): starting synchronization.');
			interval = $interval(function() {
				if (!UserService.loggedIn()) {
					log.debug('SeamailService: Skipping update, user is not logged in.');
					return;
				}

				log.debug('SeamailService: Checking for seamail updates.');
				var twitarrRoot = SettingsService.getTwitarrRoot();
				var user = UserService.get();

				$http({
					method: 'GET',
					url: twitarrRoot + 'api/v1/user/new_seamail',
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
					/*jshint camelcase: false */
					log.debug('Success!');
					if (data.status === 'ok') {
						if (data.email_count > lastEmailCount) {
							notifications.status('You have ' + data.email_count + ' new messages!  [<a href="' + twitarrRoot + '#/seamail/inbox" target="_system">view inbox</a>]', 5000);
							lastEmailCount = data.email_count;
						}
					}
				})
				.error(function(data, status, headers, config) {
					log.warn('Failed to get seamail update!');
					/*
					log.debug('data:', data);
					log.debug('status:',status);
					log.debug('headers:',headers);
					log.debug('config:',config);
					*/
				});
			}, (60 * 10 * 1000)); // 10 minutes
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