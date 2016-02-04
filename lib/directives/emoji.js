'use strict';

angular.module('cruisemonkey.directives.emoji', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.emoji.Emoji'
])
.directive('cmEmoji', function($log, EmojiService) {
	$log.info('cmEmoji Initializing.');
	return {
		scope: {
			type: '@'
		},
		restrict: 'E',
		replace: true,
		template: '<img ng-src="{{url}}" class="cm-directive emoji" />',
		link: function(scope, el, attrs) {
			scope.url = EmojiService.small(scope.type);
		}
	};
});