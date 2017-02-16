'use strict';

require('../cordova/Initializer');
require('../decks/Service');

var deckTemplate = require('ngtemplate!html!./deck.html');

angular.module('cruisemonkey.directives.deck', [
	'cruisemonkey.Decks',
	'cruisemonkey.Initializer'
])
.service('myScrollDelegate', function($ionicScrollDelegate) {
	var custom = {
		$getByHandle: function(name) {
			var instances = $ionicScrollDelegate.$getByHandle(name)._instances;
			return instances.filter(function(element) {
				return element['$$delegateHandle'] === name;
			})[0];
		}
	};

	var standard = {
		$getByHandle: function(name) {
			return $ionicScrollDelegate.$getByHandle(name);
		}
	};

	//return standard;
	return custom;
})
.directive('cmDeck', function($compile, $interval, $log, $q, $rootScope, $timeout, Cordova, DeckService, myScrollDelegate) {
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
			showMarker: '=',
			scrollDelegate: '@'
		},
		restrict: 'E',
		replace: true,
		templateUrl: deckTemplate,
		link: function(scope, el, attrs) {
			scope.lowMemory = lowMemory;

			var imageReady = $q.defer();

			var getImage = function(deck) {
				deck = deck || scope.deck;
				var image  = angular.element('#deck-' + deck + '-image');
				if (image.length) {
					return image[0];
				}
				return null;
			};

			var getMap = function(deck) {
				deck = deck || scope.deck;
				return maps[''+deck];
			};

			var getMapElement = function(deck) {
				deck = deck || scope.deck;
				return angular.element('#deck-' + deck + '-map');
			};

			var ival;
			var checkForImageReadiness = function() {
				if (ival) {
					$log.debug('image check already running');
					return;
				}
				var oldPromise = imageReady;
				ival = $interval(function() {
					imageReady =$q.defer();
					//$log.debug('checking for image readiness');
					if (scope.deck) {
						var deck = scope.deck;
						var image = getImage(deck);
						if (image && image.src) {
							//$log.debug('found image with src=' + image.src + ' and map element');
							//var attrs = mapElement.find('area');
							//$log.debug('found ' + attrs.length + ' attrs');
							$log.debug('image is visible and map is ready for scaling!');
							oldPromise.resolve(deck);
							imageReady.resolve(deck);
							$interval.cancel(ival);
							ival = null;
						} else {
							$log.warn('no image: ' + image + ' yet');
						}
					} else {
						$log.warn('no deck yet');
					}
				}, 100);
			};
			checkForImageReadiness();

			scope.$on('$destroy', function() {
				$interval.cancel(ival);
			});

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

				$log.info('scaleMap(' + deck + ')');

				var scale = getScale(deck);
				if (!scale) {
					$log.warn('scaleMap(): no scale!');
					return;
				}

				var map = angular.element('#deck-' + deck + '-map');

				if (scale && map.length > 0) {
					var areas = map[0].querySelectorAll('area');
					for (var i=0; i < areas.length; i++) {
						var el = angular.element(areas.item(i));

						var scaled = el.attr('scaled');
						if (scaled) {
							continue;
						}

						var coords = el.attr('coords');
						if (coords && !scaled) {
							coords = scaleCoordinates(coords, scale);
							el.attr('coords', coords);
							el.attr('scaled', true);
						} else {
							$log.warn('scaleMap: No coordinates on area!');
						}
					}
				} else {
					$log.warn('no map element found');
				}
			};

			var showMarker = function() {
				var wait = 600;

				var deck = scope.deck;
				var image  = angular.element('#deck-' + deck + '-image');
				if (image.length && image) {
					image = image[0];
					if (!image.src) {
						return;
					}
				} else {
					return;
				}

				if (!scope.showMarker) {
					return;
				}

				$log.info('showMarker(): deck=' + scope.deck + ', showMarker=' + scope.showMarker + ', delegate='+scope.scrollDelegate);

				var scale = getScale(deck);
				var mapEntry = angular.element('#deck-' + deck + '-map').find('area[id="' + scope.showMarker + '"]');

				if (scale && mapEntry.length && image) {
					var coords = mapEntry.attr('coords');
					if (coords) {
						coords = getCoordinates(coords);
						var bounds = getBounds(coords);
						$log.debug('bounding box: ' + angular.toJson(bounds));
						scope.dotStyle = {
							'background-color': 'red',
							top: image.offsetTop + (bounds.top + bounds.bottom) / 2,
							left: image.offsetLeft + (bounds.left + bounds.right) / 2
						};
						scope.$evalAsync(function() {
							var scrollto = Math.max(0, scope.dotStyle.top - 200);
							myScrollDelegate.$getByHandle(scope.scrollDelegate || 'amenity-deck').scrollTo(0, scrollto, true);
							scope.$broadcast('scroll.refreshComplete');
						});
						$timeout(function() {
						}, 0);
					} else {
						$log.warn('showMarker: No coordinates on area!');
					}
				}
			};

			var updateMap = function(deck) {
				deck = deck || scope.deck;
				if (!deck) {
					$log.warn('no deck yet!');
					return;
				}

				//scope.deckMap = getMap(deck);
				if (lowMemory) {
					scope.url = require('../decks/images/deck-' + deck + '-512.png');
				} else {
					scope.url = require('../decks/images/deck-' + deck + '-1024.png');
				}
				imageReady.promise.then(function(deck) {
					if (scope.showMarker) {
						$timeout(function() {
							scaleMap(deck);
							showMarker();
						}, 200);
					}
					/*
					$timeout(function() {
					}, 1000);
					$log.debug('deck ' + deck + ' url: ' + scope.url);
					*/
				});
			};

			updateMap();

			scope.$watchGroup(['deck', 'scrollDelegate', 'showMarker'], function(newValues, oldValues) {
				if (angular.toJson(newValues) !== angular.toJson(oldValues)) {
					$log.info('old values: ' + angular.toJson(oldValues));
					$log.info('new values: ' + angular.toJson(newValues));
					if (!newValues[0]) {
						myScrollDelegate.$getByHandle(newValues[1] || 'amenity-deck').scrollTo(0, 0, false);
					}
					$timeout(function() {
						checkForImageReadiness();
						updateMap(newValues[0]);
					});
				}
			});
		}
	};
});
