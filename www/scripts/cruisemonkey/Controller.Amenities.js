(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Amenities', ['angularLocalStorage', 'cruisemonkey.Decks'])
	.filter('amenityFilter', function() {
		return function(input, searchString) {
			var array = [];
			angular.forEach(input, function(obj, index) {
				if (obj.matches(searchString)) {
					array.push(obj);
				}
			});
			return array;
		};
	})
	.controller('CMAmenitiesCtrl', ['storage', '$rootScope', '$scope', '$timeout', '$location', '$ionicScrollDelegate', 'DeckService', function(storage, $rootScope, $scope, $timeout, $location, $ionicScrollDelegate, DeckService) {
		console.log('Initializing CMAmenitiesCtrl');

		storage.bind($scope, 'searchString', {
			'storeName': 'cruisemonkey.search.amenities'
		});

		$scope.$on('$ionicView.loaded', function(ev, info) {
			$scope.amenities = DeckService.getAmenities();

			$scope.headerAmenities = {};
			var lastDeck = 0;
			angular.forEach($scope.amenities, function(amenity, index) {
				if (amenity.getDeck() !== lastDeck) {
					$scope.headerAmenities[amenity.getUniqueId()] = true;
				}
				lastDeck = amenity.getDeck();
			});

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
