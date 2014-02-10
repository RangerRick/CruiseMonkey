(function() {
	'use strict';

	/*global karaokeList: true*/

	var sortByArtist = function(a,b) {
		var aArtist = a.artist.toLowerCase(),
			bArtist = b.artist.toLowerCase();

		if (aArtist < bArtist) {
			return -1;
		} else if (aArtist > bArtist) {
			return 1;
		}
		return 0;
	};

	for (var i = 0; i < karaokeList.length; i++) {
		karaokeList[i].songs.sort();
	}

	angular.module('cruisemonkey.controllers.Karaoke', [
		'angularLocalStorage',
		'cruisemonkey.Logging',
		'pasvaz.bindonce'
	])
	.factory('KaraokeService', ['$timeout', 'LoggingService', function($timeout, log) {
		var scope = null,
			updateFunction = null,
			sortFunction = null,
			updating = false,
			delayTimeout = null;

		var doUpdate = function() {
			if (updating) {
				return;
			}

			log.debug('doUpdate: starting');
			updating = true;
			var entries = updateFunction();
			log.debug('doUpdate: matched ' + entries.length + ' entries');
			updating = false;
			scope.entries = entries;
			scope.$broadcast('scroll.resize');
			log.debug('doUpdate: finished');
		};

		var doUpdateDelayed = function(delay) {
			if (delayTimeout) {
				$timeout.cancel(delayTimeout);
			}
			delayTimeout = $timeout(function() {
				log.info('KaraokeService.doUpdateDelayed()');
				delayTimeout = null;
				doUpdate();
			}, delay || 500);
		};

		var initialize = function() {
			if (sortFunction) {
				karaokeList.sort(sortFunction);
			}
			doUpdate();
		};

		return {
			'initialize': initialize,
			'setScope': function(s) {
				scope = s;
			},
			'setUpdateFunction': function(callback) {
				updateFunction = callback;
			},
			'setSortFunction': function(callback) {
				sortFunction = callback;
			},
			'doUpdate': doUpdate,
			'doUpdateDelayed': doUpdateDelayed
		};
	}])
	.controller('CMKaraokeSearchCtrl', ['storage', '$rootScope', '$scope', '$state', 'KaraokeService', 'LoggingService', function(storage, $rootScope, $scope, $state, KaraokeService, log) {
		log.info('Initializing CMKaraokeSearchCtrl');
		$rootScope.title = 'Karaoke Search';
		$rootScope.leftButtons = [
			{
				'type': 'button-clear',
				'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
				tap: function(e) {
					$state.go('karaoke');
					return false;
				}
			}
		];
		$rootScope.rightButtons = [];

		var entryLimit = 50;

		KaraokeService.setScope($scope);
		KaraokeService.setSortFunction(sortByArtist);
		KaraokeService.setUpdateFunction(function() {
			var entries = [],
				artist, song, matched,
				i, j, s;

			if ($scope.searchString === undefined || !$scope.searchString) {
				return entries;
			}

			var searchFor = $scope.searchString.split(/\s+/);

			for (i=0; i < karaokeList.length; i++) {
				artist = karaokeList[i].artist;
				matched = true;
				for (s=0; s < searchFor.length; s++) {
					if (!artist.contains(searchFor[s])) {
						matched = false;
						break;
					}
				}
				if (matched) {
					for (j=0; j < karaokeList[i].songs.length; j++) {
						entries.push({
							'artist': artist,
							'song': karaokeList[i].songs[j]
						});
					}
				} else {
					for (j=0; j < karaokeList[i].songs.length; j++) {
						matched = true;
						song = karaokeList[i].songs[j];
						for (s=0; s < searchFor.length; s++) {
							if (!song.contains(searchFor[s])) {
								matched = false;
								break;
							}
						}
						if (matched) {
							entries.push({
								'artist': artist,
								'song': song
							});
						}
					}
				}
			}

			if (entries.length > entryLimit) {
				log.debug('Too many matches: ' + entries.length);
				var remainder = entries.length - 50;
				entries = entries.slice(0,50);
				entries.push(remainder);
			}

			return entries;
		});

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.karaoke-search'
		});

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};

		KaraokeService.initialize();
	}])
	.controller('CMKaraokePrefixListCtrl', ['$rootScope', '$scope', '$state', 'KaraokeService', 'LoggingService', function($rootScope, $scope, $state, KaraokeService, log) {
		log.info('Initializing CMKaraokePrefixListCtrl');
		$rootScope.title = 'Artists';
		$rootScope.leftButtons = [
			{
				'type': 'button-clear',
				'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
				tap: function(e) {
					$state.go('karaoke');
					return false;
				}
			}
		];
		$rootScope.rightButtons = [];

		KaraokeService.setScope($scope);
		KaraokeService.setSortFunction(sortByArtist);
		KaraokeService.setUpdateFunction(function() {
			var entries = [],
				previousChar = null,
				firstChar = null,
				artists,
				addEntry,
				i, j, obj;

			addEntry = function(entry) {
				/*jshint camelcase: false */
				firstChar = entry.artist.charAt(0).toUpperCase();
				if (firstChar !== previousChar) {
					//log.info('updateList: new prefix: ' + entry.artist);
					entries.push({
						prefix: firstChar,
						artist_count: 0
					});
					previousChar = firstChar;
				}
				entries[entries.length - 1].artist_count++;
			};
			
			for (i = 0; i < karaokeList.length; i++) {
				addEntry(karaokeList[i]);
			}

			return entries;
		});

		KaraokeService.initialize();
	}])
	.controller('CMKaraokeArtistListCtrl', ['storage', '$rootScope', '$scope', '$stateParams', '$state', '$location', 'KaraokeService', 'LoggingService', function(storage, $rootScope, $scope, $stateParams, $state, $location, KaraokeService, log) {
		log.info('Initializing CMKaraokeArtistListCtrl');
		
		var prefix = $stateParams.prefix;
		if (prefix) {
			prefix = prefix.toUpperCase();
		}

		$rootScope.title = 'Artists: ' + prefix;
		$rootScope.leftButtons = [
			{
				'type': 'button-clear',
				'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
				tap: function(e) {
					$state.go('karaoke-list');
					return false;
				}
			}
		];
		$rootScope.rightButtons = [];

		KaraokeService.setScope($scope);
		KaraokeService.setSortFunction(sortByArtist);
		KaraokeService.setUpdateFunction(function() {
			var entries = [], i, j, obj;

			if ((!$scope.searchString) || $scope.searchString === '') {
				for (i = 0; i < karaokeList.length; i++) {
					if (karaokeList[i].artist.charAt(0).toUpperCase() === prefix) {
						entries.push(karaokeList[i]);
					}
				}
				return entries;
			}

			for (i = 0; i < karaokeList.length; i++) {
				obj = karaokeList[i];
				if (obj.artist.charAt(0).toUpperCase() !== prefix) {
					continue; // skip if artist doesn't start with given prefix
				}

				if (obj.artist.contains($scope.searchString)) {
					entries.push(obj);
					continue; // next artist entry
				}
			}
			return entries;
		});

		$scope.go = function(entry) {
			var url = '/karaoke/by-artist/' + entry.artist;
			$location.url(url);
		};

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.karaoke-prefix.' + prefix
		});

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};
		KaraokeService.initialize();
	}])
	.controller('CMKaraokeArtistCtrl', ['storage', '$rootScope', '$scope', '$stateParams', '$state', 'KaraokeService', 'LoggingService', function(storage, $rootScope, $scope, $stateParams, $state, KaraokeService, log) {
		log.info('Initializing CMKaraokeArtistCtrl (' + $stateParams.artist + ')');
		$rootScope.title = $stateParams.artist;
		$scope.artist = $stateParams.artist;
		if ($stateParams.artist.length > 12) {
			$rootScope.title = $stateParams.artist.substring(0,12) + '...';
		}

		$rootScope.leftButtons = [
			{
				'type': 'button-clear',
				'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
				tap: function(e) {
					$state.go('karaoke-by-prefix', {
						prefix: $stateParams.artist.charAt(0).toUpperCase()
					});
					return false;
				}
			}
		];
		$rootScope.rightButtons = [];

		var songList = [];

		for (var i = 0; i < karaokeList.length; i++) {
			if (karaokeList[i].artist === $stateParams.artist) {
				songList = karaokeList[i].songs;
				break;
			}
		}

		KaraokeService.setScope($scope);
		KaraokeService.setSortFunction(null);
		KaraokeService.setUpdateFunction(function() {
			if ((!$scope.searchString) || $scope.searchString === '') {
				log.info('searchString is unset');
				return songList;
			}

			var entries = [], i;
			for (i = 0; i < songList.length; i++) {
				if (songList[i].contains($scope.searchString)) {
					entries.push(songList[i]);
					continue;
				}
			}
			return entries;
		});

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.karaoke.' + $stateParams.artist
		});

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};
		KaraokeService.initialize();
	}]);
}());
