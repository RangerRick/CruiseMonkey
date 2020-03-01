require('../util/HTTP');

const defaultData = require('./today.json');

angular.module('cruisemonkey.today.TodayService', [
	'cruisemonkey.Settings',
	'cruisemonkey.util.HTTP'
])
.factory('TodayService', function ($interval, $log, $rootScope, cmHTTP, SettingsService) {
	$log.info('Initializing TodayService');

	let interval = undefined;
	let todayData = [];

	const refresh = () => {
		$log.debug('TodayService: refreshing');
		return SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			return cmHTTP.get(twitarrRoot + 'api/v2/text/today.json', { headers: { Accept: 'application/json' } }).then((response) => {
				const json = response.data;
				if (angular.isString(json)) {
					todayData = angular.fromJson(json);
				} else {
					todayData = angular.copy(json);
				}
				$rootScope.$broadcast('cruisemonkey.notify.today', todayData);
				return todayData;
			});
		}).catch((err) => {
			$log.error('Failed to get updated "today" data: ' + angular.toJson(err));
			todayData = defaultData;
			$rootScope.$broadcast('cruisemonkey.notify.today', todayData);
			return todayData;
		});
	};

	const getData = () => {
		return todayData && todayData.length > 0 ? todayData : defaultData;
	};

	const start = () => {
		$log.debug('TodayService: starting today refresh');
		if (!interval) {
			interval = $interval(refresh, 8 * 60 * 60 * 1000); // refresh every 8 hours
			refresh();
		}
	};

	const reset = () => {
		$log.debug('TodayService: resetting');
		if (interval) {
			$interval.cancel(interval);
			interval = undefined;
		}
		todayData = [];
	};

	$rootScope.$on('cruisemonkey.wipe-cache', () => {
		$log.info('TodayService: wiping cache.');
		reset();
		start();
	});

	$rootScope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
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
