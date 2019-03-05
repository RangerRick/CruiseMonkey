(function() {
	'use strict';

	require('ngstorage');

	require('../util/HTTP');

	angular.module('cruisemonkey.seamail.Service', [
		'ngStorage',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.user.User',
		'cruisemonkey.util.HTTP'
	])
	.factory('SeamailService', function($log, $q, $rootScope, $interval, $localStorage, cmHTTP, SettingsService, Twitarr, UserService) {
		var interval = null;

		$rootScope.seamailCount = parseInt($localStorage['cruisemonkey.seamail.count'], 10);

		var listSeamails = function() {
			return Twitarr.getSeamail().then(function(res) {
				//$log.debug('SeamailService.list(): res=' + angular.toJson(res));
				if (res && res.seamail_meta) {
					return res.seamail_meta;
				}
				return [];
			}, function(err) {
				$log.error('Failed to get seamail: ' + angular.toJson(err));
				return $q.reject(err);
			});
		};

		var getSeamail = function(id) {
			//$log.debug('SeamailService.getSeamail('+id+')');
			return Twitarr.getSeamailMessages(id);
		};

		var updateSeamailCount = function() {
			$localStorage['cruisemonkey.seamail.count'] = parseInt($rootScope.seamailCount, 10);
		};

		var getSeamailCount = function() {
			if (!UserService.loggedIn()) {
				$log.warn('SeamailService: Skipping update, user is not logged in.');
				return;
			}

			$log.debug('SeamailService: Checking for seamail updates.');
			var user = UserService.get();

			return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				return cmHTTP.get(twitarrRoot + 'api/v2/user/new_seamail', {
					params: {
						key: user.key
					},
					cache: false,
					timeout: 5000,
					headers: {
						Accept: 'application/json'
					}
				})
				.then(function(response) {
					$log.debug('SeamailService: Success!');
					if (response.data.status === 'ok') {
						$rootScope.seamailCount = response.data.email_count;
						updateSeamailCount();
						return $rootScope.seamailCount;
					}
					return undefined;
				}, function(err) {
					$log.error('SeamailService: Failed to get seamail update.');
					$log.debug('data:' + angular.toJson(err.data));
					$log.debug('status:' + angular.toJson(err.status));
					$log.debug('headers:' + angular.toJson(err.headers));
				});
			});
		};

		var startSynchronization = function() {
			if (interval) {
				$log.warn('SeamailService.startSynchronization(): sync already active.');
				return;
			}

			SettingsService.getBackgroundInterval().then(function(bgi) {
				$log.debug('SeamailService.startSynchronization(): starting synchronization: ' + bgi);
				if (bgi < 30) {
					bgi = 30;
				}
				interval = $interval(getSeamailCount, bgi * 1000);
				getSeamailCount();
			});
		};

		var stopSynchronization = function() {
			if (!interval) {
				$log.warn('SeamailService.startSynchronization(): sync not active.');
				return;
			}

			var ret = $interval.cancel(interval);
			interval = null;
			return ret;
		};

		return {
			list: listSeamails,
			get: getSeamail,
			online: startSynchronization,
			offline: stopSynchronization
		};
	});
}());
