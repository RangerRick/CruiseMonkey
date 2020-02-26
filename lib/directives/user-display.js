const templateUrl = require('./user-display.html');
require('ng-debounce/dist/ng-debounce');

angular.module('cruisemonkey.directives.user-display', [
	'ng',
	'debounce',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr',
	'cruisemonkey.user.Cache',
	'cruisemonkey.user.Detail',
	'cruisemonkey.user.User'
])
.directive('cmUserDisplay', ($log, $rootScope, debounce, SettingsService, Twitarr, UserCache, UserDetail, UserService) => {
	$log.info('cmUserDisplay Initializing.');

	const settings = {};
	SettingsService.getSettings().then((s) => {
		Object.assign(settings, s);
	});
	$rootScope.$on('cruisemonkey.user.settings-changed', (ev, update) => {
		if (update && update.new) {
			Object.assign(settings, update.new);
		}
	});

	return {
		scope: {
			username: '=',
			hideStarred: '='
		},
		restrict: 'E',
		replace: true,
		templateUrl: templateUrl,
		link: (scope) => {
			scope.u = UserDetail;
			scope.me = UserService.get();
			scope.settings = settings;

			const setUserNow = (user) => {
				scope.user = user;
				if (user.display_name && user.display_name !== user.username) {
					scope.displayName = user.display_name;
					console.log('user-display:', scope.settings, user);
					if (scope.settings.showPronouns && user.pronouns && user.pronouns.trim().length > 0) {
						scope.displayHandle = `(@${user.username}, ${user.pronouns.trim()})`;
					} else {
						scope.displayHandle = `(@${user.username})`;
					}
				} else {
					scope.displayName = `${user.username}`;
					scope.displayHandle = '';
				}
				return user;
			};

			const setUserEventually = debounce((user) => {
				scope.$evalAsync(() => {
					setUserNow(user);
				});
			}, 300);

			const setUser = (user) => {
				if (scope.user === undefined) {
					setUserNow(user);
				} else {
					setUserEventually(user);
				}
			};

			const updateUser = (username, force) => {
				if (username) {
					UserCache.get(username.toLowerCase(), force).then((user) => {
						setUser(user);
					}).catch((err) => {
						$log.debug('<cm-user-display>.updateUser(): failed to get user from cache:', err);
					});
				} else {
					$log.warn('<cm-user-display>.updateUser(): No username specified.');
				}
			};

			scope.toggleStarred = (ev, username) => {
				ev.preventDefault();
				ev.stopPropagation();

				const isStarred = scope.user.starred || false;
				$log.debug('<cm-user-display>.toggleStarred(): ' + username);
				Twitarr.toggleStarred(username).then(() => {
					updateUser(username, true);
					$rootScope.$broadcast('cruisemonkey.user.toggle-starred', isStarred);
				});
			};

			scope.$watch('username', (newUsername, oldUsername) => {
				if (!scope.user || newUsername !== oldUsername && scope.user.username !== newUsername) {
					updateUser(newUsername);
				}
			});
			scope.$on('cruisemonkey.user-cache.updated', (ev, updatedUser) => {
				if (updatedUser.username === scope.username) {
					setUser(angular.copy(updatedUser));
				}
			});
		}
	};
});
