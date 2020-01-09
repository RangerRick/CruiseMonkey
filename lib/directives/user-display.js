'use strict';

var templateUrl = require('./user-display.html');
require('ng-debounce/dist/ng-debounce');

angular.module('cruisemonkey.directives.user-display', [
	'ng',
	'debounce',
	'cruisemonkey.Twitarr',
	'cruisemonkey.user.Cache',
	'cruisemonkey.user.Detail',
	'cruisemonkey.user.User'
])
.directive('cmUserDisplay', function($log, $rootScope, debounce, Twitarr, UserCache, UserDetail, UserService) {
	$log.info('cmUserDisplay Initializing.');
	return {
		scope: {
			username: '=',
			hideStarred: '='
		},
		restrict: 'E',
		replace: true,
		templateUrl: templateUrl,
		link: function(scope) {
			scope.u = UserDetail;
			scope.me = UserService.get();

			var setUserNow = function(user) {
				scope.user = user;
			};

			var setUserEventually = debounce(function(user) {
				scope.$evalAsync(function() {
					setUserNow(user);
				});
			}, 300);

			var setUser = function(user) {
				if (scope.user === undefined) {
					setUserNow(user);
				} else {
					setUserEventually(user);
				}
			};

			var updateUser = function(username, force) {
				if (username) {
					UserCache.get(username.toLowerCase(), force).then(function(user) {
						setUser(user);
					}).catch(function(err) {
						$log.debug('<cm-user-display>.updateUser(): failed to get user from cache:', err);
					});
				} else {
					$log.warn('<cm-user-display>.updateUser(): No username specified.');
				}
			};

			scope.toggleStarred = function(ev, username) {
				ev.preventDefault();
				ev.stopPropagation();

				var isStarred = scope.user.starred || false;
				$log.debug('<cm-user-display>.toggleStarred(): ' + username);
				Twitarr.toggleStarred(username).then(function() {
					updateUser(username, true);
					$rootScope.$broadcast('cruisemonkey.user.toggle-starred', isStarred);
				});
			};

			scope.$watch('username', function(newUsername, oldUsername) {
				if (!scope.user || newUsername !== oldUsername && scope.user.username !== newUsername) {
					updateUser(newUsername);
				}
			});
			scope.$on('cruisemonkey.user-cache.updated', function(ev, updatedUser) {
				if (updatedUser.username === scope.username) {
					setUser(angular.copy(updatedUser));
				}
			});
		}
	};
});
