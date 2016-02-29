'use strict';

angular.module('cruisemonkey.directives.link', [
	'ng'
])
.directive('cmLink', function($log, $window) {
	$log.info('cmLink Initializing.');
	return {
		scope: {
			url: '@href',
			target: '@'
		},
		restrict: 'E',
		replace: true,
		template: '<span class="cm-directive link" ng-click="open($event)">{{url}}</span>',
		link: function(scope, el, attrs) {
			var options = 'closebuttoncaption=Close,transitionstyle=fliphorizontal';
			//$log.debug('url = ' + scope.url + ', target = ' + target + ', options = ' + options);
			scope.open = function(ev) {
				if (ev) {
					ev.preventDefault();
					ev.stopPropagation();
				}
				$window.open(scope.url, scope.target || '_system', options);
			}
		}
	};
})
