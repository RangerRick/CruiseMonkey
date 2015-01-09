(function() {
	'use strict';

	var _karaokeList;

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

	angular.module('cruisemonkey.controllers.Karaoke', [
		'angularLocalStorage',
		'pasvaz.bindonce'
	])
	.filter('karaokeFilter', function() {
		return function(karaokeList, searchString) {
			var entries = [],
				artist, song, matched,
				i, j, s;

			if (searchString === undefined || !searchString) {
				//console.log('filter('+searchString+'): no search string, returning full list');
				return karaokeList;
			}

			var searchFor = searchString.split(/\s+/);

			for (i=0; i < karaokeList.length; i++) {
				for (s=0; s < searchFor.length; s++) {
					if (karaokeList[i][1].contains(searchFor[s])) {
						entries.push(karaokeList[i]);
						//console.log('filter('+searchString+'): search ' + searchFor[s] + ' matched artist:', karaokeList[i]);
						break;
					} else if (karaokeList[i][2].contains(searchFor[s])) {
						entries.push(karaokeList[i]);
						//console.log('filter('+searchString+'): search ' + searchFor[s] + ' matched song:', karaokeList[i]);
						break;
					} else {

					}
				}
			}

			console.log('returning ' + entries.length + ' entries');
			return entries;
		};
	})
	.controller('CMKaraokeSearchCtrl', ['storage', '$rootScope', '$scope', '$http', '$state', function(storage, $rootScope, $scope, $http, $state) {
		console.log('Initializing CMKaraokeSearchCtrl');

		storage.bind($scope, 'searchString', {
			'storeName': 'cruisemonkey.karaoke-search'
		});

		$scope.entries = [];

		$scope.$on('$ionicView.loaded', function(ev, info) {
			$http.get('scripts/cruisemonkey/karaoke-list.js').success(function(data, status, headers, config) {
				var id=1, i, j, entries = [];

				data.sort(sortByArtist);
				for (i=0; i < data.length; i++) {
					data[i].songs.sort();
					for (j=0; j < data[i].songs.length; j++) {
						entries.push([id++, data[i].artist, data[i].songs[j]]);
					}
				}

				//console.log('entries=',entries);
				$scope.entries = entries;
			}).error(function(data, status, headers, config) {
				console.log('Failed to get karaoke list: ' + status, data);
			});
		});

		/*
		KaraokeService.setScope($scope);
		KaraokeService.setSortFunction(sortByArtist);
		KaraokeService.setUpdateFunction();
		*/

		/*
		$scope.searchUpdated = function(searchString) {
			$scope.searchString = searchString;
			KaraokeService.doUpdateDelayed();
		};

		$scope.clearSearchString = function() {
			console.log('clear search string');
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

		$scope.$on('$destroy', function() {
			KaraokeService.reset();
		});

		KaraokeService.initialize();
		*/
	}])
	;
}());
