angular.module('cruisemonkey.directives.emoji', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.emoji.Emoji'
])
.directive('cmEmoji', ($log) => {
	$log.info('cmEmoji Initializing.');
	return {
		scope: { type: '@' },
		restrict: 'E',
		replace: true,
		template: '<i class="cm-directive emoji {{type}}"></i>',
	};
});