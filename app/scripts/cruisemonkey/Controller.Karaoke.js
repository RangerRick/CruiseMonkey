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
		'pasvaz.bindonce'
	])
	.factory('KaraokeService', ['$timeout', '$log', function($timeout, log) {
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
	.controller('CMKaraokeSearchCtrl', ['storage', '$rootScope', '$scope', '$state', 'KaraokeService', '$log', function(storage, $rootScope, $scope, $state, KaraokeService, log) {
		log.info('Initializing CMKaraokeSearchCtrl');
		$rootScope.headerTitle = 'Karaoke Search';
		$rootScope.leftButtons = $rootScope.getLeftButtons();
		$rootScope.rightButtons = [];

		KaraokeService.setScope($scope);
		KaraokeService.setSortFunction(sortByArtist);
		KaraokeService.setUpdateFunction(function() {
			var entries = [],
				artist, song, matched,
				i, j, s;

			if ($scope.searchString === undefined || !$scope.searchString) {
				for (i=0; i < karaokeList.length; i++) {
					artist = karaokeList[i].artist;
					for (j=0; j < karaokeList[i].songs.length; j++) {
						entries.push({
							'artist': artist,
							'song': karaokeList[i].songs[j]
						});
					}
				}
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

			console.debug('returning ' + entries.length + ' entries');
			return entries;
		});

		storage.bind($scope, 'searchString', {
			'storeName': 'cm.karaoke-search'
		});

		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};

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

		KaraokeService.initialize();
	}])
	;
}());
