require('../data/DB');

require('ionic-filter-bar');

/*
const spaces = /\s+/;
const matchSong = (artist, song, searchString) => {
	const searchFor = searchString.split(spaces);
	let match, s;

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
*/

angular.module('cruisemonkey.controllers.Karaoke', [
	'jett.ionic.filter.bar',
	'cruisemonkey.DB',
])
.controller('CMKaraokeSearchCtrl', ($http, $ionicFilterBar, $ionicLoading, $ionicScrollDelegate, $log, $scope, kv) => {
	$log.info('Initializing CMKaraokeSearchCtrl');

	const metadataTypes = {
		M: 'MIDI',
		VR: 'Reduced Vocals',
		Bowieoke: 'All-Bowie Karaoke',
		'(No Lyrics)': 'Missing Lyrics Display',
	};

	kv.get('cruisemonkey.karaoke-search').then((s) => {
		$scope.searchString = s;
	});

	const updateEntries = () => {
		$http.get('data/JoCoKaraokeSongCatalog.txt').then(function onSuccess(response) {
			const entries = response.data.split(/\r?\n/).map((line) => {
				const [title, artist, metadata] = line.split('\t');
				return {
					title,
					artist,
					metadata: metadataTypes[metadata],
				};
			});
			$scope.entries = entries;
			$ionicLoading.hide();
		}, function onError(response) {
			$log.error('Failed to get karaoke list: ' + response.status);
			$log.debug('data: ' + angular.toJson(response.data));
			$ionicLoading.hide();
		});
	};
	updateEntries();

	$scope.scrollTop = () => {
		const delegate = $ionicScrollDelegate.$getByHandle('karaoke-scroll');
		delegate.scrollTop(true);
	};

	$scope.showFilterBar = () => {
		$ionicFilterBar.show({
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
