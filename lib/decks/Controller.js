(function() {
	'use strict';

	require('../cordova/Initializer');

	var deckImageUrls = {
		512: [],
		1024: []
	};

	for (var deck=2, len=15; deck <= len; deck++) {
		deckImageUrls['512'][deck]  = require('./images/deck-' + deck + '-512.png');
		deckImageUrls['1024'][deck] = require('./images/deck-' + deck + '-1024.png');
	}

	angular.module('cruisemonkey.controllers.DeckList', [
		'ui.router',
		'cruisemonkey.DB',
		'cruisemonkey.Initializer'
	])
	.controller('CMDeckListCtrl', function($document, $ionicScrollDelegate, $ionicSlideBoxDelegate, $location, $log, $q, $scope, $timeout, Cordova, kv) {
		$log.info('Initializing CMDeckListCtrl');

		var positions = [];

		$q.all({
			deck: kv.get('cruisemonkey.deck'),
			memory: Cordova.systemMemory()
		}).then(function(res) {
			$log.debug('res=' + angular.toJson(res));
			if (res.deck) {
				$scope.deck = parseInt(res.deck, 10);
			} else {
				$scope.deck = 2;
			}
			$scope.urls = deckImageUrls['512'];
			$scope.lowMemory = true;
			if (res.memory && res.memory >= 1000000000) {
				$scope.urls = deckImageUrls['1024'];
				$scope.lowMemory = false;
			}
			$scope.currentSlide = $scope.deck - 2;
		});

		var updateDeck = function(deck) {
			if (deck && typeof deck === 'string' || deck instanceof String) {
				deck = parseInt(deck, 10);
			}
			$scope.deck = deck;
			updateUI();
			if (deck === undefined) {
				return kv.remove('cruisemonkey.deck');
			} else {
				return kv.set('cruisemonkey.deck', deck);
			}
		};

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('deck-list').scrollTop(true);
		};

		$scope.showButtons = true;

		if ($scope.deck !== undefined && isNaN($scope.deck)) {
			updateDeck(parseInt($scope.deck, 10));
		}

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

		/*
		$scope.updateScrollPosition = function() {
			positions[$scope.deck] = $ionicScrollDelegate.$getByHandle('deck-list').getScrollPosition().top;
		};
		*/

		$scope.shouldBeVisible = function(deck) {
			if ($scope.lowMemory) {
				return $scope.deck === deck;
			} else {
				/* pre-cache the one before and after */
				return deck >= $scope.deck - 1 && deck <= $scope.deck + 1;
			}
		};

		var updateUI = function() {
			$ionicScrollDelegate.$getByHandle('deck-list').resize();
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
		};

		/*
		$scope.$watch('deck', function(newValue, oldValue) {
			updateUI();
		});
		*/

		$scope.slideChanged = function(index) {
			//$log.debug('CMDeckListCtrl: slideBox.slideChanged: ' + angular.toJson(index));
			updateDeck(index + 2);
		};

		updateUI();

		/*
		$document.addEventListener('keydown', keyListener, true);
		$scope.$on('$destroy', function() {
			$document.removeEventListener('keydown', keyListener, true);
		});
	*/
	});
}());
