'use strict';

angular.module('cruisemonkey.directives.user-avatar', [
	'cruisemonkey.Settings',
	'cruisemonkey.images.Cache',
	'cruisemonkey.user.Detail'
])
.directive('cmUserAvatar', function($log, $rootScope, ImageCache, UserDetail) {
	$log.info('cmUserAvatar Initializing.');
	return {
		scope: {
			username: '='
		},
		restrict: 'E',
		replace: true,
		template: '<img ng-show="image" class="cm-directive avatar" ng-click="u.open(username, $event)" />',
		link: function(scope, el, attrs) {
			scope.u = UserDetail;
			scope.image = false;

			var updateImage = function(username) {
				if (username && $rootScope.twitarrRoot) {
					username = username.toLowerCase();
					return ImageCache.getImage($rootScope.twitarrRoot + 'api/v2/user/photo/' + username).then(function(url) {
						el.attr('src', url);
						scope.image = true;
					}, function(err) {
						$log.warn('Unable to get image URL for username ' + username);
						el.removeAttr('src');
						scope.image = false;
					});
				} else {
					$log.warn('Unable to update image.  username=' + username + ', twitarrRoot=' + $rootScope.twitarrRoot);
					el.removeAttr('src');
					scope.image = false;
			}
			};

			scope.$watch('username', function(newUsername) {
				if (newUsername) {
					scope.$evalAsync(function() {
						updateImage(newUsername);
					});
				}
			});
			$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
				if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
					scope.$evalAsync(function() {
						updateImage(scope.username);
					});
				}
			});

			// first initialization on launch
			scope.$evalAsync(function() {
				updateImage(scope.username);
			});
		}
	};
});
