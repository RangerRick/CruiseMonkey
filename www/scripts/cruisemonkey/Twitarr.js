(function() {
	'use strict';

	/*global isMobile: true*/
	/*global ionic: true*/

	angular.module('cruisemonkey.Twitarr', [
		'cruisemonkey.Settings',
		'angularLocalStorage'
	])
	.factory('Twitarr', ['$q', '$rootScope', '$timeout', '$interval', '$http', 'storage', 'config.background.interval', 'config.request.timeout', 'SettingsService', 'UserService', function($q, $rootScope, $timeout, $interval, $http, storage, backgroundInterval, requestTimeout, SettingsService, UserService) {
		console.log('Initializing Twit-arr API.');

		var scope = $rootScope.$new();
		storage.bind(scope, 'lastStatus', {
			'storeName': 'cruisemonkey.twitarr.status',
			'defaultValue': {
				'seamail_unread_count': 0,
				'unnoticed_mentions': 0,
				'unnoticed_alerts': 0,
				'unnoticed_announcements': 0
			}
		});

		var get = function(url) {
			var options = {
				method: 'GET',
				url: url,
				cache: false,
				timeout: requestTimeout,
				headers: {
					Accept: 'application/json'
				}
			};

			var user = UserService.get();
			if (user.loggedIn && user.key) {
				options.params = {
					key: user.key
				};
			}

			return $http(options);
		};

		var getStatus = function() {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/alerts/check';
			console.log('Twitarr.getStatus(): url=' + url);

			var deferred = $q.defer();
			get(url)
				.success(function(data) {
					if (data.status === 'ok') {
						deferred.resolve(data.user);
					} else {
						console.log('Twitarr.getStatus(): got a 200 response, but not OK.', data);
						deferred.reject();
					}
				}).error(function(data, status) {
					console.log('Twitarr.getStatus(): Failed: ' + status, data);
				});

			return deferred.promise;
		};

		var getStream = function(nextPage) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/stream';
			if (nextPage) {
				url += '?start=' + parseInt(nextPage) + '&older_posts=true';
			}

			var deferred = $q.defer();

			console.log('Twitarr.getStream(): url=' + url);
			get(url)
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

			get(url)
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

		var checkStatus = function() {
			var user = UserService.get();
			if (user.loggedIn && user.key) {
				console.log('Twitarr: doing status check');
				getStatus().then(function(result) {
					if (result.seamail_unread_count !== scope.lastStatus.seamail_unread_count) {
						$rootScope.$broadcast('cruisemonkey.notify.newSeamail', result.seamail_unread_count);
					} else if (result.unnoticed_mentions !== scope.lastStatus.unnoticed_mentions) {
						$rootScope.$broadcast('cruisemonkey.notify.newMentions', result.unnoticed_mentions);
					} else if (result.unnoticed_alerts !== scope.lastStatus.unnoticed_alerts) {
						$rootScope.$broadcast('cruisemonkey.notify.newAlerts', result.unnoticed_alerts);
					} else if (result.unnoticed_announcements !== scope.lastStatus.unnoticed_announcements) {
						$rootScope.$broadcast('cruisemonkey.notify.newAnnouncements', result.unnoticed_announcements);
					}
					scope.lastStatus = result;
				});
			} else {
				console.log('Twitarr: skipping status check, user is not logged in');
			}
		};

		var statusCheck;
		$interval(function() {
			checkStatus();
		}, backgroundInterval);
		checkStatus();

		$rootScope.$on('$destroy', function() {
			if (statusCheck) {
				$interval.cancel(statusCheck);
			}
		});

		return {
			getStream: getStream,
			getUserInfo: getUserInfo,
		};
	}]);
}());
