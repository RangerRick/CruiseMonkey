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
	.controller('CMKaraokePrefixListCtrl', ['storage', '$rootScope', '$scope', '$stateParams', 'KaraokeService', 'LoggingService', function(storage, $rootScope, $scope, $stateParams, KaraokeService, log) {
		log.info('Initializing CMKaraokePrefixListCtrl');
		$rootScope.title = 'Artists';
		$rootScope.leftButtons = [];
		$rootScope.rightButtons = [];

		var search = $stateParams.search;

		$scope.artistText = function(artist) {
			return artist.replace(/\s+/g, '&nbsp;');
		};

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
				firstChar = entry.artist.charAt(0).toUpperCase();
				if (firstChar !== previousChar) {
					//log.info('updateList: new prefix: ' + entry.artist);
					entries.push({
						prefix: firstChar,
						artists: []
					});
					previousChar = firstChar;
				}
				entries[entries.length - 1].artists.push(entry.artist);
			};
			
			var coalesceArtists = function(e) {
				var ret = [], entry;
				for (i = 0; i < e.length; i++) {
					entry = {
						prefix: e[i].prefix
					};
					if (e[i].artists.length > 0) {
						if (e[i].artists.length > 1) {
							entry.artists = '<span class="artist">' + e[i].artists.slice(0,2).join('</span>, <span class="artist">') + '</span> &hellip;';
						} else {
							entry.artists = '<span class="artist">' + e[i].artists[0] + '</span>';
						}
					}
					ret.push(entry);
				}
				return ret;
			};

			if ((!$scope.searchString) || $scope.searchString === '') {
				log.info('searchString is unset');
				for (i = 0; i < karaokeList.length; i++) {
					addEntry(karaokeList[i]);
				}
				return coalesceArtists(entries);
			}

			for (i = 0; i < karaokeList.length; i++) {
				obj = karaokeList[i];
				if (obj.artist.contains($scope.searchString)) {
					addEntry(obj);
					continue;
				}
				for (j = 0; j < obj.songs.length; j++) {
					if (obj.songs[j].contains($scope.searchString)) {
						addEntry(obj);
						break;
					}
				}
			}
			return coalesceArtists(entries);
		});

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.karaoke.list'
		});
		if (search) {
			$scope.searchString = search;
		}

		$scope.getHref = function(entry) {
			var ret = '#/karaoke/by-prefix/' + entry.prefix;
			if ($scope.searchString) {
				var encoded = encodeURIComponent($scope.searchString);
				ret += '?search=' + encoded + '&prefixSearch=' + encoded;
			}
			return ret;
		};

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};

		KaraokeService.initialize();
	}])
	.controller('CMKaraokeArtistListCtrl', ['storage', '$rootScope', '$scope', '$stateParams', '$state', '$location', 'KaraokeService', 'LoggingService', function(storage, $rootScope, $scope, $stateParams, $state, $location, KaraokeService, log) {
		log.info('Initializing CMKaraokeArtistListCtrl');
		
		var prefix = $stateParams.prefix;
		if (prefix) {
			prefix = prefix.toUpperCase();
		}

		var search = $stateParams.search;
		var prefixSearch = $stateParams.prefixSearch;

		$rootScope.title = 'Artists: ' + prefix;
		$rootScope.leftButtons = [
			{
				'type': 'button-clear',
				'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
				tap: function(e) {
					$state.go('karaoke-list', {'search': prefixSearch});
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
				for (j = 0; j < obj.songs.length; j++) {
					if (obj.songs[j].contains($scope.searchString)) {
						entries.push(obj);
						break;
					}
				}
			}
			return entries;
		});

		$scope.go = function(entry) {
			var url = '/karaoke/by-artist/' + entry.artist;
			if ($scope.searchString) {
				url += '?artistSearch=' + encodeURIComponent($scope.searchString);
				url += '&prefixSearch=' + encodeURIComponent(prefixSearch);
				for (var s = 0; s < entry.songs.length; s++) {
					if (entry.songs[s].contains($scope.searchString)) {
						url += '&search=' + encodeURIComponent($scope.searchString);
						break;
					}
				}
			}
			$location.url(url);
		};

		$scope.searchString = search;
		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};
		KaraokeService.initialize();
	}])
	.controller('CMKaraokeArtistCtrl', ['storage', '$rootScope', '$scope', '$stateParams', '$state', 'KaraokeService', 'LoggingService', function(storage, $rootScope, $scope, $stateParams, $state, KaraokeService, log) {
		log.info('Initializing CMKaraokeArtistCtrl (' + $stateParams.artist + ')');
		$rootScope.title = $stateParams.artist;
		if ($stateParams.artist.length > 12) {
			$rootScope.title = $stateParams.artist.substring(0,12) + '...';
		}

		var search = $stateParams.search;
		var prefixSearch = $stateParams.prefixSearch;
		var artistSearch = $stateParams.artistSearch;

		$rootScope.leftButtons = [
			{
				'type': 'button-clear',
				'content': '<i class="icon icon-cm ion-arrow-left-b"></i>',
				tap: function(e) {
					$state.go('karaoke-by-prefix', {
						'prefix': $stateParams.artist.charAt(0).toUpperCase(),
						'search': artistSearch,
						'prefixSearch': prefixSearch
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
		if (search) {
			$scope.searchString = search;
		}

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};
		KaraokeService.initialize();
	}]);
}());
