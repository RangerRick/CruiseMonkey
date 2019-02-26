'use strict';

var templateUrl = require('ngtemplate!html!./user-display.html');
require('ng-debounce/angular-debounce');

angular.module('cruisemonkey.directives.user-display', [
	'ng',
	'debounce',
	'cruisemonkey.Twitarr',
	'cruisemonkey.user.Cache',
	'cruisemonkey.user.Detail',
	'cruisemonkey.user.User'
])
.directive('cmUserDisplay', function($log, debounce, Twitarr, UserCache, UserDetail, UserService) {
	$log.info('cmUserDisplay Initializing.');
	return {
		scope: {
			username: '='
		},
		restrict: 'E',
		replace: true,
		templateUrl: templateUrl,
		link: function(scope) {
			scope.u = UserDetail;
			scope.me = UserService.get();

			var setUser = debounce(function(user) {
				scope.user = user;
			}, 200);

			var updateUser = function(username, force) {
				UserCache.get(username.toLowerCase(), force).then(function(user) {
					setUser(user);
				}).catch(function(err) {
					$log.debug('failed to get user from cache:', err);
				});
			};

			scope.toggleStarred = function(ev, username) {
				ev.preventDefault();
				ev.stopPropagation();

				$log.debug('toggling star:', username);
				Twitarr.toggleStarred(username).then(function() {
					updateUser(username, true);
				});
			};

			if (scope.username) {
				updateUser(scope.username);
			}
			scope.$watch('username', function(newUsername) {
				if (newUsername) {
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
