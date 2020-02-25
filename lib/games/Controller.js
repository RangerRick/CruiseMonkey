require('../data/DB');

require('ionic-filter-bar');

angular.module('cruisemonkey.controllers.Games', [
	'jett.ionic.filter.bar',
	'cruisemonkey.DB',
])
.controller('CMGameSearchCtrl', ($http, $ionicFilterBar, $ionicLoading, $ionicScrollDelegate, $log, $scope, kv) => {
	$log.info('Initializing CMGameSearchCtrl');

	kv.get('cruisemonkey.game-search').then((s) => {
		$scope.searchString = s;
	});

	const updateEntries = () => {
		$http.get('data/JoCoGamesCatalog.txt').then(function onSuccess(response) {
			const entries = response.data.split(/\r?\n/).map((line) => {
				const [title, count] = line.split('\t');
				return {
					title,
					count: parseInt(count, 10),
				};
			});
			$scope.entries = entries;
			$ionicLoading.hide();
		}, function onError(response) {
			$log.error('Failed to get game list: ' + response.status);
			$log.debug('data: ' + angular.toJson(response.data));
			$ionicLoading.hide();
		});
	};
	updateEntries();

	$scope.scrollTop = () => {
		const delegate = $ionicScrollDelegate.$getByHandle('game-scroll');
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
