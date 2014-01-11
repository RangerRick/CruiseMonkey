(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.DeckList', ['ngRoute', 'cruisemonkey.Logging'])
	.controller('CMDeckListCtrl', ['$scope', '$rootScope', '$timeout', '$state', '$stateParams', '$location', 'LoggingService', function($scope, $rootScope, $timeout, $state, $stateParams, $location, log) {
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

		var updateUI = function() {
			$rootScope.title = "Deck " + $scope.deck;
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
			updateUI();
			$state.transitionTo('deck-plans', {
				deck: $scope.deck
			}, {
				location: true,
				inherit: true,
				notify: false,
				reload: false
			});
		});

		if ($stateParams.deck) {
			$timeout(function() {
				var newDeck = parseInt($stateParams.deck, 10);
				$scope.$broadcast('slideBox.setSlide', newDeck - 2);
				$scope.deck = newDeck;
				updateUI();
			}, 10);
		} else {
			$scope.deck = 2;
			updateUI();
		}

		document.addEventListener('keydown', listener, true);
		$scope.$on('$destroy', function() {
			document.removeEventListener('keydown', listener, true);
		});
	}]);
}());