require('../data/DB');

require('../cordova/Initializer');

const deckImageUrls = {
	small: [],
	large: []
};

for (let deck=1, len=11; deck <= len; deck++) {
	deckImageUrls['small'][deck] = require('./images/deck-' + deck + '-512.png').default;
	deckImageUrls['large'][deck] = require('./images/deck-' + deck + '-1024.png').default;
}

angular.module('cruisemonkey.controllers.DeckList', [
	'ui.router',
	'cruisemonkey.DB',
	'cruisemonkey.Initializer'
])
.controller('CMDeckListCtrl', ($document, $ionicScrollDelegate, $log, $q, $scope, $timeout, Cordova, kv) => {
	$log.info('Initializing CMDeckListCtrl');

	$q.all({
		deck: kv.get('cruisemonkey.deck').catch(() => {
			return 1;
		}),
		memory: Cordova.systemMemory()
	}).then((res) => {
		if (res.deck) {
			$scope.deck = parseInt(res.deck, 10);
		} else {
			$scope.deck = 1;
		}
		$scope.urls = deckImageUrls['large'];
		$scope.lowMemory = false;
		if (res.memory && res.memory < 1000000000) {
			$scope.urls = deckImageUrls['small'];
			$scope.lowMemory = true;
		}
		$scope.currentSlide = $scope.deck - 1;
	}).catch((err) => {
		$log.warn('Failed to get deck info:', err);
		return $q.reject(err);
	});

	const updateUI = () => {
		$timeout(() => {
			$ionicScrollDelegate.$getByHandle('deck-list').resize();
			if ($scope.deck === 1) {
				$scope.hasPrevious = false;
				$scope.hasNext = true;
			} else if ($scope.deck === 11) {
				$scope.hasPrevious = true;
				$scope.hasNext = false;
			} else {
				$scope.hasPrevious = true;
				$scope.hasNext = true;
			}
		}, 0);
	};

	const updateDeck = (deck) => {
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

	$scope.scrollTop = () => {
		$timeout(() => {
			$ionicScrollDelegate.$getByHandle('deck-list').scrollTop(true);
		}, 0);
	};

	$scope.showButtons = true;

	if ($scope.deck === undefined || isNaN($scope.deck)) {
		updateDeck(parseInt($scope.deck, 10));
	}

	const previous = () => {
		$scope.$broadcast('slideBox.prevSlide');
	};
	const next = () => {
		$scope.$broadcast('slideBox.nextSlide');
	};

	$scope.previous = () => {
		previous();
	};

	$scope.next = () => {
		next();
	};

	/*
	const keyListener = (ev) => {
		if (ev.keyCode === 37) {
			previous();
			return false;
		} else if (ev.keyCode === 39) {
			next();
			return false;
		}
		return true;
	};
	*/

	/*
	$scope.updateScrollPosition = () => {
		positions[$scope.deck] = $ionicScrollDelegate.$getByHandle('deck-list').getScrollPosition().top;
	};
	*/

	$scope.shouldBeVisible = (deck) => {
		if ($scope.lowMemory) {
			return $scope.deck === deck;
		} else {
			/* pre-cache the one before and after */
			return deck >= $scope.deck - 1 && deck <= $scope.deck + 1;
		}
	};

	/*
	$scope.$watch('deck', (newValue, oldValue) => {
		updateUI();
	});
	*/

	$scope.slideChanged = (index) => {
		//$log.debug('CMDeckListCtrl: slideBox.slideChanged: ' + angular.toJson(index));
		updateDeck(index + 1);
	};

	updateUI();

	/*
	$document.addEventListener('keydown', keyListener, true);
	$scope.$on('$destroy', () => {
		$document.removeEventListener('keydown', keyListener, true);
	});
*/
});
