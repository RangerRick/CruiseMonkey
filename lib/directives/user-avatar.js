'use strict';

angular.module('cruisemonkey.directives.user-avatar', [
	'cruisemonkey.Settings',
	'cruisemonkey.images.Cache',
	'cruisemonkey.user.Detail'
])
.directive('cmUserAvatar', function($compile, $log, $rootScope, ImageCache, SettingsService, UserDetail) {
	$log.info('cmUserAvatar Initializing.');
	return {
		scope: {
			username: '='
		},
		restrict: 'E',
		replace: true,
		template: '<img class="cm-directive avatar" ng-click="u.open(username, $event)" />',
		link: function(scope, el, attrs) {
			scope.u = UserDetail;

			var updateImage = function(username) {
				return ImageCache.getImage($rootScope.twitarrRoot + 'api/v2/user/photo/' + username).then(function(url) {
					el.attr('src', url);
				}, function(err) {
					$log.warn('Unable to get image URL for username ' + username);
				});
			};

			updateImage(scope.username);
			scope.$watch('username', function(newUsername) {
				updateImage(newUsername);
			});
		}
	};
});