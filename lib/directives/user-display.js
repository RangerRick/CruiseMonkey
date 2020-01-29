const templateUrl = require('./user-display.html');
require('ng-debounce/dist/ng-debounce');

angular.module('cruisemonkey.directives.user-display', [
	'ng',
	'debounce',
	'cruisemonkey.Twitarr',
	'cruisemonkey.user.Cache',
	'cruisemonkey.user.Detail',
	'cruisemonkey.user.User'
])
.directive('cmUserDisplay', ($log, $rootScope, debounce, Twitarr, UserCache, UserDetail, UserService) => {
	$log.info('cmUserDisplay Initializing.');
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
			/*
			scope.hideStarred = Boolean(scope.hideStarred);
			if (scope.$parent.hideControls) {
				console.log('hiding starred');
				scope.hideStarred = scope.$parent.hideControls;
			}
			console.log('scope:', scope);
			*/

			const setUserNow = (user) => {
				scope.user = user;
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
