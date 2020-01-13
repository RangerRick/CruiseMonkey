'use strict';

angular.module('cruisemonkey.directives.hashtag', [
	'ng'
])
.directive('cmHashtag', function($log) {
	$log.info('cmHashtag Initializing.');
	return {
		scope: { tag: '@' },
		restrict: 'E',
		replace: true,
		template: '<span class="cm-directive hashtag">#{{tag}}</span>'
	};
});