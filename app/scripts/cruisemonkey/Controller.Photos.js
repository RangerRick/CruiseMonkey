(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Photos', [
		'ionic',
		'cruisemonkey.Config',
		'cruisemonkey.Logging'
	])
	.controller('CMPhotoCtrl', ['$rootScope', '$scope', '$timeout', '$http', 'SettingsService', 'LoggingService', function($rootScope, $scope, $timeout, $http, SettingsService, log) {
		log.info('Initializing CMPhotoCtrl');
		$rootScope.title = "Twit-Arr Pics";

		$scope.finished = false;
		$scope.nextPage = 0;
		$scope.currentEntry = 0;
		$scope.entries = [];

		$scope.slideChanged = function(index) {
			$scope.currentEntry = index;
		};

		// https://twitarr.rylath.net/img/photos/md_09a99598-829c-4c52-ab7d-1e7368712254.jpg
		$scope.getPhotoUrl = function(entry) {
			/*
			log.info('getPhotoUrl: entries.length=' + $scope.entries.length + ', currentEntry=' + $scope.currentEntry);
			var end = $scope.entries.length - 1;
			// if we're near the end of the list, get more
			if (!$scope.finished && currentEntry === $scope.entries.length - 1) {
				$timeout(function() {
					$scope.loadMore();
				}, 500);
			}
			*/
			var url;
			if (true || $scope.entries[$scope.currentEntry] === entry) {
				url = SettingsService.getTwitarrRoot() + 'img/photos/md_' + entry.photo;
			} else {
				url = "";
			}
			log.info('getPhotoUrl(): ' + url);
			return url;
		};

		$scope.loadMore = function(done) {
			if ($scope.finished) {
				log.info('CMPhotoCtrl.loadMore(): finished.');
				done();
				return;
			}
			var url = SettingsService.getTwitarrRoot() + 'api/v1/photos/list?page=' + $scope.nextPage;
			log.info('CMPhotoCtrl.loadMore(): getting ' + url);
			$http.get(url, {
				'headers': {
					'Accept': 'application/json'
				}
			})
			.success(function(data, status, headers, config) {
				console.log('data=',data);
				console.log('status=',status);
				if (data && data.status === 'ok') {
					angular.forEach(data.photos, function(photo, index) {
						$scope.entries.push(photo);
					});
					$scope.nextPage++;
				} else {
					log.warn('Successful response, but status was ' + data.status);
					$scope.finished = true;
				}
				done();
			})
			.error(function(data, status, headers, config) {
				log.warn('Bad response: ' + data);
				done();
			});
		};
		
		$scope.loadMore(function() {});
	}]);
}());
