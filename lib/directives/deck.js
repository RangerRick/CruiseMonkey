'use strict';

require('../cordova/Initializer');
require('../decks/Service');

var deckTemplate = require('ngtemplate!html!./deck.html');

var maps = {};
for (var d=2; d <= 15; d++) {
	maps[d] = require('ngtemplate!html!../decks/imagemaps/deck-' + d + '.html');
}

angular.module('cruisemonkey.directives.deck', [
	'cruisemonkey.Decks',
	'cruisemonkey.Initializer'
])
.directive('cmDeck', function($compile, $ionicScrollDelegate, $log, $q, $rootScope, $timeout, Cordova, DeckService) {
	$log.info('cmDeck Initializing.');

	var lowMemory = true;
	Cordova.systemMemory().then(function(memory) {
		if (memory >= 1000000000) {
			lowMemory = false;
		}
	});

	$log.info('low memory? ' + lowMemory);

	return {
		scope: {
			deck: '@',
			showMarker: '='
		},
		restrict: 'E',
		replace: true,
		templateUrl: deckTemplate,
		/* template: '<img class="cm-directive deck" ng-src="{{url}}">', */
		link: function(scope, el, attrs) {
			scope.lowMemory = lowMemory;

			$log.warn('show-marker: ' + scope.showMarker);

			scope.getMap = function(deck) {
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

					$log.debug('image size (natural): ' + naturalWidth + 'x' + naturalHeight);
					$log.debug('image size (actual): ' + actualWidth + 'x' + actualHeight);

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
					}
				}
			};

			var showMarker = function(wait) {
				if (wait === undefined) {
					wait = 600;
				}

				var deck = scope.deck;
				var scale = getScale(deck);
				var mapEntry = angular.element('#deck-' + deck + '-map').find('area[id="' + scope.showMarker + '"]');
				var image  = angular.element('#deck-' + deck + '-image');

				if (image.length) {
					image = image[0];
				}

				if (scale && mapEntry.length && image) {
					var title = mapEntry.attr('title');
					if (title) {
						scope.title = title;
					} else {
						scope.title = 'Deck ' + deck + ' (' + scope.showMarker + ')';
					}

					var amenity = DeckService.getAmenity(deck, scope.showMarker);
					if (amenity) {
						scope.description = amenity.getDescription();
					} else {
						delete scope.description;
					}

					var coords = mapEntry.attr('coords');
					if (coords) {
						coords = getCoordinates(coords);
						var bounds = getBounds(coords);
						$log.debug('scaled bounding box: ' + angular.toJson(bounds));
						scope.dotStyle = {
							'background-color': 'red',
							top: image.offsetTop + (bounds.top + bounds.bottom) / 2,
							left: image.offsetLeft + (bounds.left + bounds.right) / 2
						};
						$timeout(function() {
							if (wait > 0) {
								var scrollto = Math.max(0, scope.dotStyle.top - 200);
								$ionicScrollDelegate.$getByHandle('amenity-deck').scrollTo(0, scrollto, true);
							}
						});
					} else {
						$log.warn('showMarker: No coordinates on area!');
					}
				}
			};

			var updateMap = function(deck) {
				if (!deck) {
					deck = scope.deck;
				}
				if (deck) {
					if (lowMemory) {
						scope.url = require('../decks/images/deck-' + deck + '-512.png');
					} else {
						scope.url = require('../decks/images/deck-' + deck + '-1024.png');
					}
					$timeout(function() {
						if (scope.showMarker) {
							scaleMap(deck);
							showMarker();
						}
					}, 1000);
					$log.debug('deck ' + deck + ' url: ' + scope.url);
				} else {
					$log.debug('no deck!');
				}
			};

			$timeout(function() {
				updateMap();
			});
			/*
			scope.$watch('deck', function(newDeck, oldDeck) {
				if (newDeck !== oldDeck) {
					$log.debug('new deck: ' + newDeck);
					updateUrl(newDeck);
				}
			});
			*/
		}
	};
});
