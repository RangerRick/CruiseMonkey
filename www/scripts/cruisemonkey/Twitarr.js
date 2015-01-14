(function() {
	'use strict';

	/*global isMobile: true*/
	/*global ionic: true*/
	/*global moment: true*/

	angular.module('cruisemonkey.Twitarr', [
		'cruisemonkey.Settings',
		'cruisemonkey.Config',
		'angularLocalStorage'
	])
	.factory('Twitarr', ['$q', '$rootScope', '$timeout', '$interval', '$http', 'storage', 'config.background.interval', 'config.request.timeout', 'config.twitarr.enable-cachebusting', 'SettingsService', 'UserService', function($q, $rootScope, $timeout, $interval, $http, storage, backgroundInterval, requestTimeout, enableCachebusting, SettingsService, UserService) {
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

		var call = function(type, url, params, data) {
			var options = {
				method: type,
				url: url,
				cache: false,
				timeout: requestTimeout,
				headers: {
					Accept: 'application/json'
				}
			};

			var user = UserService.get();

			if (!params) {
				params = {};
			}

			if (type === 'POST') {
				if (!data.key) {
					if (user.loggedIn && user.key) {
						data.key = user.key;
					}
				}
			} else {
				if (!params.key) {
					if (user.loggedIn && user.key) {
						params.key = user.key;
					}
				}
			}

			if (type === 'GET' && enableCachebusting) {
				params._x = moment().valueOf();
			}
			options.params = angular.extend({}, params);

			if (data) {
				//options.data = angular.toJson(data);
				options.data = data;
			}

			console.log('Making HTTP call with options:',options);
			return $http(options);
		};

		var get = function(url, params) {
			return call('GET', url, params);
		};

		var del = function(url, params) {
			return call('DELETE', url, params);
		};

		var post = function(url, data) {
			return call('POST', url, {}, data);
		};

		var getAlerts = function(shouldReset) {
			shouldReset = shouldReset? true:false;
			var url = SettingsService.getTwitarrRoot() + 'api/v2/alerts';
			console.log('Twitarr.getAlerts(' + shouldReset + '): url=' + url);

			var deferred = $q.defer();

			get(url, {'no_reset':!shouldReset})
				.success(function(data) {
					if (data.unread_seamail) {
						for (var i=0; i < data.unread_seamail.length; i++) {
							data.unread_seamail[i].timestamp = moment(data.unread_seamail[i].timestamp);
						}
					}
					deferred.resolve(data);
				}).error(function(data, status) {
					console.log('Twitarr.getAlerts(): Failed: ' + status, data);
					deferred.reject([data, status]);
				});

			return deferred.promise;
		};

		var getStatus = function() {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/alerts/check';
			console.log('Twitarr.getStatus(): url=' + url);

			var deferred = $q.defer();

			var user = UserService.get();
			if (user.loggedIn) {
				get(url)
					.success(function(data) {
						if (data.status === 'ok') {
							deferred.resolve(data.user);
						} else {
							console.log('Twitarr.getStatus(): got a 200 response, but not OK.', data);
							deferred.reject([data]);
						}
					}).error(function(data, status) {
						console.log('Twitarr.getStatus(): Failed: ' + status, data);
						deferred.reject([data, status]);
					});
			} else {
				deferred.reject(['Not logged in.']);
			}

			return deferred.promise;
		};

		var getSeamail = function() {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/seamail';
			var deferred = $q.defer();

			console.log('Twitarr.getSeamail(): url=' + url);
			get(url)
				.success(function(data) {
					if (data.seamail_meta) {
						for (var i=0; i < data.seamail_meta.length; i++) {
							data.seamail_meta[i].timestamp = moment(data.seamail_meta[i].timestamp);
						}
					}

					deferred.resolve(data);
				}).error(function(data, status, headers, config) {
					console.log('Failed getSeamail(): ' + status, data);
					deferred.reject([data, status]);
				});

			return deferred.promise;
		};

		var getSeamailMessages = function(id) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/seamail/' + id;
			var deferred = $q.defer();

			console.log('Twitarr.getSeamailMessages(): url=' + url);
			get(url)
				.success(function(data) {
					if (data.seamail && data.seamail.messages) {
						for (var i=0; i < data.seamail.messages.length; i++) {
							data.seamail.messages[i].timestamp = moment(data.seamail.messages[i].timestamp);
						}
					}
					deferred.resolve(data);
				}).error(function(data, status, headers, config) {
					console.log('Failed getSeamailMessages(): ' + status, data);
					deferred.reject([data, status]);
				});

			return deferred.promise;
		};

		var postSeamailMessage = function(id, text) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/seamail/' + id + '/new_message';
			var deferred = $q.defer();

			console.log('Twitarr.postSeamailMessage(): url=' + url + ', text=',text);
			post(url, { text: text })
				.success(function(data) {
					deferred.resolve(data);
				}).error(function(data, status) {
					console.log('Failed like(): ' + status, data);
					deferred.reject([data, status]);
				});

			return deferred.promise;
		};

		var like = function(tweetId) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/stream/' + tweetId + '/like';
			var deferred = $q.defer();

			console.log('Twitarr.like(): url=' + url);
			post(url)
				.success(function(data) {
					deferred.resolve(data);
				}).error(function(data, status, headers, config) {
					console.log('Failed like(): ' + status, data);
					deferred.reject([data, status]);
				});

			return deferred.promise;
		};

		var unlike = function(tweetId) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/stream/' + tweetId + '/like';
			var deferred = $q.defer();

			console.log('Twitarr.unlike(): url=' + url);
			del(url)
				.success(function(data) {
					deferred.resolve(data);
				}).error(function(data, status, headers, config) {
					console.log('Failed unlike(): ' + status, data);
					deferred.reject([data, status]);
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

		var sendSeamailNotification = function(seamail, count) {
			console.log('Twitarr: Sending seamail local notification for:',seamail);

			var options = {
				id: 'seamail-' + seamail.id,
				message: 'New Seamail: ' + seamail.subject,
				data: seamail,
			};
			if (count) {
				options.badge = count;
			}

			$rootScope.$broadcast('cruisemonkey.notify.local', options);
		};

		var sendSeamailNotifications = function() {
			var newSeamails = [], i;
			getSeamail().then(function(res) {
				if (res.seamail_meta) {
					for (i=0; i < res.seamail_meta.length; i++) {
						if (res.seamail_meta[i].is_unread) {
							newSeamails.push(res.seamail_meta[i]);
						}
					}
				}

				for (i=0; i < newSeamails.length; i++) {
					sendSeamailNotification(res.seamail_meta[i], newSeamails.length);
				}
			});
		};

		var checkStatus = function() {
			var user = UserService.get();
			if (user.loggedIn && user.key) {
				console.log('Twitarr: doing status check');
				getStatus().then(function(result) {
					if (result.seamail_unread_count !== scope.lastStatus.seamail_unread_count) {
						$rootScope.$broadcast('cruisemonkey.notify.newSeamail', result.seamail_unread_count);
						sendSeamailNotifications();
					} else if (result.unnoticed_mentions !== scope.lastStatus.unnoticed_mentions) {
						$rootScope.$broadcast('cruisemonkey.notify.newMentions', result.unnoticed_mentions);
					/*
					} else if (result.unnoticed_alerts !== scope.lastStatus.unnoticed_alerts) {
						$rootScope.$broadcast('cruisemonkey.notify.newAlerts', result.unnoticed_alerts);
					*/
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
			getStatus: getStatus,
			getAlerts: getAlerts,
			getSeamail: getSeamail,
			getSeamailMessages: getSeamailMessages,
			postSeamailMessage: postSeamailMessage,
			like: like,
			unlike: unlike,
		};
	}]);
}());
