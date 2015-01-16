(function() {
	'use strict';

	/* global isMobile: true */
	/* global ionic: true */
	/* global moment: true */
	/* global removeFromArray: true */
	/* global arrayIncludes: true */

	angular.module('cruisemonkey.Twitarr', [
		'cruisemonkey.Config',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'angularLocalStorage'
	])
	.factory('Twitarr', ['$q', '$rootScope', '$timeout', '$interval', '$http', 'storage', 'config.background.interval', 'config.request.timeout', 'config.twitarr.enable-cachebusting', 'LocalNotifications', 'SettingsService', 'UserService', function($q, $rootScope, $timeout, $interval, $http, storage, backgroundInterval, requestTimeout, enableCachebusting, LocalNotifications, SettingsService, UserService) {
		console.log('Initializing Twit-arr API.');

		var scope = $rootScope.$new();
		storage.bind(scope, 'lastStatus', {
			'storeName': 'cruisemonkey.twitarr.status',
			'defaultValue': {
				'mention_ids': [],
				'seamail_ids': [],
				'announcement_timestamps': []
			}
		});

		if (!scope.lastStatus.mention_ids) {
			scope.lastStatus.mention_ids = [];
		}
		if (!scope.lastStatus.seamail_ids) {
			scope.lastStatus.seamail_ids = [];
		}
		if (!scope.lastStatus.announcement_timestamps) {
			scope.lastStatus.announcement_timestamps = [];
		}
		if (scope.lastStatus.announcement_ids) {
			delete scope.lastStatus.announcement_ids;
		}

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
			params = angular.copy(params);
			data = angular.copy(data);

			if (type === 'POST' || type === 'DELETE') {
				/*
				if (!data.key) {
					if (user.loggedIn && user.key) {
						data.key = user.key;
					}
				}
				*/
				if (!params.key) {
					if (user.loggedIn && user.key) {
						params.key = user.key;
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

			if (options.params.cache) {
				// disable cachebusting for this request
				options.cache = true;
				delete options.params._x;
				delete options.params.cache;
			}

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

		var del = function(url, data) {
			return call('DELETE', url, {}, data);
		};

		var post = function(url, data) {
			return call('POST', url, {}, data);
		};

		var getAlerts = function(shouldReset) {
			shouldReset = shouldReset? true:false;
			var url = SettingsService.getTwitarrRoot() + 'api/v2/alerts';
			//console.log('Twitarr.getAlerts(' + shouldReset + '): url=' + url);

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

		var getAutocompleteUsers = function(searchPrefix) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/user/autocomplete/' + searchPrefix;
			var deferred = $q.defer();
			var username =UserService.get().username;

			if (searchPrefix && searchPrefix.trim() !== '') {
				get(url, {cache:true})
					.success(function(data) {
						removeFromArray(data.names, username);
						deferred.resolve(data.names);
					}).error(function(data, status) {
						console.log('Twitarr.getAutocompleteUsers(): Failed: ' + status, data);
						deferred.reject([data, status]);
					});
			} else {
				deferred.resolve([]);
			}

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

		var postSeamail = function(seamail) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/seamail';
			var deferred = $q.defer();

			console.log('Twitarr.postSeamail(): url=' + url + ', seamail=',seamail);
			post(url, seamail)
				.success(function(data) {
					if (data.errors && data.errors.length > 0) {
						console.log('Failed postSeamail(): ' + data.errors[0]);
						deferred.reject(data.errors);
					} else {
						deferred.resolve(data);
					}
				}).error(function(data, status) {
					console.log('Failed postSeamail(): ' + status, data);
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
					console.log('Failed postSeamailMessage(): ' + status, data);
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

		var postTweet = function(tweet) {
			var url = SettingsService.getTwitarrRoot() + 'api/v2/stream';

			var deferred = $q.defer();

			console.log('Twitarr.postTweet(): url=' + url);
			post(url, tweet)
				.success(function(data) {
					deferred.resolve(data);
				}).error(function(data, status, headers, config) {
					console.log('Failed postTweet(): ' + status, data);
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

		var sendMentionNotification = function(mention, count) {
			console.log('Twitarr: Sending mention local notification for:',mention);

			var options = {
				id: 'mention-' + mention.id,
				message: 'Mentioned by @' + mention.author + ': ' + mention.text.replace(/<\S[^><]*>/g, ''),
				data: mention,
			};
			if (count) {
				options.badge = count;
			}

			$rootScope.$broadcast('cruisemonkey.notify.local', options);
		};

		var sendAnnouncementNotification = function(announcement, count) {
			console.log('Twitarr: Sending announcement local notification for:',announcement);

			var options = {
				id: 'announcement-' + announcement.timestamp.valueOf(),
				message: 'New Announcement: ' + announcement.text,
				data: announcement,
			};
			if (count) {
				options.badge = count;
			}

			$rootScope.$broadcast('cruisemonkey.notify.local', options);
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
			var deferred = $q.defer();

			var user = UserService.get();
			if (user.loggedIn && user.key) {
				//console.log('Twitarr: doing status check');
				getAlerts(false).then(function(alerts) {
					var i,
						new_mentions = [], mention,
						new_announcements = [], announcement,
						new_seamails = [], seamail;
					var seen = {
						mention_ids: [],
						seamail_ids: [],
						announcement_timestamps: []
					};

					if (alerts.tweet_mentions) {
						for (i=0; i < alerts.tweet_mentions.length; i++) {
							mention = alerts.tweet_mentions[i];
							seen.mention_ids.push(mention.id);
							if (arrayIncludes(scope.lastStatus.mention_ids, mention.id)) {
								//console.log('Twitarr.checkStatus: already seen mention: ' + mention.id);
							} else {
								console.log('Twitarr.checkStatus: new mention: ' + mention.id);
								new_mentions.push(mention);
							}
						}
						if (new_mentions.length > 0 && scope.isForeground) {
							$rootScope.$broadcast('cruisemonkey.notify.newMentions', new_mentions);
						}
					}
					if (alerts.announcements) {
						for (i=0; i < alerts.announcements.length; i++) {
							announcement = alerts.announcements[i];
							announcement.timestamp = moment(announcement.timestamp);
							seen.announcement_timestamps.push(announcement.timestamp.valueOf());
							if (arrayIncludes(scope.lastStatus.announcement_timestamps, announcement.timestamp.valueOf())) {
								//console.log('Twitarr.checkStatus: already seen announcement: ' + announcement.id);
							} else {
								console.log('Twitarr.checkStatus: new announcement: ' + announcement.text);
								new_announcements.push(announcement);
							}
						}
						if (new_announcements.length > 0 && scope.isForeground) {
							$rootScope.$broadcast('cruisemonkey.notify.newAnnouncements', new_announcements);
						}
					}
					if (alerts.unread_seamail) {
						for (i=0; i < alerts.unread_seamail.length; i++) {
							seamail = alerts.unread_seamail[i];
							seen.seamail_ids.push(seamail.id);
							if (arrayIncludes(scope.lastStatus.seamail_ids, seamail.id)) {
								//console.log('Twitarr.checkStatus: already seen seamail: ' + seamail.id);
							} else {
								console.log('Twitarr.checkStatus: new seamail: ' + seamail.id);
								new_seamails.push(seamail);
							}
						}
						if (new_seamails.length > 0 && scope.isForeground) {
							$rootScope.$broadcast('cruisemonkey.notify.newSeamail', new_seamails);
						}
					}

					var count = new_mentions.length + new_announcements.length + new_seamails.length;

					for (i=0; i < new_mentions.length; i++) {
						sendMentionNotification(new_mentions[i], count);
					}
					for (i=0; i < new_announcements.length; i++) {
						sendAnnouncementNotification(new_announcements[i], count);
					}
					for (i=0; i < new_seamails.length; i++) {
						sendSeamailNotification(new_seamails[i], count);
					}

					scope.lastStatus = seen;
					deferred.resolve(true);
				});
			} else {
				console.log('Twitarr: skipping status check, user is not logged in');
				deferred.resolve(false);
			}

			return deferred.promise;
		};

		var configureBackgroundFetch = function() {
			ionic.Platform.ready(function() {
				if (window.plugins && window.plugins.backgroundFetch) {
					var fetcher = window.plugins.backgroundFetch;
					console.log('Twitarr: Configuring background fetch.');
					fetcher.configure(function() {
						$rootScope.$evalAsync(function() {
							console.log('Twitarr: Background fetch initiated.');
							checkStatus().then(function() {
								fetcher.finish();
							});
						});
					});
				}
			});
		};

		scope.isForeground = true;
		scope.$on('cruisemonkey.app.paused', function() {
			scope.isForeground = false;
		});
		scope.$on('cruisemonkey.app.locked', function() {
			scope.isForeground = false;
		});
		scope.$on('cruisemonkey.app.resumed', function() {
			scope.isForeground = true;
			LocalNotifications.clear();
		});

		var statusCheck;
		$interval(function() {
			if (ionic.Platform.isIOS() && scope.isForeground) {
				// we check in the foreground 'cause we get toast notifications
				checkStatus();
			} else {
				// anywhere else, just run regardless
				checkStatus();
			}
		}, backgroundInterval);
		checkStatus();

		configureBackgroundFetch();

		$rootScope.$on('$destroy', function() {
			if (statusCheck) {
				$interval.cancel(statusCheck);
			}
		});

		return {
			getStream: getStream,
			postTweet: postTweet,
			getUserInfo: getUserInfo,
			getStatus: getStatus,
			getAlerts: getAlerts,
			getAutocompleteUsers: getAutocompleteUsers,
			getSeamail: getSeamail,
			postSeamail: postSeamail,
			getSeamailMessages: getSeamailMessages,
			postSeamailMessage: postSeamailMessage,
			like: like,
			unlike: unlike,
		};
	}]);
}());
