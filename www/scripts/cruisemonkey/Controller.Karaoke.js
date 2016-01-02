(function() {
	'use strict';

	/*global ionic: true*/
	/*global moment: true*/

	var spaces = /\s+/;
	var matchSong = function(artist, song, searchString) {
		var searchFor = searchString.split(spaces), match, s;

		match = true;
		for (s=0; s < searchFor.length; s++) {
			if (artist.contains(searchFor[s])) {
				continue;
			} else if (song.contains(searchFor[s])) {
				continue;
			} else {
				match = false;
				break;
			}
		}
		return match;
	};

	var searchFilter = function(karaokeList, searchString) {
		var entries = [],
			artist, song, matched,
			i, j, s;

		if (!karaokeList) {
			karaokeList = [];
		}

		if (searchString === undefined || !searchString) {
			return karaokeList;
		}

		var searchFor = searchString.split(spaces), match;

		for (i=0; i < karaokeList.length; i++) {
			if (matchSong(karaokeList[i][1], karaokeList[i][2], searchString)) {
				entries.push(karaokeList[i]);
			}
		}

		//console.log('returning ' + entries.length + ' entries');
		return entries;
	};

	angular.module('cruisemonkey.controllers.Karaoke', [
		'jett.ionic.filter.bar',
		'cruisemonkey.DB',
	])
	.filter('karaokeFilter', function() {
		return searchFilter;
	})
	.controller('CMKaraokeSearchCtrl', function($q, $scope, $http, $timeout, $interval, $window, $ionicFilterBar, $ionicLoading, $ionicScrollDelegate, _database, Cordova, kv, SettingsService) {
		console.log('Initializing CMKaraokeSearchCtrl');

		kv.get('cruisemonkey.karaoke-search').then(function(s) {
			$scope.searchString = s;
		});

		var updateSearchString = function() {
			if ($scope.searchString === undefined) {
				return kv.remove('cruisemonkey.karaoke-search');
			} else {
				return kv.set('cruisemonkey.karaoke-search', $scope.searchString);
			}
		};

		var sortSongs = function(a, b) {
			var comp = a.artist.localeCompare(b.artist);
			if (comp === 0) {
				return a.song.localeCompare(b.song);
			} else {
				return comp;
			}
		};

		var db = _database.get('karaoke');

		var updateEntries = function() {
			$http.get('scripts/cruisemonkey/karaoke-list.js').success(function(data, status, headers, config) {
				if ($scope.searchString && $scope.searchString.trim() !== '') {
					var searchString = $scope.searchString.toLowerCase(), entries = [];
					for (var i=0; i < data.length; i++) {
						if (data[i][1].toLowerCase().contains(searchString)) {
							entries.push(data[i]);
						} else if (data[i][2].toLowerCase().contains(searchString)) {
							entries.push(data[i]);
						}
					}
					$scope.entries = entries;
					$ionicLoading.hide();
				} else {
					$scope.entries = data;
					$ionicLoading.hide();
				}
			}).error(function(data, status, headers, config) {
				console.log('Failed to get karaoke list: ' + status, data);
				$ionicLoading.hide();
			});
		};

		$scope.onSearchUpdated = function(searchString) {
			updateSearchString();
			updateEntries();
			var delegate = $ionicScrollDelegate.$getByHandle('karaoke-scroll');
			if (delegate && delegate.getScrollPosition().top !== 0) {
				delegate.scrollTop(false);
			}
		};

		$scope.scrollTop = function() {
			var delegate = $ionicScrollDelegate.$getByHandle('karaoke-scroll');
			delegate.scrollTop(true);
		};

		var filterBarInstance;
		$scope.showFilterBar = function() {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.entries,
				update: function (filteredItems, filterText) {
					$scope.entries = filteredItems;
					if (filterText) {
						console.log(filterText);
					}
				}
			});
		};

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			$ionicLoading.show({
				template: 'Creating Karaoke index. This may take a minute...',
				hideOnStateChange: true,
			});
			updateEntries();
		});

		$scope.$on('$ionicView.afterLeave', function(ev, info) {
			console.log('Karaoke: destroying karaoke list');
			$scope.entries = [];
		});
	})
	;
}());
