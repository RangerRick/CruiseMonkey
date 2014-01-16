(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Amenities', ['angularLocalStorage', 'cruisemonkey.Decks', 'cruisemonkey.Logging'])
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
	.controller('CMAmenitiesCtrl', ['storage', '$rootScope', '$scope', '$location', 'DeckService', 'LoggingService', function(storage, $rootScope, $scope, $location, DeckService, log) {
		log.info('Initializing CMAmenitiesCtrl');
		$rootScope.title = 'Amenities';

		$scope.amenities = DeckService.getAmenities();
		console.log('amenities=',$scope.amenities);

		$scope.headerAmenities = {};
		var lastDeck = 0;
		angular.forEach($scope.amenities, function(amenity, index) {
			if (amenity.getDeck() !== lastDeck) {
				$scope.headerAmenities[amenity.getUniqueId()] = true;
			}
			lastDeck = amenity.getDeck();
		});

		$scope.openAmenity = function(amenity) {
			if (amenity.getId()) {
				var uniqueId = amenity.getUniqueId();
				log.info('open amenity: ' + uniqueId);
				$location.path('/deck-plans/' + amenity.getUniqueId());
			} else {
				log.warn('amenity does not have an ID: ' + amenity.toString());
			}
		};

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.amenities'
		});
		log.debug('$scope.searchString: ' + $scope.searchString);
	}]);
}());
