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
			if (changed && changed['background.interval']) {
				setMaxAge(changed['background.interval']);
			}
		});
		$rootScope.$on('cruisemonkey.wipe-cache', function() {
			userCache.clear();
		});

		var inFlight = {};

		var getUser = function(username, force) {
			var user = userCache.get(username);
			if (!user || force) {
				if (!username) {
					return $q.reject('No username!');
				}

				if (!inFlight[username]) {
					inFlight[username] = Twitarr.getUserInfo(username).then(function(u) {
						if (u.display_name && u.display_name !== username) {
							u.displayName = u.display_name;
							u.displayHandle = '(@' + username + ')';
						} else {
							u.displayName = '@' + username;
							u.displayHandle = '';
						}
						userCache.put(username, u);
						$log.debug('UserCache.getUser: got ' + username);
						delete inFlight[username];
						return angular.copy(u);
					});
				}
				return inFlight[username];
			} else {
				return $q.when(user);
			}
		};

		return {
			get: getUser
		};
	})
	;
}());