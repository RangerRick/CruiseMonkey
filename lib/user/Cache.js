angular.module('cruisemonkey.user.Cache', [
	'ionic',
	'angular-cache',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr'
])
.factory('UserCache', ($log, $q, $rootScope, CacheFactory, SettingsService, Twitarr) => {
	if (!CacheFactory.get('users')) {
		CacheFactory.createCache('users', {
			deleteOnExpire: 'passive',
			maxAge: 60000
		});
	}
	const userCache = CacheFactory.get('users');

	const setMaxAge = (ival) => {
		ival = parseInt(ival, 10) * 2;
		$log.info('UserCache: Setting maximum age to ' + ival + ' seconds.');
		userCache.setMaxAge(ival * 1000);
	};

	SettingsService.getBackgroundInterval().then((ival) => {
		setMaxAge(ival);
	});

	$rootScope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed && changed.new.twitarrRoot) {
			if (userCache && userCache.clear) {
				userCache.clear();
			} else {
				$log.debug('UserCache: no cache!');
			}
		}
		if (changed && changed.new.backgroundInterval) {
			setMaxAge(changed.new.backgroundInterval);
		}
	});
	$rootScope.$on('cruisemonkey.wipe-cache', () => {
		if (userCache && userCache.clear) {
			userCache.clear();
		} else {
			$log.debug('UserCache: no cache!');
		}
	});

	const inFlight = {};

	const decorateUser = (user) => {
		if (user.display_name && user.display_name !== user.username) {
			user.displayName = user.display_name;
			user.displayHandle = '(@' + user.username + ')';
		} else {
			user.displayName = '@' + user.username;
			user.displayHandle = '';
		}
		return user;
	};

	const getUser = (user, force) => {
		let username = user.username || user;
		if (angular.isUndefined(username) || username === null) {
			return $q.reject('No username!');
		}
		username = username.toLowerCase();

		// $log.debug('getUser(' + username + ')');
		const existingUser = userCache.get(username);
		if (!existingUser || force) {
			if (!inFlight[username]) {
				inFlight[username] = Twitarr.getUserInfo(username).then((updatedUser) => {
					updatedUser = decorateUser(updatedUser);
					userCache.put(username, updatedUser);
					delete inFlight[username];
					const ret = angular.copy(updatedUser);
					$rootScope.$broadcast('cruisemonkey.user-cache.updated', angular.copy(updatedUser), existingUser);
					return ret;
				});
			}
			return inFlight[username];
		} else {
			return $q.when(existingUser);
		}
	};

	return {
		get: getUser,
		decorate: decorateUser
	};
})
;
