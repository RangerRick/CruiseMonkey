'use strict';

require('../cordova/Initializer');
require('../decks/Service');

angular.module('cruisemonkey.directives.deck', [
	'cruisemonkey.Decks',
	'cruisemonkey.Initializer'
])
.directive('cmDeck', function($compile, $log, $q, Cordova, DeckService) {
	$log.info('cmDeck Initializing.');

	var lowMemory = true;
	Cordova.systemMemory().then(function(memory) {
		if (memory >= 1000000000) {
			lowMemory = false;
		}
	});

	return {
		scope: {
			deck: '@'
		},
		restrict: 'E',
		replace: true,
		template: '<img class="cm-directive deck" ng-src="{{url}}">',
		link: function(scope, el, attrs) {
			scope.lowMemory = lowMemory;

			if (scope.deck) {
				$log.debug('deck:' + scope.deck);
				if (lowMemory) {
					scope.url = require('../decks/images/deck-' + scope.deck + '-512.png');
				} else {
					scope.url = require('../decks/images/deck-' + scope.deck + '-1024.png');
				}
			} else {
				$log.debug('no deck!');
			}
			$log.debug('deck ' + scope.deck + ' url: ' + scope.url);
		}
	};
});
