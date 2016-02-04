'use strict';

var translator = require('../twitarr/translator');

angular.module('cruisemonkey.directives.twitter-html', [
	'ionic',
	'cruisemonkey.emoji.Emoji'
])
.directive('twitterHtml', function($compile, $log, EmojiService) {
	var updateElement = function(element, scope, text) {
		var newText = translator.format(text);
		element.html(newText);
		$compile(element.contents())(scope);
	};

	return {
		scope: {
			twitterHtml: '='
		},
		restrict: 'A',
		template: '<p class="cm-directive tweet-text user-sizeable"></p>',
		link: function(scope, el, attrs) {
			//$log.debug('html=' + scope.twitterHtml);
			updateElement(el, scope, scope.twitterHtml);
			scope.$watch('twitterHtml', function(newValue) {
				updateElement(el, scope, newValue);
			});
		}
	};
});