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

			var searchFor = searchString.split(/\s+/), match;

			for (i=0; i < karaokeList.length; i++) {
				match = true;
				for (s=0; s < searchFor.length; s++) {
					if (karaokeList[i][1].contains(searchFor[s])) {
						continue;
					} else if (karaokeList[i][2].contains(searchFor[s])) {
						continue;
					} else {
						match = false;
						break;
					}
				}
				if (match) {
					entries.push(karaokeList[i]);
				}
			}

			//console.log('returning ' + entries.length + ' entries');
			return entries;
		};
	})
	.controller('CMKaraokeSearchCtrl', ['storage', '$scope', '$http', '$ionicScrollDelegate', function(storage, $scope, $http, $ionicScrollDelegate) {
		console.log('Initializing CMKaraokeSearchCtrl');

		storage.bind($scope, 'searchString', {
			'storeName': 'cruisemonkey.karaoke-search'
		});

		$scope.entries = [];

		$scope.onSearchChanged = function(searchString) {
			var delegate = $ionicScrollDelegate.$getByHandle('karaoke-scroll');
			if (delegate.getScrollPosition().top != 0) {
				delegate.scrollTop(false);
			}
		};

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
	}])
	;
}());
