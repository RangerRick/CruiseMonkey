(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.DeckList', [
		'ui.router',
		'angularLocalStorage',
		'cruisemonkey.Cordova',
		'cruisemonkey.Logging'
	])
	.controller('CMDeckListCtrl', ['storage', '$scope', '$rootScope', '$timeout', '$state', '$stateParams', '$location', '$document', 'CordovaService', 'LoggingService', function(storage, $scope, $rootScope, $timeout, $state, $stateParams, $location, $document, cor, log) {
		log.info('Initializing CMDeckListCtrl');
		$rootScope.title = "Deck Plans";
		$rootScope.leftButtons = [];

		storage.bind($scope, 'deck', {
			'defaultValue': 2,
			'storeName': 'cm.deck'
		});

		if ($scope.deck !== undefined && isNaN($scope.deck)) {
			$scope.deck = parseInt($scope.deck, 10);
		}

		if ($stateParams.deck) {
			log.info('$stateParams.deck: ' + $stateParams.deck);
			var passedDeck = 0;
			if ($stateParams.deck.indexOf('-') > -1) {
				var parts = $stateParams.deck.split('-');
				passedDeck = parseInt(parts.shift(), 10);
			} else {
				passedDeck = parseInt($stateParams.deck, 10);
			}
			if (passedDeck && passedDeck > 0) {
				log.info('passedDeck = ' + passedDeck);
				$scope.deck = passedDeck;
			}
		}
		$scope.currentSlide = $scope.deck - 2;

		var previous = function() {
			$scope.$broadcast('slideBox.prevSlide');
		};
		var next = function() {
			$scope.$broadcast('slideBox.nextSlide');
		};

		var keyListener = function(ev) {
			if (ev.keyCode === 37) {
				previous();
				return false;
			} else if (ev.keyCode === 39) {
				next();
				return false;
			}
			return true;
		};

		$scope.shouldBeVisible = function(deck) {
			//return $scope.deck === deck;
			/* pre-cache the one before and after */
			return (deck >= ($scope.deck - 1) && deck <= ($scope.deck + 1));
		};

		var updateUI = function() {
			$rootScope.title = "Deck " + $scope.deck;
			
			cor.ifCordova(function() {
			}).otherwise(function() {
				var newButtons = [
					{
						'type': 'button-clear',
						'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
						tap: function(e) {
							previous();
							return false;
						}
					},
					{
						'type': 'button-clear',
						'content': '<i class="icon icon-cm ion-arrow-right-b"></i>',
						tap: function(e) {
							next();
							return false;
						}
					}
				];

				if ($scope.deck === 2) {
					newButtons[0] = {
						'type': 'button-clear',
						'content': '<i class="icon icon-blank"></i>',
						tap: function() {}
					};
				} else if ($scope.deck === 15) {
					newButtons[1] = {
						'type': 'button-clear',
						'content': '<i class="icon icon-blank"></i>',
						tap: function() {}
					};
				}
				$rootScope.rightButtons = newButtons;
			});
		};

		$scope.$watch('deck', function(newValue, oldValue) {
			$state.transitionTo('deck-plans', {
				deck: $scope.deck
			}, {
				location: true,
				inherit: true,
				notify: false,
				reload: false
			});
			updateUI();
		});

		$scope.slideChanged = function(index) {
			log.info('slideBox.slideChanged: ' + index);
			$scope.deck = index + 2;
		};

		updateUI();

		document.addEventListener('keydown', keyListener, true);
		$scope.$on('$destroy', function() {
			document.removeEventListener('keydown', keyListener, true);
		});
	}]);
}());
