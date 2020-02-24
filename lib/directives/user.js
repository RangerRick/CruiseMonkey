angular.module('cruisemonkey.directives.user', [
	'cruisemonkey.user.Detail'
])
.directive('cmUser', ($log, UserDetail) => {
	$log.info('cmUser Initializing.');
	return {
		scope: {
			username: '@',
			at: '@'
		},
		restrict: 'E',
		replace: true,
		template: '<span on-tap="u.open(username, $event)" class="cm-directive user">{{getUsername()}}</span>',
		link: function(scope /*, el, attrs */) {
			if (scope.at === undefined) {
				scope.at = true;
			}
			scope.getUsername = function() {
				if (!scope.username) {
					return '';
				}
				if (scope.at) {
					return '@' + scope.username;
				} else {
					return scope.username;
				}
			}
			scope.u = UserDetail;
		}
	};
});
