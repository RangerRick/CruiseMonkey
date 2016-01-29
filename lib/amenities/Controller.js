'use strict';

(function() {
	var model = require('../data/Model');

	require('../decks/Service');
	require('ion-sticky');
	require('ionic-filter-bar');

	var CMDeck = model.CMDeck;

	angular.module('cruisemonkey.controllers.Amenities', [
		'cruisemonkey.DB',
		'cruisemonkey.Decks',
		'ion-sticky',
		'jett.ionic.filter.bar'
	]).filter('amenityFilter', function() {
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

		$scope.$on('$ionicView.loaded', function(ev, info) {
			$scope.amenities = DeckService.getAmenities();

			$scope.openAmenity = function(ev, amenity) {
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
	});
}());
