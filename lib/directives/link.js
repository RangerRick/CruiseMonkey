import { Plugins } from '@capacitor/core';
const { Browser } = Plugins;

angular.module('cruisemonkey.directives.link', [
	'ng'
])
.directive('cmLink', ($log) => {
	$log.info('cmLink Initializing.');
	return {
		scope: {
			url: '@href',
			target: '@'
		},
		restrict: 'E',
		replace: true,
		template: '<span class="cm-directive link" on-tap="open($event)">{{url}}</span>',
		link: (scope /*, el, attrs */) => {
			scope.open = (ev) => {
				if (ev) {
					ev.preventDefault();
					ev.stopPropagation();
				}
				Browser.open({
					url: scope.url,
					windowName: scope.target || '_blank',
				});
			}
		}
	};
})
