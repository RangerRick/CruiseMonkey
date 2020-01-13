const model = require('../data/Model');

require('../directives/deck');
require('../decks/Service');
require('ion-sticky');
require('ionic-filter-bar');

require('ngstorage');

const CMDeck = model.CMDeck;

const amentitiesListTemplate = require('./amenities.html');
const amentityDeckTemplate = require('./deck.html');

angular.module('cruisemonkey.controllers.Amenities', [
	'ngStorage',
	'cruisemonkey.Decks',
	'ion-sticky',
	'jett.ionic.filter.bar'
])
.config(($stateProvider) => {
	$stateProvider
		.state('tab.info-amenities', {
			url: '/info/amenities',
			views: {
				'tab-info': {
					templateUrl: amentitiesListTemplate,
					controller: 'CMAmenitiesCtrl'
				}
			}
		})
		.state('tab.info-amenities-deck', {
			url: '/info/amenities/deck/:deck/:amenityId',
			views: {
				'tab-info': {
					templateUrl: amentityDeckTemplate,
					controller: 'CMAmenityDeckCtrl'
				}
			}
		})
		;
})
.filter('amenityFilter', () => {
	return (input, searchString) => {
		const allArray = [], ret = [];
		angular.forEach(input, (obj) => {
			if (obj.matches(searchString)) {
				allArray.push(obj);
			}
		});
		for (let i=0; i < allArray.length; i++) {
			if (allArray[i+1] && allArray[i] instanceof CMDeck && allArray[i+1] instanceof CMDeck) {
				// this is a deck header, and the next is a deck header, do nothing
			} else {
				ret.push(allArray[i]);
			}
		}
		if (ret.length > 0 && ret[ret.length-1] instanceof CMDeck) {
			ret.pop();
		}
		return ret;
	};
})
.controller('CMAmenitiesCtrl', ($filter, $ionicFilterBar, $ionicScrollDelegate, $localStorage, $location, $log, $scope, DeckService) => {
	$log.info('Initializing CMAmenitiesCtrl');

	$scope.$storage = $localStorage;

	if (!$scope.$storage.amenities) {
		$scope.$storage.amenities = {};
	}

	$scope.scrollTop = () => {
		$ionicScrollDelegate.$getByHandle('amenities').scrollTop(true);
	};

	$scope.showFilterBar = () => {
		$ionicFilterBar.show({
			items: $scope.amenities,
			/*filterProperties: ['_summary', '_description'],*/
			filter: $filter('amenityFilter'),
			debounce: true,
			update: function (filteredItems, filterText) {
				$scope.$storage['cruisemonkey.amenities.searchString'] = filterText;
				$scope.amenities = filteredItems;
			}
		});
	};

	$scope.getLink = (amenity) => {
		return '#/tab/info/amenities/deck/' + amenity.getDeck().getFloor() + '/' + amenity.getId();
	};

	$scope.$on('$ionicView.loaded', (/* ev, info */) => {
		$scope.amenities = DeckService.getAmenities();

		$scope.openAmenity = (ev, amenity) => {
			if (!amenity) {
				$log.debug('Weird.  No amenity.');
				return;
			}
			if (amenity.getId()) {
				const uniqueId = amenity.getUniqueId();
				$log.debug('open amenity: ' + uniqueId);
				$location.path('/deck-plans/' + amenity.getUniqueId());
			} else {
				$log.debug('amenity does not have an ID: ' + amenity.toString());
			}
		};

		$ionicScrollDelegate.$getByHandle('amenities').resize();
	});
})
.controller('CMAmenityDeckCtrl', ($log, $scope) => {
	$log.info('Initializing CMAmenityDeckCtrl');

	$scope.$on('$ionicView.beforeEnter', (ev, info) => {
		$scope.deck = info.stateParams.deck;
		$scope.amenityId = info.stateParams.amenityId;

		/*
		$log.debug('opening deck view to deck ' + $scope.deck + ', amenity ' + $scope.amenityId);
		if ($scope.amenityId) {
			$timeout(() => {
				scaleMap($scope.deck);
				showMarker();
			}, 1000);
		}
		*/
	});
});
