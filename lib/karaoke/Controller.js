(function() {
	'use strict';

	var angular = require('angular'),
		moment = require('moment');

	require('moment-timezone');
	require('ionic-filter-bar');

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

	angular.module('cruisemonkey.controllers.Karaoke', [
		'jett.ionic.filter.bar',
		'cruisemonkey.DB'
	])
	.controller('CMKaraokeSearchCtrl', function($http, $interval, $ionicFilterBar, $ionicLoading, $ionicScrollDelegate, $log, $q, $scope, $timeout, $window, Cordova, kv, SettingsService) {
		$log.info('Initializing CMKaraokeSearchCtrl');

		kv.get('cruisemonkey.karaoke-search').then(function(s) {
			$scope.searchString = s;
		});

		var sortSongs = function(a, b) {
			var comp = a.artist.localeCompare(b.artist);
			if (comp === 0) {
				return a.song.localeCompare(b.song);
			} else {
				return comp;
			}
		};

		var updateEntries = function() {
			$http.get('data/karaoke-list.js').success(function(data, status, headers, config) {
				if ($scope.searchString && $scope.searchString.trim() !== '') {
					var searchString = $scope.searchString.toLowerCase(), entries = [];
					for (var i=0, len=data.length, entry; i < len; i++) {
						entry  = data[i];
						if (entry[1].toLowerCase().contains(searchString)) {
							entries.push(entry);
						} else if (entry[2].toLowerCase().contains(searchString)) {
							entries.push(entry);
						}
					}
					$scope.entries = entries;
					$ionicLoading.hide();
				} else {
					$scope.entries = data;
					$ionicLoading.hide();
				}
			}).error(function(data, status, headers, config) {
				$log.error('Failed to get karaoke list: ' + status);
				$log.debug('data: ' + angular.toJson(data));
				$ionicLoading.hide();
			});
		};
		updateEntries();

		$scope.scrollTop = function() {
			var delegate = $ionicScrollDelegate.$getByHandle('karaoke-scroll');
			delegate.scrollTop(true);
		};

		var filterBarInstance;
		$scope.showFilterBar = function() {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.entries,
				debounce: true,
				update: function (filteredItems, filterText) {
					$scope.searchString = filterText;
					$scope.entries = filteredItems;
				}
			});
		};
	})
	;
}());
