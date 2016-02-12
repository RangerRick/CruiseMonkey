'use strict';

(function() {
	var model = require('../data/Model');

	require('../directives/deck');
	require('../decks/Service');
	require('ion-sticky');
	require('ionic-filter-bar');

	var CMDeck = model.CMDeck;

	var amentitiesListTemplate = require('ngtemplate!html!./amenities.html');
	var amentityDeckTemplate = require('ngtemplate!html!./deck.html');

	angular.module('cruisemonkey.controllers.Amenities', [
		'cruisemonkey.DB',
		'cruisemonkey.Decks',
		'ion-sticky',
		'jett.ionic.filter.bar'
	])
	.config(function($stateProvider) {
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
	.filter('amenityFilter', function() {
		return function(input, searchString) {
			var allArray = [], ret = [];
			angular.forEach(input, function(obj, index) {
				if (obj.matches(searchString)) {
					allArray.push(obj);
				}
			});
			for (var i=0; i < allArray.length; i++) {
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
	.controller('CMAmenitiesCtrl', function($filter, $ionicFilterBar, $ionicScrollDelegate, $location, $log, $rootScope, $sce, $scope, $timeout, DeckService, kv) {
		$log.info('Initializing CMAmenitiesCtrl');

		kv.get('cruisemonkey.search.amenities').then(function(search) {
			$scope.searchString = search;
		});

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('amenities').scrollTop(true);
		};

		var filterBarInstance;
		$scope.showFilterBar = function() {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.amenities,
				/*filterProperties: ['_summary', '_description'],*/
				filter: $filter('amenityFilter'),
				debounce: true,
				update: function (filteredItems, filterText) {
					$scope.searchString = filterText;
					$scope.amenities = filteredItems;
				}
			});
		};

		$scope.getLink = function(amenity) {
			return '#/tab/info/amenities/deck/' + amenity.getDeck().getFloor() + '/' + amenity.getId();
		};

		$scope.$on('$ionicView.loaded', function(ev, info) {
			$scope.amenities = DeckService.getAmenities();

			$scope.openAmenity = function(ev, amenity) {
				if (!amenity) {
					$log.debug('Weird.  No amenity.');
					return;
				}
				if (amenity.getId()) {
					var uniqueId = amenity.getUniqueId();
					$log.debug('open amenity: ' + uniqueId);
					$location.path('/deck-plans/' + amenity.getUniqueId());
				} else {
					$log.debug('amenity does not have an ID: ' + amenity.toString());
				}
			};

			$ionicScrollDelegate.$getByHandle('amenities').resize();
		});
	})
	.controller('CMAmenityDeckCtrl', function($compile, $ionicScrollDelegate, $log, $scope, $timeout, DeckService) {
		$log.info('Initializing CMAmenityDeckCtrl');

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			$scope.deck = info.stateParams.deck;
			$scope.amenityId = info.stateParams.amenityId;

			/*
			$log.debug('opening deck view to deck ' + $scope.deck + ', amenity ' + $scope.amenityId);
			if ($scope.amenityId) {
				$timeout(function() {
					scaleMap($scope.deck);
					showMarker();
				}, 1000);
			}
			*/
		});
	});
}());
