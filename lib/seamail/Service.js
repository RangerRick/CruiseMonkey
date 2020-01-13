require('ngstorage');

require('../util/HTTP');

angular.module('cruisemonkey.seamail.Service', [
	'ngStorage',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr',
	'cruisemonkey.user.User',
	'cruisemonkey.util.HTTP'
])
.factory('SeamailService', ($log, $q, $rootScope, $interval, $localStorage, cmHTTP, SettingsService, Twitarr, UserService) => {
	let interval = null;

	$rootScope.seamailCount = parseInt($localStorage['cruisemonkey.seamail.count'], 10);

	const listSeamails = () => {
		return Twitarr.getSeamail().then((res) => {
			//$log.debug('SeamailService.list(): res=' + angular.toJson(res));
			if (res && res.seamail_meta) {
				return res.seamail_meta;
			}
			return [];
		}, (err) => {
			$log.error('Failed to get seamail: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const getSeamail = (id) => {
		//$log.debug('SeamailService.getSeamail('+id+')');
		return Twitarr.getSeamailMessages(id);
	};

	const updateSeamailCount = () => {
		$localStorage['cruisemonkey.seamail.count'] = parseInt($rootScope.seamailCount, 10);
	};

	const getSeamailCount = () => {
		if (!UserService.loggedIn()) {
			$log.warn('SeamailService: Skipping update, user is not logged in.');
			return;
		}

		$log.debug('SeamailService: Checking for seamail updates.');
		const user = UserService.get();

		return SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			return cmHTTP.get(twitarrRoot + 'api/v2/user/new_seamail', {
				params: { key: user.key },
				cache: false,
				timeout: 5000,
				headers: { Accept: 'application/json' }
			})
			.then((response) => {
				$log.debug('SeamailService: Success!');
				if (response.data.status === 'ok') {
					$rootScope.seamailCount = response.data.email_count;
					updateSeamailCount();
					return $rootScope.seamailCount;
				}
				return undefined;
			}, (err) => {
				$log.error('SeamailService: Failed to get seamail update.');
				$log.debug('data:' + angular.toJson(err.data));
				$log.debug('status:' + angular.toJson(err.status));
				$log.debug('headers:' + angular.toJson(err.headers));
			});
		});
	};

	const startSynchronization = () => {
		if (interval) {
			$log.warn('SeamailService.startSynchronization(): sync already active.');
			return;
		}

		SettingsService.getBackgroundInterval().then((bgi) => {
			$log.debug('SeamailService.startSynchronization(): starting synchronization: ' + bgi);
			if (bgi < 30) {
				bgi = 30;
			}
			interval = $interval(getSeamailCount, bgi * 1000);
			getSeamailCount();
		});
	};

	const stopSynchronization = () => {
		if (!interval) {
			$log.warn('SeamailService.startSynchronization(): sync not active.');
			return;
		}

		const ret = $interval.cancel(interval);
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
