(function() {
	'use strict';

	var angular = require('angular');

	angular.module('cruisemonkey.controllers.DeckList', [
		'ui.router',
		'cruisemonkey.DB'
	])
	.controller('CMDeckListCtrl', function($document, $ionicScrollDelegate, $ionicSlideBoxDelegate, $location, $log, $scope, $timeout, kv) {
		$log.info('Initializing CMDeckListCtrl');

		kv.get('cruisemonkey.deck').then(function(d) {
			$scope.deck = d;
			if (!$scope.deck) {
				$scope.deck = 2;
			}
		});

		var updateDeck = function(deck) {
			$scope.deck = deck;
			if (deck === undefined) {
				return kv.remove('cruisemonkey.deck');
			} else {
				return kv.set('cruisemonkey.deck', deck);
			}
		};

		$scope.scrollTop = function() {
			var delegate = $ionicScrollDelegate.$getByHandle('deck-list');
			delegate.scrollTop(true);
		};

		$scope.showButtons = true;

		if ($scope.deck !== undefined && isNaN($scope.deck)) {
			updateDeck(parseInt($scope.deck, 10));
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
			return $scope.deck === deck;
			/* pre-cache the one before and after */
			//return (deck >= ($scope.deck - 1) && deck <= ($scope.deck + 1));
		};

		var updateUI = function() {
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

			$ionicScrollDelegate.resize();
		};

		$scope.$watch('deck', function(newValue, oldValue) {
			updateUI();
		});

		$scope.slideChanged = function(index) {
			$log.debug('CMDeckListCtrl: slideBox.slideChanged: ' + index);
			updateDeck(index + 2);
		};

		updateUI();

		$document.addEventListener('keydown', keyListener, true);
		$scope.$on('$destroy', function() {
			$document.removeEventListener('keydown', keyListener, true);
		});
	});
}());
