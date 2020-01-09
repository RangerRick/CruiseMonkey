'use strict';

(function() {
	require('../util/HTTP');

	var defaultData = require('./today.json');

	angular.module('cruisemonkey.today.TodayService', [
		'cruisemonkey.Settings',
		'cruisemonkey.util.HTTP'
	])
	.factory('TodayService', function TodayService($interval, $log, $rootScope, cmHTTP, SettingsService) {
		$log.info('Initializing TodayService');

		var interval = undefined;
		var todayData = [];

		var refresh = function refresh() {
			$log.debug('TodayService: refreshing');
			return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				return cmHTTP.get(twitarrRoot + '/api/v2/text/today.json', {
					headers: {
						Accept: 'application/json'
					}
				}).then(function(response) {
					var json = response.data;
					if (angular.isString(json)) {
						todayData = angular.fromJson(json);
					} else {
						todayData = angular.copy(json);
					}
					$rootScope.$broadcast('cruisemonkey.notify.today', todayData);
					return todayData;
				});
			}).catch(function(err) {
				$log.error('Failed to get updated "today" data: ' + angular.toJson(err));
				todayData = defaultData;
				$rootScope.$broadcast('cruisemonkey.notify.today', todayData);
				return todayData;
			});
		};

		var getData = function getData() {
			return todayData && todayData.length > 0 ? todayData : defaultData;
		};

		var start = function start() {
			$log.debug('TodayService: starting today refresh');
			if (!interval) {
				interval = $interval(refresh, 8 * 60 * 60 * 1000); // refresh every 8 hours
				refresh();
			}
		};

		var reset = function reset() {
			$log.debug('TodayService: resetting');
			if (interval) {
				$interval.cancel(interval);
				interval = undefined;
			}
			todayData = [];
		};

		$rootScope.$on('cruisemonkey.wipe-cache', function() {
			$log.info('TodayService: wiping cache.');
			reset();
			start();
		});

		$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
			if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
				$log.info('TodayService: wiping cache (Twit-arr root changed).');
				reset();
				start();
			}
		});

		return {
			refresh: refresh,
			get: getData,
			start: start
		}
	});
}());
