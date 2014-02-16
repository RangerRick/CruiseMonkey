(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Photos', [
		'ionic',
		'cruisemonkey.Cordova',
		'cruisemonkey.Logging',
		'cruisemonkey.Settings'
	])
	.factory('PhotoService', ['$q', '$rootScope', '$http', '$timeout', 'SettingsService', 'CordovaService', 'LoggingService', function($q, $rootScope, $http, $timeout, settings, cordova, log) {
		var finished, nextPage, nextEntry, entries;

		var reset = function() {
			finished = false;
			nextPage = 0;
			nextEntry = 0;
			entries = [];
		};
		reset();

		var _gettingMore;
		var getMoreEntries = function() {
			if (_gettingMore) {
				return _gettingMore;
			}

			var deferred = $q.defer();
			_gettingMore = deferred.promise;
			_gettingMore['finally'](function() {
				_gettingMore = null;
			});

			var url = settings.getTwitarrRoot() + 'api/v2/photos/list?page=' + nextPage;
			$http.get(url, {
				'headers': {
					'Accept': 'application/json'
				}
			})
			.success(function(data, status, headers, config) {
				console.log('PhotoService.getNextPhoto(): data=',data);
				console.log('PhotoService.getNextPhoto(): status=',status);
				if (data && data.status === 'ok') {
					if (data.photos.length > 0) {
						angular.forEach(data.photos, function(entry, index) {
							entry.url = settings.getTwitarrRoot() + 'img/photos/md_' + entry.photo;
						});
						nextPage++;
						console.log('photos=',data.photos);
						deferred.resolve(data.photos);
					} else {
						deferred.reject(data);
					}
				} else {
					log.warn('Successful response, but status was ' + data.status);
					deferred.reject(data);
				}
			})
			.error(function(data, status, headers, config) {
				log.warn('Bad response: ' + data);
				console.log('status=',status);
				deferred.reject(data);
			});
			
			return _gettingMore;
		};

		var _getNextPhoto = function(deferred) {
			if (finished) {
				$timeout(function() {
					deferred.reject('finished');
				});
			} else if (entries[nextEntry]) {
				$timeout(function() {
					deferred.resolve(entries[nextEntry++]);
				});
			} else {
				getMoreEntries().then(function(entries) {
					if (entries.length > 0) {
						angular.forEach(entries, function(entry, index) {
							entries.push(entry);
						});
						deferred.resolve(entries[nextEntry++]);
					} else {
						finished = true;
						deferred.reject('finished');
					}
				}, function(err) {
					finished = true;
					deferred.reject('finished');
				});
			}
		};

		var _getNext;
		var getNextPhoto = function() {
			if (_getNext) {
				_getNext = $q.defer();
				$q.when(_getNext).then(function() {
					_getNextPhoto(_getNext);
				});
				return _getNext.promise;
			} else {
				_getNext = $q.defer();
				_getNextPhoto(_getNext);
				return _getNext.promise;
			}
		};

		return {
			reset: reset,
			getMore: getMoreEntries,
			getNextPhoto: getNextPhoto
		};
	}])
	.controller('CMPhotoCtrl', ['$rootScope', '$scope', '$ionicSlideBoxDelegate', 'LoggingService', 'PhotoService', function($rootScope, $scope, $ionicSlideBoxDelegate, log, photos) {
		log.info('Initializing CMPhotoCtrl');
		$rootScope.headerTitle = "Twit-Arr Pics";
		$rootScope.leftButtons = [];
		$rootScope.rightButtons = [];

		$scope.finished = false;
		$scope.entries = [];
		$scope.currentSlide = 0;

		var doneFunc = function() {
			$ionicSlideBoxDelegate.update();
			$scope.$broadcast('slideBox.setSlide', $scope.currentSlide);
			$scope.$broadcast('scroll.refreshComplete');
		};

		var previous = function() {
			$scope.$broadcast('slideBox.prevSlide');
		};
		var next = function() {
			$scope.$broadcast('slideBox.nextSlide');
		};

		var keyListener = function(ev) {
			if (ev.keyCode === 37) {
				previous();
				return false;
			} else if (ev.keyCode === 39) {
				next();
				return false;
			}
			return true;
		};

		$scope.reload = function() {
			log.debug('CMPhotoCtrl.reload()');
			$scope.finished = false;
			$scope.entries = [];
			photos.reset();
			$scope.currentSlide = 0;

			/*
			function() {
				$scope.$broadcast('scroll.refreshComplete');
			}
			*/

			$scope.loadMore(doneFunc);
		};

		$scope.loadMore = function(done) {
			if ($scope.finished) {
				log.info('CMPhotoCtrl.loadMore(): finished.');
				done();
				return;
			}

			photos.getMore().then(function(entries) {
				angular.forEach(entries, function(entry, index) {
					log.debug('CMPhotoCtrl.loadMore(): got new entry: ' + entry.url);
					this.push(entry);
				}, $scope.entries);
				if (!$scope.currentEntry) {
					$scope.currentEntry = $scope.entries[$scope.currentSlide];
				}
				done();
			}, function() {
				$scope.finished = true;
				done();
			});
		};

		$scope.slideChanged = function(index) {
			$scope.currentSlide = index;
			$scope.currentEntry = $scope.entries[index];
			if (index === $scope.entries.length - 1 || index === $scope.entries.length - 2) {
				$scope.loadMore(doneFunc);
			}
		};

		document.addEventListener('keydown', keyListener, true);
		$scope.$on('$destroy', function() {
			document.removeEventListener('keydown', keyListener, true);
		});

		$scope.loadMore(doneFunc);

	}]);
}());
