(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Karaoke', ['angularLocalStorage', 'cruisemonkey.Logging', 'QuickList'])
	.filter('artistFilter', ['LoggingService', function(log) {
		var lastSearch = [];
		return function(input, searchString) {
			var ret = [];
			log.debug('search filter change: ' + searchString);
			
			if (searchString === undefined || searchString === '') {
				for (var i = 0; i < input.length; i++) {
					ret.push(input[i].artist);
				}
				return ret;
			}

			angular.forEach(input, function(obj, index) {
				// if we're handed only the name or artist, search just it
				if (typeof obj === 'string' || obj instanceof String && obj.contains(searchString)) {
					ret.push(obj);
					return;
				}

				// otherwise, assume it's a json object with { artist: 'artist', songs: [] }
				if (obj.artist.contains(searchString)) {
					console.log('Matched artist: ' + obj.artist);
					ret.push(obj.artist);
					return;
				};
				for (var i = 0; i < obj.songs.length; i++) {
					if (obj.songs[i].contains(searchString)) {
						console.log('Matched song: ' + obj.songs[i]);
						ret.push(obj.artist);
						return;
					}
				}
				console.log(obj.artist + ': No match.');
			});
			log.debug('search filtered.');
			return ret;
		};
	}])
	.controller('CMKaraokeListCtrl', ['storage', '$rootScope', '$scope', '$timeout', 'LoggingService', function(storage, $rootScope, $scope, $timeout, log) {
		log.info('Initializing CMKaraokeListCtrl');
		$rootScope.title = 'Karaoke Artists';
		$rootScope.leftButtons = [];
		$rootScope.rightButtons = [];

		var sortByArtist = function(a,b) {
			if (a.artist < b.artist) {
				return -1;
			} else if (a.artist > b.artist) {
				return 1;
			}
			return 0;
		};

		karaokeList.sort(sortByArtist);

		var updating = false;
		var updateList = function() {
			if (updating) {
				return;
			}
			updating = true;
			log.info('updateList');
			var entries = [];

			if ($scope.searchString === undefined || $scope.searchString === '') {
				log.info('searchString is unset');
				for (var i = 0; i < karaokeList.length; i++) {
					entries.push(karaokeList[i].artist);
				}
				$scope.entries = entries;
				updating = false;
				return;
			}

			var i, j, obj;
			for (i = 0; i < karaokeList.length; i++) {
				obj = karaokeList[i];
				if (obj.artist.contains($scope.searchString)) {
					entries.push(obj.artist);
					continue;
				}
				for (j = 0; j < obj.songs.length; j++) {
					if (obj.songs[j].contains($scope.searchString)) {
						entries.push(obj.artist);
						break;
					}
				}
			}
			log.debug('search filtered.');

			updating = false;
			$scope.entries = entries;
		};

		var searchTimeout = null;
		$scope.$watch('searchString', function(newValue) {
			log.info('search string changed to ' + newValue);
			if (searchTimeout) {
				$timeout.cancel(searchTimeout);
			}
			searchTimeout = $timeout(function() {
				log.info('timeout');
				searchTimeout = null;
				updateList();
			});
		});

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
		};

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.karaoke.list'
		});
		log.debug('$scope.searchString: ' + $scope.searchString);

		updateList();
	}])
	.controller('CMKaraokeArtistCtrl', ['storage', '$rootScope', '$scope', '$timeout', '$stateParams', '$location', 'LoggingService', function(storage, $rootScope, $scope, $timeout, $stateParams, $location, log) {
		log.info('Initializing CMKaraokeArtistCtrl (' + $stateParams.artist + ')');
		$rootScope.title = $stateParams.artist;
		$rootScope.leftButtons = [
			{
				'type': 'button-clear',
				'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
				tap: function(e) {
					$location.path('/karaoke/list');
					return false;
				}
			}
		];
		$rootScope.rightButtons = [];

		var songList = [];
		$scope.songs = [];

		for (var i = 0; i < karaokeList.length; i++) {
			if (karaokeList[i].artist === $stateParams.artist) {
				karaokeList[i].songs.sort();
				songList = karaokeList[i].songs;
				break;
			}
		}

		var updating = false;
		var updateList = function() {
			if (updating) {
				return;
			}
			updating = true;
			log.info('updateList');

			if ($scope.searchString === undefined || $scope.searchString === '') {
				log.info('searchString is unset');
				$scope.songs = songList;
				updating = false;
				return;
			}

			var entries = [], i;
			for (i = 0; i < songList.length; i++) {
				if (songList[i].contains($scope.searchString)) {
					entries.push(songList[i]);
					continue;
				}
			}
			log.debug('search filtered.');

			updating = false;
			$scope.songs = entries;
		};

		var searchTimeout = null;
		$scope.$watch('searchString', function(newValue) {
			log.info('search string changed to ' + newValue);
			if (searchTimeout) {
				$timeout.cancel(searchTimeout);
			}
			searchTimeout = $timeout(function() {
				log.info('timeout');
				searchTimeout = null;
				updateList();
			});
		});

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
		};

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.karaoke.' + $stateParams.artist
		});
		log.debug('$scope.searchString: ' + $scope.searchString);

		updateList();
	}]);
}());
