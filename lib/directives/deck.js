require('../cordova/Initializer');
require('../decks/Service');

const deckTemplate = require('./deck.html');

angular.module('cruisemonkey.directives.deck', [
	'cruisemonkey.Decks',
	'cruisemonkey.Initializer'
])
.service('myScrollDelegate', ($ionicScrollDelegate) => {
	const custom = {
		$getByHandle: (name) => {
			const instances = $ionicScrollDelegate.$getByHandle(name)._instances;
			return instances.filter((element) => {
				return element['$$delegateHandle'] === name;
			})[0];
		}
	};

	/*
	const standard = {
		$getByHandle: (name) => {
			return $ionicScrollDelegate.$getByHandle(name);
		}
	};
	return standard;
	*/

	return custom;
})
.directive('cmDeck', ($interval, $log, $q, $sanitize, $timeout, Cordova, myScrollDelegate) => {
	$log.info('cmDeck Initializing.');

	let lowMemory = true;
	Cordova.systemMemory().then((memory) => {
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
		link: (scope /*, el, attrs */) => {
			scope.lowMemory = lowMemory;

			let imageReady = $q.defer();

			const getImage = (deck) => {
				deck = deck || scope.deck;
				const image  = angular.element('#deck-' + deck + '-image');
				if (image.length) {
					return image[0];
				}
				return null;
			};

			/*
			const getMap = (deck) => {
				deck = deck || scope.deck;
				return maps[''+deck];
			};

			const getMapElement = (deck) => {
				deck = deck || scope.deck;
				return angular.element('#deck-' + deck + '-map');
			};
			*/

			let ival;
			const checkForImageReadiness = () => {
				if (ival) {
					$log.debug('image check already running');
					return;
				}
				const oldPromise = imageReady;
				ival = $interval(() => {
					imageReady =$q.defer();
					//$log.debug('checking for image readiness');
					if (scope.deck) {
						const deck = scope.deck;
						const image = getImage(deck);
						if (image && image.src) {
							//$log.debug('found image with src=' + image.src + ' and map element');
							//const attrs = mapElement.find('area');
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

			scope.$on('$destroy', () => {
				$interval.cancel(ival);
			});

			const getScale = (deck) => {
				let image  = angular.element('#deck-' + deck + '-image');

				if (image.length) {
					image = image[0];
				}

				if (image) {
					const naturalWidth  = image.naturalWidth,
						naturalHeight = image.naturalHeight,
						actualWidth   = image.width,
						actualHeight  = image.height;

					$log.debug('image size (natural): ' + naturalWidth + 'x' + naturalHeight);
					$log.debug('image size (actual): ' + actualWidth + 'x' + actualHeight);

					let scale = 1.0;
					if (naturalWidth === 512) {
						scale = 0.5;
					}
					return actualHeight / naturalHeight * scale;
				} else {
					return undefined;
				}
			};

			const getCoordinates = (coords) => {
				return coords.split(',').map((coord) => {
					return parseInt(coord, 10);
				});
			}

			const scaleCoordinates = (coords, scale) => {
				return getCoordinates(coords).map((coord) => {
					return coord * scale;
				});
			};

			const getBounds = (coords) => {
				const bounds = {
					left: Number.MAX_VALUE,
					right: Number.MIN_VALUE,
					top: Number.MAX_VALUE,
					bottom: Number.MIN_VALUE
				};
				for (let i=0, coord; i < coords.length; i++) {
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

			const scaleMap = (deck) => {
				if (!deck) {
					$log.warn('scaleMap: no deck!');
					return;
				}

				$log.info('scaleMap(' + deck + ')');

				const scale = getScale(deck);
				if (!scale) {
					$log.warn('scaleMap(): no scale!');
					return;
				}

				const map = angular.element('#deck-' + deck + '-map');

				if (scale && map.length > 0) {
					const areas = map[0].querySelectorAll('area');
					for (let i=0; i < areas.length; i++) {
						const el = angular.element(areas.item(i));

						const scaled = el.attr('scaled');
						if (scaled) {
							continue;
						}

						let coords = el.attr('coords');
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

			const showMarker = () => {
				// const wait = 600;

				const deck = scope.deck;
				let image  = angular.element('#deck-' + deck + '-image');
				if (image && image.length) {
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

				const scale = getScale(deck);
				const mapEntry = angular.element('#deck-' + deck + '-map').find('area[id="' + scope.showMarker + '"]');

				if (scale && mapEntry.length && image) {
					let coords = mapEntry.attr('coords');
					if (coords) {
						coords = getCoordinates(coords);
						const bounds = getBounds(coords);
						$log.debug('bounding box: ' + angular.toJson(bounds));
						scope.dotStyle = {
							'background-color': 'red',
							top: image.offsetTop + (bounds.top + bounds.bottom) / 2,
							left: image.offsetLeft + (bounds.left + bounds.right) / 2
						};
						scope.$evalAsync(() => {
							const scrollto = Math.max(0, scope.dotStyle.top - 200);
							myScrollDelegate.$getByHandle(scope.scrollDelegate || 'amenity-deck').scrollTo(0, scrollto, true);
							scope.$broadcast('scroll.refreshComplete');
						});
						$timeout(() => { // eslint-disable-line @typescript-eslint/no-empty-function
							// force-trigger a redraw
						}, 0);
					} else {
						$log.warn('showMarker: No coordinates on area!');
					}
				}
			};

			const updateMap = (deck) => {
				deck = deck || scope.deck;
				if (!deck) {
					$log.warn('no deck yet!');
					return;
				}

				console.log('deck href=', window.location.href);
				//scope.deckMap = getMap(deck);
				if (lowMemory) {
					scope.url = $sanitize(require('../decks/images/deck-' + deck + '-512.png').default);
				} else {
					scope.url = $sanitize(require('../decks/images/deck-' + deck + '-1024.png').default);
				}
				console.log('deck url=', scope.url);
				console.log('everything=', angular.toJson($('body')));
				imageReady.promise.then((deck) => {
					if (scope.showMarker) {
						$timeout(() => {
							scaleMap(deck);
							showMarker();
						}, 200);
					}
					/*
					$timeout(() => {
					}, 1000);
					$log.debug('deck ' + deck + ' url: ' + scope.url);
					*/
				});
			};

			updateMap();

			scope.$watchGroup(['deck', 'scrollDelegate', 'showMarker'], (newValues, oldValues) => {
				if (angular.toJson(newValues) !== angular.toJson(oldValues)) {
					$log.info('old values: ' + angular.toJson(oldValues));
					$log.info('new values: ' + angular.toJson(newValues));
					if (!newValues[0]) {
						myScrollDelegate.$getByHandle(newValues[1] || 'amenity-deck').scrollTo(0, 0, false);
					}
					$timeout(() => {
						checkForImageReadiness();
						updateMap(newValues[0]);
					});
				}
			});
		}
	};
});
