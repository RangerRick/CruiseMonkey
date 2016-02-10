'use strict';

(function() {
	var model = require('../data/Model');

	require('../directives/deck');
	require('../decks/Service');
	require('ion-sticky');
	require('ionic-filter-bar');
	require('imagemap-resizer');

	var CMDeck = model.CMDeck;

	var amentitiesListTemplate = require('ngtemplate!html!./amenities.html');
	var amentityDeckTemplate = require('ngtemplate!html!./deck.html');
	var deckPopoverTemplate = require('ngtemplate!html!./deck-popover.html');

	var maps = {};
	for (var d=2; d <= 15; d++) {
		maps[d] = require('ngtemplate!html!../decks/imagemaps/deck-' + d + '.html');
	}

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
	.controller('CMAmenityDeckCtrl', function($compile, $ionicPopover, $ionicScrollDelegate, $log, $scope, $timeout, DeckService) {
		$log.info('Initializing CMAmenityDeckCtrl');

		$ionicPopover.fromTemplateUrl(deckPopoverTemplate, {
			scope: $scope
		}).then(function(popover) {
			$scope.popover = popover;
		});

		$scope.getMap = function(deck) {
			return maps[''+deck];
		};

		var getScale = function(deck) {
			var image  = angular.element('#deck-' + deck + '-image');

			if (image.length) {
				image = image[0];
			}

			if (image) {
				var naturalWidth  = image.naturalWidth,
					naturalHeight = image.naturalHeight,
					actualWidth   = image.width,
					actualHeight  = image.height;

				$log.warn('image size (natural): ' + naturalWidth + 'x' + naturalHeight);
				$log.warn('image size (actual): ' + actualWidth + 'x' + actualHeight);

				var scale = 1.0;
				if (naturalWidth === 512) {
					scale = 0.5;
				}
				return actualHeight / naturalHeight * scale;
			} else {
				return undefined;
			}
		};

		var getCoordinates = function(coords) {
			return coords.split(',').map(function(coord) {
				return parseInt(coord, 10);
			});
		}

		var scaleCoordinates = function(coords, scale) {
			return getCoordinates(coords).map(function(coord) {
				return coord * scale;
			});
		};

		var getBounds = function(coords) {
			var bounds = {
				left: Number.MAX_VALUE,
				right: Number.MIN_VALUE,
				top: Number.MAX_VALUE,
				bottom: Number.MIN_VALUE
			};
			for (var i=0, coord; i < coords.length; i++) {
				coord = coords[i];
				if (i % 2 === 0) {
					bounds.left = Math.min(coord, bounds.left);
					bounds.right = Math.max(coord, bounds.right);
				} else {
					bounds.top = Math.min(coord, bounds.top);
					bounds.bottom = Math.max(coord, bounds.bottom);
				}
			}
			return bounds;
		};

		var configureClick = function(el, id) {
			el.on('click', function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
				//$log.debug('id clicked: ' + id);
				$scope.amenityId = id;
				showMarker(0);
			});
		};

		var scaleMap = function(deck) {
			if (!deck) {
				$log.warn('scaleMap: no deck!');
				return;
			}

			var scale = getScale(deck);
			var map = angular.element('#deck-' + deck + '-map');

			if (scale && map.length > 0) {
				var areas = map[0].querySelectorAll('area');
				for (var i=0; i < areas.length; i++) {
					var el = angular.element(areas.item(i));

					var coords = el.attr('coords');
					if (coords) {
						//$log.debug('old coords: ' + coords);
						coords = scaleCoordinates(coords, scale);
						//$log.debug('new coords: ' + coords);
						el.attr('coords', coords);
					} else {
						$log.warn('scaleMap: No coordinates on area!');
					}

					var id = el.attr('id');
					if (id) {
						configureClick(el, id);
					}
				}
			}
		};

		var showMarker = function(wait) {
			if (wait === undefined) {
				wait = 600;
			}

			var deck = $scope.deck;
			var scale = getScale(deck);
			var mapEntry = angular.element('#deck-' + deck + '-map').find('area[id="' + $scope.amenityId + '"]');
			var image  = angular.element('#deck-' + deck + '-image');

			if (image.length) {
				image = image[0];
			}

			if (scale && mapEntry.length && image) {
				var title = mapEntry.attr('title');
				if (title) {
					$scope.title = title;
				} else {
					$scope.title = 'Deck ' + deck + ' (' + $scope.amenityId + ')';
				}

				var amenity = DeckService.getAmenity(deck, $scope.amenityId);
				if (amenity) {
					$scope.description = amenity.getDescription();
				} else {
					delete $scope.description;
				}

				var coords = mapEntry.attr('coords');
				if (coords) {
					coords = getCoordinates(coords);
					var bounds = getBounds(coords);
					$log.warn('scaled bounding box: ' + angular.toJson(bounds));
					$scope.dotStyle = {
						/*'background-color': 'red',*/
						top: image.offsetTop + (bounds.top + bounds.bottom) / 2,
						left: image.offsetLeft + (bounds.left + bounds.right) / 2
					};
					$timeout(function() {
						if (wait > 0) {
							var scrollto = Math.max(0, $scope.dotStyle.top - 200);
							$ionicScrollDelegate.$getByHandle('amenity-deck').scrollTo(0, scrollto, true);
						}

						$timeout(function() {
							$scope.popover.show({target: angular.element('#deck-dot')[0]});
						}, wait);
					});
				} else {
					$log.warn('showMarker: No coordinates on area!');
				}
			}
		};

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			$scope.deck = info.stateParams.deck;
			$scope.amenityId = info.stateParams.amenityId;

			$log.debug('opening deck view to deck ' + $scope.deck + ', amenity ' + $scope.amenityId);
			if ($scope.amenityId) {
				$timeout(function() {
					scaleMap($scope.deck);
					showMarker();
				}, 1000);
			}
		});
	});
}());
