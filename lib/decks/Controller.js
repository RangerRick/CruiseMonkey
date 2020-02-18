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

	$scope.extravagant = false;

	const updateUI = () => {
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
		$timeout(() => {
			$ionicScrollDelegate.$getByHandle('deck-list').resize();
		}, 0);
	};

	const updateDeck = (deck) => {
		if (deck && angular.isString(deck)) {
			deck = parseInt(deck, 10);
		}
		$scope.deck = deck || 1;
		updateUI();
		if (deck === undefined) {
			return kv.remove('cruisemonkey.deck');
		} else {
			return kv.set('cruisemonkey.deck', deck);
		}
	};

	$q.all({
		deck: kv.get('cruisemonkey.deck').catch(() => {
			return 1;
		}),
		memoryInfo: Cordova.memoryInfo(),
	}).then((res) => {
		if (res.memoryInfo && res.memoryInfo.percentUsed && res.memoryInfo.percentUsed < 25) {
			$scope.extravagant = true;
		}

		if (res.deck) {
			updateDeck(res.deck);
		} else {
			updateDeck(1);
		}

		if (!res.memoryInfo || !res.memoryInfo.total || res.memoryInfo.total < 1000000000) {
			$scope.urls = deckImageUrls['small'];
			$scope.lowMemory = true;
		} else {
			$scope.urls = deckImageUrls['large'];
			$scope.lowMemory = false;
		}
		$scope.currentSlide = $scope.deck - 1;
	}).catch((err) => {
		$log.warn('Failed to get deck info:', err);
		return $q.reject(err);
	});

	$scope.scrollTop = () => {
		$timeout(() => {
			$ionicScrollDelegate.$getByHandle('deck-list').scrollTop(true);
		}, 0);
	};

	$scope.showButtons = true;

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

	$scope.shouldBeVisible = (deck) => {
		if ($scope.extravagant) { 
			return true;
		}
		if ($scope.lowMemory) {
			return $scope.deck === deck;
		} else {
			/* pre-cache the one before and after */
			return deck >= $scope.deck - 1 && deck <= $scope.deck + 1;
		}
	};

	$scope.slideChanged = (index) => {
		//$log.debug('CMDeckListCtrl: slideBox.slideChanged: ' + angular.toJson(index));
		updateDeck(index + 1);
	};

	updateUI();
});
