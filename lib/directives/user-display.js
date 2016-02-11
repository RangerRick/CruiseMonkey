'use strict';

var templateUrl = require('ngtemplate!html!./user-display.html');

angular.module('cruisemonkey.directives.user-display', [
	'ng',
	'cruisemonkey.user.Cache',
	'cruisemonkey.user.Detail'
])
.directive('cmUserDisplay', function($log, UserCache, UserDetail) {
	$log.info('cmUserDisplay Initializing.');
	return {
		scope: {
			username: '='
		},
		restrict: 'E',
		replace: true,
		templateUrl: templateUrl,
		link: function(scope, el, attrs) {
			scope.u = UserDetail;

			if (scope.username) {
				UserCache.get(scope.username.toLowerCase()).then(function(user) {
					scope.user = user;
				});
			}
			scope.$watch('username', function(newUsername) {
				if (newUsername) {
					UserCache.get(newUsername.toLowerCase()).then(function(user) {
						scope.user = user;
					});
				}
			});
		}
	};
});
