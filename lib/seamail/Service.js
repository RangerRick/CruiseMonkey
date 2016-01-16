(function() {
	'use strict';

	var angular = require('angular');

	require('../3rdparty/imgcache.js/js/imgcache.js');
	require('imports?ImgCache=imgcache.js!angular-imgcache');

	angular.module('cruisemonkey.seamail.Service', [
		'ImgCache',
		'cruisemonkey.DB',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.user.User'
	])
	.factory('SeamailService', function($log, $q, $rootScope, $timeout, $interval, $http, SettingsService, Twitarr, UserService, kv) {
		var interval = null;

		kv.get('cruisemonkey.seamail.count').then(function(s) {
			$rootScope.seamailCount = s || 0;
		});

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
			if ($rootScope.seamailCount === undefined) {
				return kv.remove('cruisemonkey.seamail.count');
			} else {
				return kv.set('cruisemonkey.seamail.count', $rootScope.seamailCount);
			}
		};

		var getSeamailCount = function() {
			if (!UserService.loggedIn()) {
				$log.warn('SeamailService: Skipping update, user is not logged in.');
				return;
			}

			$log.debug('SeamailService: Checking for seamail updates.');
			var user = UserService.get();

			$http({
				method: 'GET',
				url: $rootScope.twitarrRoot + 'api/v2/user/new_seamail',
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
				$log.debug('SeamailService: Success!');
				if (data.status === 'ok') {
					if (data.email_count > $rootScope.seamailCount) {
						var message = 'You have ' + data.email_count + ' new messages in your Seamail inbox!';
						if ($rootScope.foreground) {
							// notifications.status(message, 5000);
						}
					}
					$rootScope.seamailCount = data.email_count;
					updateSeamailCount();
				}
			})
			.error(function(data, status, headers, config) {
				$log.error('SeamailService: Failed to get seamail update.');
				$log.debug('data:', data);
				$log.debug('status:',status);
				$log.debug('headers:',headers);
			});
		};

		var startSynchronization = function() {
			if (interval) {
				$log.warn('SeamailService.startSynchronization(): sync already active.');
				return;
			}

			SettingsService.getBackgroundInterval().then(function(bgi) {
				$log.debug('SeamailService.startSynchronization(): starting synchronization.');
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
			'list': listSeamails,
			'get': getSeamail,
			'online': startSynchronization,
			'offline': stopSynchronization
		};
	});
}());
