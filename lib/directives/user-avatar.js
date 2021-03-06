angular.module('cruisemonkey.directives.user-avatar', [
	'cruisemonkey.Settings',
	'cruisemonkey.images.Cache',
	'cruisemonkey.user.Detail'
])
.directive('cmUserAvatar', ($log, ImageCache, SettingsService, UserDetail) => {
	$log.info('cmUserAvatar Initializing.');
	return {
		scope: { username: '=' },
		restrict: 'E',
		replace: true,
		template: '<img ng-show="image" class="cm-directive avatar" on-tap="u.open(username, $event)" />',
		link: (scope, el /*, attrs */) => {
			scope.u = UserDetail;
			scope.image = false;

			const updateImage = (username) => {
				if (username && scope.twitarrRoot) {
					username = username.toLowerCase();
					return ImageCache.getImage(scope.twitarrRoot + 'api/v2/user/photo/' + username).then((url) => {
						el.attr('src', url);
						scope.image = true;
					}, (/* err */) => {
						$log.warn('Unable to get image URL for username ' + username);
						el.removeAttr('src');
						scope.image = false;
					});
				} else {
					$log.warn('Unable to update image.  username=' + username + ', twitarrRoot=' + scope.twitarrRoot);
					el.removeAttr('src');
					scope.image = false;
			}
			};

			scope.$watch('username', (newUsername) => {
				if (newUsername) {
					scope.$evalAsync(() => {
						updateImage(newUsername);
					});
				}
			});
			scope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
				if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
					scope.twitarrRoot = changed.new.twitarrRoot;
					scope.$evalAsync(() => {
						updateImage(scope.username);
					});
				}
			});

			// first initialization on launch
			scope.$evalAsync(() => {
				SettingsService.getTwitarrRoot().then((twitarrRoot) => {
					scope.twitarrRoot = twitarrRoot;
					updateImage(scope.username);
				});
			});
		}
	};
});
