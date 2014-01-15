(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.DeckList', ['angularLocalStorage', 'cruisemonkey.Logging'])
	.controller('CMDeckListCtrl', ['storage', '$scope', '$rootScope', '$timeout', '$state', '$stateParams', '$location', '$document', 'LoggingService', function(storage, $scope, $rootScope, $timeout, $state, $stateParams, $location, $document, log) {
		log.info('Initializing CMDeckListCtrl');

		storage.bind($scope, '_deck', {
			'defaultValue': '2',
			'storeName': 'cm.deck'
		});
		log.info('$scope._deck: ' + $scope._deck);

		$scope.deck = 2;
		if ($stateParams.deck) {
			log.info('$stateParams.deck: ' + $stateParams.deck);
			var passedDeck = 0;
			if ($stateParams.deck.contains('-')) {
				var parts = $stateParams.deck.split('-');
				passedDeck = parseInt(parts.shift(), 10);
				/*
				var id = parts.join('-');
				log.info('id=' + id);
				var element = document.getElementById(id);
				console.log('element=',element);
				$timeout(function() {
					log.info('scrolling to ' + element.offsetTop);
					window.scrollTo(element.offsetTop);
				}, 3000);
				*/
			} else {
				passedDeck = parseInt($stateParams.deck, 10);
			}
			if (passedDeck && passedDeck > 0) {
				$scope.deck = passedDeck;
			}
		} else if ($scope._deck) {
			log.info('$scope._deck: ' + $scope._deck);
			var storedDeck = parseInt($scope._deck, 10);
			if (storedDeck && storedDeck > 0) {
				$scope.deck = storedDeck;
			}
		}

		if ($stateParams.id) {
			log.info('id = ' + $StateParams.id);
		}

		$scope.$watch('deckIndex', function(newValue, oldValue) {
			log.info('deckIndex changed. oldValue: ' + oldValue + ', newValue: ' + newValue);
			$scope._deck = (newValue + 2).toString();
		});

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

		var keyListener = function(ev) {
			//console.log("received event: ", ev);
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
			/*
			$state.transitionTo('deck-plans', {
				deck: $scope.deck
			}, {
				location: true,
				inherit: true,
				notify: false,
				reload: false
			});
			*/
		});

		$timeout(function() {
			if ($scope.deck !== 2) {
				$scope.$broadcast('slideBox.setSlide', $scope.deck - 2);
			} else {
				updateUI();
			}
		}, 10);

		document.addEventListener('keydown', keyListener, true);
		$scope.$on('$destroy', function() {
			document.removeEventListener('keydown', keyListener, true);
		});
	}]);
}());