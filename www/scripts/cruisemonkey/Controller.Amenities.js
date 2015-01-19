(function() {
	'use strict';

	/* global CMDeck: true */

	angular.module('cruisemonkey.controllers.Amenities', ['angularLocalStorage', 'cruisemonkey.Decks'])
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
	.controller('CMAmenitiesCtrl', ['storage', '$rootScope', '$scope', '$sce', '$timeout', '$location', '$ionicScrollDelegate', 'DeckService', function(storage, $rootScope, $scope, $sce, $timeout, $location, $ionicScrollDelegate, DeckService) {
		console.log('Initializing CMAmenitiesCtrl');

		storage.bind($scope, 'searchString', {
			'storeName': 'cruisemonkey.search.amenities'
		});

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('amenities').scrollTop(true);
		};

		$scope.onSearchChanged = function(searchString) {
			var delegate = $ionicScrollDelegate.$getByHandle('amenities');
			if (delegate.getScrollPosition().top !== 0) {
				delegate.scrollTop(false);
			}
		};

		$scope.$on('$ionicView.loaded', function(ev, info) {
			$scope.amenities = DeckService.getAmenities();

			$scope.openAmenity = function(ev, amenity) {
				if (amenity.getId()) {
					var uniqueId = amenity.getUniqueId();
					console.log('open amenity: ' + uniqueId);
					$location.path('/deck-plans/' + amenity.getUniqueId());
				} else {
					console.log('amenity does not have an ID: ' + amenity.toString());
				}
			};

			$ionicScrollDelegate.$getByHandle('amenities').resize();
		});
	}]);
}());
