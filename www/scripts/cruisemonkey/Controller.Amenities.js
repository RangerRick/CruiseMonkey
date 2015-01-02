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
	.controller('CMAmenitiesCtrl', ['storage', '$rootScope', '$scope', '$timeout', '$location', 'DeckService', function(storage, $rootScope, $scope, $timeout, $location, DeckService) {
		console.info('Initializing CMAmenitiesCtrl');

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
				console.info('open amenity: ' + uniqueId);
				$location.path('/deck-plans/' + amenity.getUniqueId());
			} else {
				console.warn('amenity does not have an ID: ' + amenity.toString());
			}
		};

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.amenities'
		});
		console.debug('$scope.searchString: ' + $scope.searchString);

		$scope.clearSearchString = function() {
			console.info('clear search string');
			var element = document.getElementById('search');
			element.value = '';
			if ("createEvent" in document) {
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent('change', false, true);
				element.dispatchEvent(evt);
			} else {
				element.fireEvent('change');
			}
		};
	}]);
}());
