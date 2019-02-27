(function() {
	'use strict';

	angular.module('cruisemonkey.user.Cache', [
		'ionic',
		'angular-cache',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr'
	])
	.factory('UserCache', function($log, $q, $rootScope, CacheFactory, SettingsService, Twitarr) {
		if (!CacheFactory.get('users')) {
			CacheFactory.createCache('users', {
				deleteOnExpire: 'passive',
				maxAge: 60000
			});
		}
		var userCache = CacheFactory.get('users');

		var setMaxAge = function(ival) {
			ival = parseInt(ival, 10) * 2;
			$log.info('UserCache: Setting maximum age to ' + ival + ' seconds.');
			userCache.setMaxAge(ival * 1000);
		};

		SettingsService.getBackgroundInterval().then(function(ival) {
			setMaxAge(ival);
		});

		$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
			if (changed && changed['twitarr.root']) {
				if (userCache && userCache.clear) {
					userCache.clear();
				} else {
					$log.debug('UserCache: no cache!');
				}
			}
			if (changed && changed['background.interval']) {
				setMaxAge(changed['background.interval']);
			}
		});
		$rootScope.$on('cruisemonkey.wipe-cache', function() {
			if (userCache && userCache.clear) {
				userCache.clear();
			} else {
				$log.debug('UserCache: no cache!');
			}
		});

		var inFlight = {};

		var decorateUser = function(user) {
			if (user.display_name && user.display_name !== user.username) {
				user.displayName = user.display_name;
				user.displayHandle = '(@' + user.username + ')';
			} else {
				user.displayName = '@' + user.username;
				user.displayHandle = '';
			}
			return user;
		};

		var getUser = function(user, force) {
			var username = user.username || user;
			if (angular.isUndefined(username) || username === null) {
				return $q.reject('No username!');
			}
			username = username.toLowerCase();

			$log.debug('getUser(' + username + ')');
			var existingUser = userCache.get(username);
			if (!existingUser || force) {
				if (!inFlight[username]) {
					inFlight[username] = Twitarr.getUserInfo(username).then(function(updatedUser) {
						updatedUser = decorateUser(updatedUser);
						userCache.put(username, updatedUser);
						delete inFlight[username];
						var ret = angular.copy(updatedUser);
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
}());
