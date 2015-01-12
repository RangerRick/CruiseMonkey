(function() {
	'use strict';

	/*global isMobile: true*/
	/*global ionic: true*/

	angular.module('cruisemonkey.Twitarr', [
		'cruisemonkey.Settings'
	])
	.factory('Twitarr', ['$q', '$rootScope', '$timeout', '$http', 'SettingsService', function($q, $rootScope, $timeout, $http, SettingsService) {
		console.log('Initializing Twit-arr API.');

		var getStream = function(nextPage) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/stream';
			if (nextPage) {
				url += '?start=' + parseInt(nextPage) + '&older_posts=true';
			}

			var deferred = $q.defer();

			console.log('Twitarr.getStream(): url=' + url);
			$http.get(url)
				.success(function(data) {
					deferred.resolve(data);
				}).error(function(data, status, headers, config) {
					console.log('Failed getStream(): ' + status, data);
					deferred.reject([data, status]);
				});

			return deferred.promise;
		};

		var getUserInfo = function(username) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/user/view/' + username;
			var deferred = $q.defer();

			$http.get(url)
				.success(function(data) {
					if (data.user) {
						deferred.resolve(data.user);
					} else {
						deferred.resolve(undefined);
					}
				}).error(function(data, status) {
					console.log('Failed getUserInfo(): ' + status, data);
					deferred.reject(data);
				});
			return deferred.promise;
		};

		return {
			getStream: getStream,
			getUserInfo: getUserInfo,
		};
	}]);
}());
