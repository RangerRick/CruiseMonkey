(function() {
	'use strict';

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

		var updateEntries = function() {
			$http.get('data/karaoke-list.js').then(function onSuccess(response) {
				$scope.entries = response.data;
				$ionicLoading.hide();
			}, function onError(response) {
				$log.error('Failed to get karaoke list: ' + response.status);
				$log.debug('data: ' + angular.toJson(response.data));
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
