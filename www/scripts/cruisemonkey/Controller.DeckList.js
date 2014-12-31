(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.DeckList', [
		'ui.router',
		'angularLocalStorage',
		'cruisemonkey.Cordova'
	])
	.controller('CMDeckListCtrl', ['storage', '$scope', '$rootScope', '$ionicNavBarDelegate', '$ionicSlideBoxDelegate', '$timeout', '$state', '$stateParams', '$location', '$document', 'CordovaService', function(storage, $scope, $rootScope, $ionicNavBarDelegate, $ionicSlideBoxDelegate, $timeout, $state, $stateParams, $location, $document, cor) {
		console.info('Initializing CMDeckListCtrl');
		$rootScope.leftButtons = $rootScope.getLeftButtons();
		$rootScope.rightButtons = [];

		storage.bind($scope, 'deck', {
			'defaultValue': 2,
			'storeName': 'cm.deck'
		});

		if ($scope.deck !== undefined && isNaN($scope.deck)) {
			$scope.deck = parseInt($scope.deck, 10);
		}

		if ($stateParams.deck) {
			console.info('$stateParams.deck: ' + $stateParams.deck);
			var passedDeck = 0;
			if ($stateParams.deck.indexOf('-') > -1) {
				var parts = $stateParams.deck.split('-');
				passedDeck = parseInt(parts.shift(), 10);
			} else {
				passedDeck = parseInt($stateParams.deck, 10);
			}
			if (passedDeck && passedDeck > 0) {
				console.info('passedDeck = ' + passedDeck);
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

		$scope.previous = function() {
			previous();
		};
		
		$scope.next = function() {
			next();
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
			$rootScope.headerTitle = "Deck " + $scope.deck;

			if ($scope.deck === 2) {
				$scope.hasPrevious = false;
				$scope.hasNext = true;
			} else if ($scope.deck === 15) {
				$scope.hasPrevious = true;
				$scope.hasNext = false;
			} else {
				$scope.hasPrevious = true;
				$scope.hasNext = true;
			}

			cor.ifCordova(function() {
				$scope.showButtons = false;
			}).otherwise(function() {
				$scope.showButtons = true;
			});
			$ionicNavBarDelegate.title('Deck ' + $scope.deck);
		};

		$scope.$watch('deck', function(newValue, oldValue) {
			$state.transitionTo('app.deck-plans', {
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
			console.info('slideBox.slideChanged: ' + index);
			$scope.deck = index + 2;
		};

		updateUI();

		document.addEventListener('keydown', keyListener, true);
		$scope.$on('$destroy', function() {
			document.removeEventListener('keydown', keyListener, true);
		});
	}]);
}());
