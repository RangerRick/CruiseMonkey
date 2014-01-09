(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.DeckList', ['ngRoute', 'cruisemonkey.Logging', 'hammer'])
	.controller('CMDeckListCtrl', ['$scope', '$rootScope', '$timeout', '$routeParams', '$location', 'LoggingService', function($scope, $rootScope, $timeout, $routeParams, $location, log) {
		log.info('Initializing CMDeckListCtrl');

		$scope.previous = function() {
			previous();
		};
		$scope.next = function() {
			next();
		};

		var previous = function() {
			$scope.$broadcast('slideBox.prevSlide');
		};
		var next = function() {
			$scope.$broadcast('slideBox.nextSlide');
		};

		var listener = function(ev) {
			console.log("received event: ", ev);
			if (ev.keyCode === 37) {
				previous();
				return false;
			} else if (ev.keyCode === 39) {
				next();
				return false;
			}
			return true;
		};

		var updateButtons = function() {
			var newButtons = [];
			$rootScope.rightButtons = [];
			if ($scope.deck !== 2) {
				newButtons.push({
					'type': 'button-clear',
					'content': '<i class="icon icon-arrow-left4"></i>',
					tap: function(e) {
						previous();
						return false;
					}
				});
			}
			if ($scope.deck === 15) {
				newButtons.push({
					'type': 'button-clear',
					'content': '<i class="icon icon-blank"></i>',
					tap: function(e) {
					}
				});
			} else {
				newButtons.push({
					'type': 'button-clear',
					'content': '<i class="icon icon-arrow-right4"></i>',
					tap: function(e) {
						next();
						return false;
					}
				});
			}
			$rootScope.rightButtons = newButtons;
		};

		$scope.$on('slideBox.slideChanged', function(e, index) {
			$scope.deck = index + 2;
			$location.path('/deck-plans/' + $scope.deck);
		});

		if ($routeParams.deck) {
			$timeout(function() {
				var newDeck = parseInt($routeParams.deck, 10);
				$scope.$broadcast('slideBox.setSlide', newDeck - 2);
				$scope.deck = newDeck;
				$rootScope.title = "Deck " + $scope.deck;

				updateButtons();
			}, 10);
		}

		document.addEventListener('keydown', listener, true);
		$scope.$on('$destroy', function() {
			document.removeEventListener('keydown', listener, true);
		});
	}]);
}());