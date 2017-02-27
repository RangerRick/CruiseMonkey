(function() {
	'use strict';

	var datetime = require('../util/datetime');
	var hashFunc = require('string-hash/index');

	require('ng-file-upload');
	require('../util/HTTP');

	angular.module('cruisemonkey.Twitarr', [
		'cruisemonkey.Config',
		'cruisemonkey.DB',
		'cruisemonkey.util.HTTP',
		'cruisemonkey.Initializer',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'ngCordova',
		'ngFileUpload',
		'ionic'
	])
	.factory('Twitarr', function($cordovaFileTransfer, $injector, $interval, $ionicPlatform, $log, $q, $rootScope, $timeout, $window, cmHTTP, Cordova, kv, LocalNotifications, SettingsService, Upload, UserService) {
		$log.info('Initializing Twit-arr API.');

		var $scope = $rootScope.$new();
		$scope.isForeground = true;

		var updateLastStatus = function() {
			if ($scope.lastStatus === undefined) {
				return kv.remove('cruisemonkey.twitarr.status');
			} else {
				return kv.set('cruisemonkey.twitarr.status', $scope.lastStatus);
			}
		};

		kv.get('cruisemonkey.twitarr.status').then(function(s) {
			$scope.lastStatus = s;
			if (!$scope.lastStatus) {
				$scope.lastStatus = {
					mention_ids: [],
					seamail_ids: [],
					announcement_timestamps: []
				};
			}
			if (!$scope.lastStatus.mention_ids) {
				$scope.lastStatus.mention_ids = [];
			}
			if (!$scope.lastStatus.seamail_ids) {
				$scope.lastStatus.seamail_ids = [];
			}
			if (!$scope.lastStatus.announcement_timestamps) {
				$scope.lastStatus.announcement_timestamps = [];
			}
			if ($scope.lastStatus.announcement_ids) {
				delete $scope.lastStatus.announcement_ids;
			}
			updateLastStatus();
		});

		var get = function(url, params) {
			return cmHTTP.get(url, {params: params});
		};

		var del = function(url, data) {
			return cmHTTP.del(url, {data:data});
		};

		var post = function(url, data) {
			return cmHTTP.post(url, {data:data});
		};

		var put = function(url, data) {
			return cmHTTP.put(url, {data:data});
		};

		var errorHandler = function(prefix) {
			return function(errorResponse) {
				$log.error(prefix + ': Failed: ' + angular.toJson(errorResponse));
				if (errorResponse.status) {
					return $q.reject([errorResponse.data, errorResponse.status]);
				} else {
					return $q.reject([angular.toJson(errorResponse)]);
				}
			};
		};

		var getAlerts = function(shouldReset) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.getAlerts(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/alerts';
			return get(url, {no_reset:!shouldReset}).then(function(response) {
				var data = response.data;
				if (data.unread_seamail) {
					for (var i=0, len=data.announcements.length; i < len; i++) {
						data.announcements[i].timestamp = datetime.create(data.announcements[i].timestamp);
					}
					for (var i=0, len=data.unread_seamail.length; i < len; i++) {
						data.unread_seamail[i].timestamp = datetime.create(data.unread_seamail[i].timestamp);
					}
					for (var i=0, len=data.upcoming_events.length; i < len; i++) {
						data.upcoming_events[i].timestamp = datetime.create(data.upcoming_events[i].timestamp);
					}
				}
				return data;
			}, errorHandler('Twitarr.getAlerts()'));
		};

		var getAutocompleteUsers = function(searchPrefix) {
			var username =UserService.get().username;
			var url = 'api/v2/user/autocomplete/' + searchPrefix;

			if (searchPrefix && searchPrefix.trim() !== '') {
				$log.debug('Twitarr.getAutocompleteUsers(): url=' + url);
				return get(url, {cache:true}).then(function(response) {
					for (var i=0; i < response.data.names.length; i++) {
						response.data.names[i] = response.data.names[i].toLowerCase();
					}
					if (username) {
						response.data.names.remove(username.toLowerCase());
					}
					return response.data.names;
				}, errorHandler('Twitarr.getAutocompleteUsers()'));
			} else {
				return $q.when([]);
			}
		};

		var getEvents = function() {
			var url = 'api/v2/event?order=asc';
			$log.debug('Twitarr.getEvents(): url=' + url);

			return get(url).then(function(result) {
				if (result && result.data.event && result.data.event[0] && result.data.event[0].status === 'ok') {
					return result.data.event[0].events;
				} else {
					return $q.reject(result);
				}
			}, errorHandler('Twitarr.getEvents()'));
		};

		var addEvent = function(eventData) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.addEvent(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/event';
			$log.debug('Twitarr.addEvent()');

			return post(url, eventData).then(function(response) {
				$log.debug('addEvent: success: ' + angular.toJson(response));
				return true;
			}, errorHandler('Twitarr.addEvent()'));
		};

		var updateEvent = function(eventData) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.updateEvent(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/event/' + eventData.id;
			$log.debug('Twitarr.updateEvent(): ' + angular.toJson(eventData));

			return put(url, {
				event: eventData
			}).then(function(response) {
				$log.debug('updateEvent: success: ' + angular.toJson(response));
				return true;
			}, errorHandler('Twitarr.updateEvent()'));
		};

		var removeEvent = function(eventId) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.removeEvent(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/event/' + eventId;
			$log.debug('Twitarr.removeEvent(): url=' + url);

			return del(url).then(function(response) {
				$log.debug('removeEvent: success: ' + angular.toJson(response));
				return true;
			}, errorHandler('Twitarr.removeEvent(' + eventId + ')'));
		};

		var followEvent = function(eventId) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.followEvent(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/event/' + eventId + '/favorite';
			return post(url).then(function(response) {
				$log.debug('Twitarr.followEvent(): response = ' + angular.toJson(response));
				return response;
			}, errorHandler('Twitarr.followEvent('+eventId+')'));
		};

		var unfollowEvent = function(eventId) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.unfollowEvent(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/event/' + eventId + '/favorite';
			return del(url).then(function(response) {
				$log.debug('Twitarr.followEvent(): response = ' + angular.toJson(response));
				return response;
			}, errorHandler('Twitarr.followEvent('+eventId+')'));
		};

		var getForums = function() {
			var url = 'api/v2/forums';
			$log.debug('Twitarr.getForums()');
			return get(url).then(function(response) {
				if (response.data && response.data['forum_meta']) {
					return response.data['forum_meta'];
				} else {
					$log.warn('Twitarr.getForums(): invalid response: ' + angular.toJson(response));
					return $q.reject('Invalid response.');
				}
			}, function(errorResponse) {
				$log.error('Twitarr.getForums(): Failed: ' + angular.toJson(errorResponse));
				if (errorResponse.status) {
					return $q.reject([errorResponse.data, errorResponse.status]);
				} else {
					return $q.reject([angular.toJson(errorResponse)]);
				}
			});
		};

		var getForum = function(id, page) {
			page = parseInt(page);
			var url = 'api/v2/forums/thread/' + id + '?page=' + page;
			$log.debug('Twitarr.getForum('+id+', '+page+')');
			return get(url).then(function(response) {
				if (response.data && response.data.forum) {
					return response.data.forum;
				} else {
					$log.warn('Twitarr.getForum('+id+', '+page+'): invalid response: ' + angular.toJson(response));
					return $q.reject('Invalid response.');
				}
			}, function(errorResponse) {
				$log.error('Twitarr.getForum('+id+', '+page+'): Failed: ' + angular.toJson(errorResponse));
				if (errorResponse.status) {
					return $q.reject([errorResponse.data, errorResponse.status]);
				} else {
					return $q.reject([angular.toJson(errorResponse)]);
				}
			});
		};

		var getStatus = function() {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.getStatus(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/alerts/check';
			$log.debug('Twitarr.getStatus(): url=' + url);

			return get(url).then(function(response) {
				if (response && response.data && response.data.status === 'ok') {
					return response.data.user;
				} else {
					return $q.reject(response);
				}
			}, function(errorResponse) {
				$log.error('Twitarr.getStatus(): Failed: ' + angular.toJson(errorResponse));
				if (errorResponse.status) {
					return $q.reject([errorResponse.data, errorResponse.status]);
				} else {
					return $q.reject([angular.toJson(errorResponse)]);
				}
			});
		};

		var uniqueUsers = function(users) {
			var seen = {};
			return users.filter(function(user) {
				if (user === undefined || user === null || seen[user.username]) {
					return false;
				}
				return seen[user.username] = true;
			});
		};

		var getSeamail = function() {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.getSeamail(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/seamail';
			$log.debug('Twitarr.getSeamail(): url=' + url);

			return get(url).then(function(response) {
				var unread = [];
				if (response.data.seamail_meta) {
					for (var i=0, len=response.data.seamail_meta.length, meta; i < len; i++) {
						meta = response.data.seamail_meta[i];
						meta.timestamp = datetime.create(meta.timestamp);
						meta.users = uniqueUsers(meta.users);
						if (meta.is_unread) {
							unread.push(meta);
						}
					}
				}

				if (unread.length > 0 && $scope.isForeground) {
					$rootScope.$broadcast('cruisemonkey.notify.newSeamail', unread);
				}
				$rootScope.$broadcast('cruisemonkey.notify.unreadSeamail', unread.length);
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed getSeamail(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var postSeamail = function(seamail) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.postSeamail(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/seamail';
			$log.debug('Twitarr.postSeamail(): url=' + url + ', seamail=' + angular.toJson(seamail));
			if (seamail) {
				seamail.users = uniqueUsers(seamail.users).filter(function(user) {
					return user !== null && user.trim() !== '';
				});
			}

			return post(url, seamail).then(function(response) {
				if (response.data && response.data.errors && response.data.errors.length > 0) {
					$log.error('Failed postSeamail(): ' + response.data.errors[0]);
					return $q.reject(response.data.errors);
				} else {
					return response.data;
				}
			}, function(errorResponse) {
				$log.error('Failed postSeamail(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var getSeamailMessages = function(id) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.getSeamailMessages(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/seamail/' + id;
			$log.debug('Twitarr.getSeamailMessages(): url=' + url);

			return get(url).then(function(response) {
				if (response.data && response.data.seamail) {
					if (response.data.seamail.messages) {
						for (var i=0, len=response.data.seamail.messages.length, message; i < len; i++) {
							message = response.data.seamail.messages[i];
							message._hash = hashFunc(message.timestamp + message.author);
							message.timestamp = datetime.create(message.timestamp);
							$log.debug('message: ' + angular.toJson(message));
						}
					}
					if (response.data.seamail.users) {
						response.data.seamail.users = uniqueUsers(response.data.seamail.users);
					}
				}
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed getSeamailMessages(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var postSeamailMessage = function(id, text) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.postSeamailMessage(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/seamail/' + id + '/new_message';
			$log.debug('Twitarr.postSeamailMessage(): url=' + url + ', text=',text);

			return post(url, { text: text }).then(function(response) {
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed postSeamailMessage(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var like = function(tweetId) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.like(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/stream/' + tweetId + '/like';
			$log.debug('Twitarr.like(): url=' + url);

			return post(url).then(function(response) {
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed like(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var unlike = function(tweetId) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.unlike(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/stream/' + tweetId + '/like';
			$log.debug('Twitarr.unlike(): url=' + url);
			return del(url).then(function(response) {
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed unlike(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var getStream = function(nextPage, additional_params) {
			var url = 'api/v2/stream?app=plain';
			if (nextPage) {
				url += '&start=' + parseInt(nextPage) + '&older_posts=true';
			}
			if (additional_params) {
				for (var param in additional_params) {
					url += '&' + param + '=' + encodeURIComponent(additional_params[param]);
				}
			}
			$log.debug('Twitarr.getStream(): url=' + url);

			return get(url).then(function(response) {
				if (response.data) {
					return response.data;
				} else {
					$log.warn('Twitarr.getStream(): no posts.');
					return {
						next_page: undefined,
						stream_posts: []

					};
				}
			}, function(errorResponse) {
				$log.error('Failed getStream(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var getStreamByAuthor = function(username, nextPage) {
			return getStream(nextPage, {
				author: username
			});
		};

		var getStreamByHashtag = function(hashtag, nextPage) {
			return getStream(nextPage, {
				hashtag: hashtag
			});
		};

		var getStreamByLikes = function(username, nextPage) {
			return getStream(nextPage, {
				likes: username
			});
		};

		var getStreamByMentions = function(username, nextPage) {
			return getStream(nextPage, {
				mentions: username,
				include_author: false
			});
		};

		var getStreamByStarred = function(nextPage) {
			return getStream(nextPage, {
				starred: true
			});
		};

		var getStreamByUser = function(username, nextPage) {
			return getStream(nextPage, {
				mentions: username,
				include_author: false
			});
		};

		var getTweet = function(id) {
			var url = 'api/v2/stream/' + id + '?app=plain';
			$log.debug('Twitarr.getTweet(' + id + '): url=' + url);
			return get(url).then(function(response) {
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed getTweet(' + id + '): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var addTweet = function(tweet) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.addTweet(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/stream?app=plain';
			$log.debug('Twitarr.addTweet(): url=' + url);

			return post(url, tweet).then(function(response) {
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed addTweet(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var updateTweet = function(tweet) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.updateTweet(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/stream/' + tweet.id + '?app=plain';
			$log.debug('Twitarr.updateTweet(): url=' + url);

			var putMe = {};
			if (tweet.text) {
				putMe.text = tweet.text;
			}
			if (tweet.photo) {
				putMe.photo = tweet.photo;
			}

			return put(url, putMe).then(function(response) {
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed updateTweet(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var removeTweet = function(tweet) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.removeTweet(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/stream/' + tweet.id;
			$log.debug('Twitarr.removeTweet(): url=' + url);

			return del(url).then(function(response) {
				return response.data;
			}, function(errorResponse) {
				$log.error('Failed removeTweet(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject([errorResponse.data, errorResponse.status]);
			});
		};

		var isString = function(entity) {
			return entity instanceof String || typeof entity === 'string';
		};

		var postPhoto = function(image, url) {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.postPhoto(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			if (!url) {
				url = 'api/v2/photo';
			}

			var file, fileName, mimeType;
			if (isString(image)) {
				fileName = image.substr(image.lastIndexOf('/') + 1) || image;
				mimeType = image.match(/\.png$/)? 'image/png':'image/jpeg';
				file = image;
			} else if (image.data && isString(image.data)) {
				fileName = image.name;
				mimeType = image.type;
				var binary = atob(image.data.split(',')[1]);
				var array = [];
				for (var i=0, len = binary.length; i < len; i++) {
					array.push(binary.charCodeAt(i));
				}
				file = new Blob([new Uint8Array(array)], {type:mimeType});
			} else {
				fileName = image.name;
				mimeType = image.type;
				file = image.fullPath;
			}

			$log.debug('fileName: ' + fileName);
			$log.debug('mimeType: ' + mimeType);

			if (typeof FileTransfer !== 'undefined' && isString(file)) {
				$log.debug('Twitarr.postPhoto: native file transfer: ' + url);

				var deferred = $q.defer();
				SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
					url = twitarrRoot + url;
					$log.debug('Twitarr.postPhoto(): url=' + url + ', image=' + image);

					var ft = new FileTransfer();
					var opts = new FileUploadOptions();
					opts.mimeType = mimeType;
					opts.httpMethod = 'POST';
					opts.chunkedMode = false;
					opts.fileName = fileName;
					opts.headers = {
						Connection: 'close'
					};
					if (user.key) {
						opts.params = {
							key: user.key,
							files: [opts.fileName]
						};
					}
					ft.onprogress = function(progress) {
						$scope.$evalAsync(function() {
							deferred.notify(progress);
						});
					};

					ft.upload(
						file,
						encodeURI(url),
						function success(result) {
							$scope.$evalAsync(function() {
								$log.debug('Twitarr.postPhoto(): success! ' + angular.toJson(result));
								deferred.resolve(result);
							});
						},
						function err(res) {
							$scope.$evalAsync(function() {
								$log.error('Twitarr.postPhoto(): failure. ' + angular.toJson(res));
								deferred.reject(res);
							});
						},
						opts,
						true
					);
				});
				return deferred.promise;
			} else {
				$log.debug('Twitarr.postPhoto: browser file transfer: ' + url);

				if (user.key) {
					url += '?key=' + user.key;
				}
				return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
					var options = {
						url: twitarrRoot + url,
						file: file,
						fileFormDataName: 'files',
						fileName: fileName,
						name: fileName
					};
					$log.debug('uploading: ' + angular.toJson(options));
					return Upload.upload(options).then(function(res) {
						$log.debug('Twitarr.postPhoto(): success! ' + angular.toJson(res));
						return res;
					}, function(err) {
						$log.error('Twitarr.postPhoto(): failure. ' + angular.toJson(err));
						return $q.reject(err);
					}, function(progress) {
						$log.debug('Twitarr.postPhoto: progress=' + angular.toJson(progress));
					});
				});
			}
		};

		var getUserInfo = function(username) {
			var url = 'api/v2/user/view/' + username;
			if (username === UserService.getUsername()) {
				url = 'api/v2/user/whoami';
			}

			$log.debug('Twitarr.getUserInfo: url=' + url);

			return get(url).then(function(response) {
				if (response.data.user) {
					if (response.data.user.room_number) {
						response.data.user.room_number = parseInt(response.data.user.room_number, 10);
					}
					return response.data.user;
				} else {
					return undefined;
				}
			}, function(errorResponse) {
				$log.error('Failed getUserInfo(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject(errorResponse.data);
			});
		};

		var setUserInfo = function(user) {
			var u = UserService.get();
			if (!u.key || !u.loggedIn) {
				$log.error('Twitarr.getAlerts(): Not logged in.');
				return $q.reject('Not logged in.');
			}

			var url = 'api/v2/user/profile';
			$log.debug('Twitarr.setUserInfo: url=' + url);

			var postUser = angular.copy(user);
			for (var key in postUser) {
				if (postUser[key] === undefined || postUser[key] === null) {
					delete postUser[key];
				}
			}
			return post(url, postUser).then(function(response) {
				if (response.data.user) {
					if (response.data.user.room_number) {
						response.data.user.room_number = parseInt(response.data.user.room_number, 10);
					}
					return response.data.user;
				} else {
					return undefined;
				}
			}, function(errorResponse) {
				$log.error('Failed setUserInfo(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
				return $q.reject(errorResponse.data);
			});
		};

		var postUserPhoto = function(pic) {
			return postPhoto(pic, 'api/v2/user/photo');
		};

		var sendMentionNotification = function(mention, count) {
			if (mention.author === UserService.getUsername()) {
				$log.debug('Twitarr: mentioned myself!  Not sending a notification.');
				return;
			}

			$log.debug('Twitarr: Sending mention local notification for: ' + angular.toJson(mention));

			var options = {
				id: 'mention-' + mention.id,
				message: 'Mentioned by @' + mention.author + ': ' + mention.text.replace(/<\S[^><]*>/g, ''),
				data: mention
			};
			if (count) {
				options.badge = count;
			}

			$rootScope.$broadcast('cruisemonkey.notify.local', options);
		};

		var sendAnnouncementNotification = function(announcement, count) {
			$log.debug('Twitarr: Sending announcement local notification for: ' + angular.toJson(announcement));

			var options = {
				id: 'announcement-' + announcement.timestamp.valueOf(),
				message: 'New Announcement: ' + announcement.text,
				data: announcement
			};
			if (count) {
				options.badge = count;
			}

			$rootScope.$broadcast('cruisemonkey.notify.local', options);
		};

		var sendSeamailNotification = function(seamail, count) {
			$log.debug('Twitarr: Sending seamail local notification for: ' + angular.toJson(seamail));

			var options = {
				id: 'seamail-' + seamail.id + seamail.messages.replace(' messages',''),
				message: 'New Seamail: ' + seamail.subject,
				data: seamail
			};
			if (count) {
				options.badge = count;
			}

			$rootScope.$broadcast('cruisemonkey.notify.local', options);
		};

		var sendSeamailNotifications = function() {
			var user = UserService.get();
			if (!user.key || !user.loggedIn) {
				$log.error('Twitarr.sendSeamailNotifications(): Not logged in.');
				return $q.reject('Not logged in.');
			}

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
				$log.debug('Twitarr: doing status check');
				return getAlerts(false).then(function(alerts) {
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
							if ($scope.lastStatus && $scope.lastStatus.mention_ids.includes(mention.id)) {
								//$log.debug('Twitarr.checkStatus: already seen mention: ' + mention.id);
							} else {
								$log.debug('Twitarr.checkStatus: new mention: ' + mention.id);
								new_mentions.push(mention);
							}
						}
						if (new_mentions.length > 0 && $scope.isForeground) {
							$rootScope.$broadcast('cruisemonkey.notify.newMentions', new_mentions);
							$rootScope.$broadcast('cruisemonkey.notify.tabs.showMentions', true);
						}
						$rootScope.$broadcast('cruisemonkey.notify.mentions', alerts.tweet_mentions);
					}
					if (alerts.announcements) {
						for (i=0; i < alerts.announcements.length; i++) {
							announcement = alerts.announcements[i];
							announcement.timestamp = datetime.create(announcement.timestamp);
							seen.announcement_timestamps.push(announcement.timestamp.valueOf());
							if ($scope.lastStatus && $scope.lastStatus.announcement_timestamps.includes(announcement.timestamp.valueOf())) {
								//$log.debug('Twitarr.checkStatus: already seen announcement: ' + announcement.id);
							} else {
								$log.debug('Twitarr.checkStatus: new announcement: ' + announcement.text);
								new_announcements.push(announcement);
							}
						}
						if (new_announcements.length > 0 && $scope.isForeground) {
							$rootScope.$broadcast('cruisemonkey.notify.newAnnouncements', new_announcements);
							$rootScope.$broadcast('cruisemonkey.notify.tabs.showAnnouncements', true);
						}
						$rootScope.$broadcast('cruisemonkey.notify.announcements', alerts.announcements);
					}
					if (alerts.unread_seamail) {
						for (i=0; i < alerts.unread_seamail.length; i++) {
							seamail = alerts.unread_seamail[i];
							seen.seamail_ids.push(seamail.id);
							if ($scope.lastStatus && $scope.lastStatus.seamail_ids.includes(seamail.id)) {
								//$log.debug('Twitarr.checkStatus: already seen seamail: ' + seamail.id);
							} else {
								$log.debug('Twitarr.checkStatus: new seamail: ' + seamail.id);
								new_seamails.push(seamail);
							}
						}
						if (new_seamails.length > 0 && $scope.isForeground) {
							$rootScope.$broadcast('cruisemonkey.notify.newSeamail', new_seamails);
						}
						$rootScope.$broadcast('cruisemonkey.notify.tabs.showSeamails', seen.seamail_ids.length > 0);
						$rootScope.$broadcast('cruisemonkey.notify.unreadSeamail', seen.seamail_ids.length);
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

					$scope.lastStatus = seen;
					updateLastStatus();
					return true;
				});
			} else {
				$log.debug('Twitarr: skipping status check, user is not logged in.');
				return $q.resolve(false);
			}
		};

		var configureBackgroundFetch = function() {
			$ionicPlatform.ready(function() {
				if ($window.plugins && $window.plugins.backgroundFetch) {
					var fetcher = $window.plugins.backgroundFetch;
					$log.info('Twitarr: Configuring background fetch.');
					fetcher.configure(function() {
						$scope.$evalAsync(function() {
							$log.info('Twitarr: Background fetch initiated.');
							checkStatus().then(function() {
								$log.info('Twitarr: Background fetch complete.');
								fetcher.finish();
							}, function(err) {
								$log.debug('Twitarr: Background fetch failed: ' + angular.toJson(err));
							});
						});
					});
				}
			});
		};

		var statusIntervalCallback = function() {
			Cordova.inCordova().then(function() {
				// if we're in Cordova, only run the interval check when we're in the foreground
				if ($scope.isForeground) {
					checkStatus();
				}
			}, function() {
				// outside of cordova, just assume we should do it
				checkStatus();
			});
		};

		var _statusCheck;
		var startStatusCheck = function() {
			if (_statusCheck) {
				return;
			}
			$log.info('Twitarr: Starting background status check.');
			$timeout(function() {
				statusIntervalCallback();
			}, 1000).then(function() {
				SettingsService.getBackgroundInterval().then(function(backgroundInterval) {
					_statusCheck = $interval(statusIntervalCallback, backgroundInterval * 1000);
				});
			});
		};
		var stopStatusCheck = function() {
			if (_statusCheck) {
				$log.info('Twitarr: Stopping background status check.');
				$interval.cancel(_statusCheck);
			}
		};

		var onForeground = function() {
			$scope.isForeground = true;
			LocalNotifications.clear();
			startStatusCheck();
		};
		var onBackground = function() {
			$scope.isForeground = false;
			stopStatusCheck();
		};

		/* start status check on launch or resume */
		$scope.$on('cruisemonkey.app.resumed', onForeground);

		/* stop status check when backgrounded or shut down */
		$scope.$on('cruisemonkey.app.paused', onBackground);
		$scope.$on('cruisemonkey.app.locked', onBackground);
		$scope.$on('$destroy', stopStatusCheck);

		/* configure background fetch to run whenever it thinks it should ;) */
		configureBackgroundFetch();

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser, oldUser) {
			if (newUser.loggedIn && newUser.key) {
				$log.debug('Twitarr: User logged in, restart status check.');
				stopStatusCheck();
				startStatusCheck();
			}
		});

		$scope.$on('cruisemonkey.user.settings-changed', function(ev, settings) {
			if (settings.old && settings.new.backgroundInterval !== settings.old.backgroundInterval) {
				$log.debug('Twitarr: background interval refresh has changed from ' + settings.old.backgroundInterval + ' to ' + settings.new.backgroundInterval + '.');
				stopStatusCheck();
				startStatusCheck();
			}
		});

		return {
			getStream: getStream,
			getStreamByAuthor: getStreamByAuthor,
			getStreamByMentions: getStreamByMentions,
			getStreamByHashtag: getStreamByHashtag,
			getStreamByLikes: getStreamByLikes,
			getStreamByStarred: getStreamByStarred,
			getStreamByUser: getStreamByUser,
			getTweet: getTweet,
			addTweet: addTweet,
			updateTweet: updateTweet,
			removeTweet: removeTweet,
			postPhoto: postPhoto,

			getUserInfo: getUserInfo,
			setUserInfo: setUserInfo,
			postUserPhoto: postUserPhoto,

			getStatus: getStatus,
			getAlerts: getAlerts,

			getAutocompleteUsers: getAutocompleteUsers,

			getEvents: getEvents,
			addEvent: addEvent,
			updateEvent: updateEvent,
			removeEvent: removeEvent,
			followEvent: followEvent,
			unfollowEvent: unfollowEvent,

			getForums: getForums,
			getForum: getForum,

			getSeamail: getSeamail,
			postSeamail: postSeamail,
			getSeamailMessages: getSeamailMessages,
			postSeamailMessage: postSeamailMessage,

			like: like,
			unlike: unlike
		};
	});
}());
