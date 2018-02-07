'use strict';

(function() {
	require('../util/HTTP');

	var defaultData = require('json!./today.json');

	angular.module('cruisemonkey.today.TodayService', [
		'cruisemonkey.Settings',
		'cruisemonkey.util.HTTP'
	])
	.factory('TodayService', function TodayService($interval, $log, $rootScope, cmHTTP, SettingsService) {
		$log.info('Initializing TodayService');

		var interval = undefined;
		var todayData = [];

		var refresh = function refresh() {
			return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				return cmHTTP.get(twitarrRoot + 'stuff/today.json', {
					headers: {
						Accept: 'application/json'
					}
				}).then(function(json){
					if (angular.isString(json)) {
						todayData = angular.fromJson(json);
					} else {
						todayData = json;
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
			return todayData;
		};

		var start = function start() {
			if (!interval) {
				interval = $interval(refresh, 8 * 60 * 60 * 1000); // refresh every 8 hours
				refresh();
			}
		}

		return {
			refresh: refresh,
			get: getData,
			start: start
		}
	});
}());
