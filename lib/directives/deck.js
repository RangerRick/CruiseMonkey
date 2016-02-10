'use strict';

require('../cordova/Initializer');
require('../decks/Service');

angular.module('cruisemonkey.directives.deck', [
	'cruisemonkey.Decks',
	'cruisemonkey.Initializer'
])
.directive('cmDeck', function($compile, $log, $q, $rootScope, $timeout, Cordova, DeckService) {
	$log.info('cmDeck Initializing.');

	var lowMemory = true;
	Cordova.systemMemory().then(function(memory) {
		if (memory >= 1000000000) {
			lowMemory = false;
		}
	});

	$log.info('low memory? ' + lowMemory);

	return {
		scope: {
			deck: '@'
		},
		restrict: 'E',
		replace: true,
		template: '<img class="cm-directive deck" ng-src="{{url}}">',
		link: function(scope, el, attrs) {
			scope.lowMemory = lowMemory;

			var updateUrl = function(deck) {
				if (!deck) {
					deck = scope.deck;
				}
				if (deck) {
					if (lowMemory) {
						scope.url = require('../decks/images/deck-' + deck + '-512.png');
					} else {
						scope.url = require('../decks/images/deck-' + deck + '-1024.png');
					}
					$log.debug('deck ' + deck + ' url: ' + scope.url);
				} else {
					$log.debug('no deck!');
				}
			};

			$timeout(function() {
				updateUrl();
			});
			/*
			scope.$watch('deck', function(newDeck, oldDeck) {
				if (newDeck !== oldDeck) {
					$log.debug('new deck: ' + newDeck);
					updateUrl(newDeck);
				}
			});
			*/
		}
	};
});
