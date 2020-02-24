require('../data/DB');

const datetime = require('../util/datetime');
const hashFunc = require('string-hash/index');

require('../util/HTTP');

require('ng-cordova');
require('ng-file-upload');
require('ngstorage');

angular.module('cruisemonkey.Twitarr', [
	'cruisemonkey.Config',
	'cruisemonkey.DB',
	'cruisemonkey.util.HTTP',
	'cruisemonkey.Initializer',
	'cruisemonkey.Notifications',
	'cruisemonkey.Settings',
	'cruisemonkey.util.BackgroundManager',
	'ngCordova',
	'ngFileUpload',
	'ngStorage',
	'ionic'
])
.factory('Twitarr', ($interval, $ionicPlatform, $log, $q, $rootScope, $timeout, $window, BackgroundManager, cmHTTP, Cordova, kv, LocalNotifications, SettingsService, Upload, UserService) => {
	$log.info('Initializing Twit-arr API.');

	const $scope = $rootScope.$new();
	$scope.isForeground = true;

	const updateLastStatus = () => {
		if ($scope.lastStatus === undefined) {
			return kv.remove('cruisemonkey.twitarr.status');
		} else {
			return kv.set('cruisemonkey.twitarr.status', $scope.lastStatus);
		}
	};

	kv.get('cruisemonkey.twitarr.status').then((s) => {
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

	const get = (url, params) => {
		return cmHTTP.get(url, {params: params});
	};

	const del = (url, params) => {
		return cmHTTP.del(url, {params:params});
	};

	const post = (url, data) => {
		return cmHTTP.post(url, {data:data});
	};

	const put = (url, data) => {
		return cmHTTP.put(url, {data:data});
	};

	const errorHandler = (prefix) => {
		return (errorResponse) => {
			$log.error(prefix + ': Failed: ' + angular.toJson(errorResponse));
			if (errorResponse.status) {
				return $q.reject([errorResponse.data, errorResponse.status]);
			} else {
				return $q.reject([angular.toJson(errorResponse)]);
			}
		};
	};

	const getAlerts = (shouldReset) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.getAlerts(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/alerts';
		return get(url, {
			app:'plain',
			no_reset:!shouldReset,
		}).then((response) => {
			const data = response.data;
			if (data.unread_seamail) {
				for (let i=0, len=data.announcements.length; i < len; i++) {
					data.announcements[i].timestamp = datetime.create(data.announcements[i].timestamp);
				}
				for (let i=0, len=data.unread_seamail.length; i < len; i++) {
					data.unread_seamail[i].timestamp = datetime.create(data.unread_seamail[i].timestamp);
				}
				for (let i=0, len=data.upcoming_events.length; i < len; i++) {
					data.upcoming_events[i].timestamp = datetime.create(data.upcoming_events[i].timestamp);
				}
			}
			return data;
		}, errorHandler('Twitarr.getAlerts()'));
	};

	const getAutocompleteUsers = (searchPrefix) => {
		const username =UserService.get().username;
		const url = 'api/v2/user/ac/' + searchPrefix;

		if (searchPrefix && searchPrefix.trim() !== '') {
			$log.debug('Twitarr.getAutocompleteUsers(): url=' + url);
			return get(url, {cache:true}).then((response) => {
				let ret = [];
				if (response && response.data && response.data.users) {
					ret = response.data.users.map((user) => {
						return user.username.toLowerCase();
					});
				}
				if (username) {
					ret.remove(username.toLowerCase());
				}
				return ret;
			}, errorHandler('Twitarr.getAutocompleteUsers()'));
		} else {
			return $q.when([]);
		}
	};

	const getEvents = () => {
		const url = 'api/v2/event?order=asc';
		$log.debug('Twitarr.getEvents(): url=' + url);

		return get(url).then((result) => {
			if (result && result.data.events && result.data.events[0] && result.data.status === 'ok') {
				return result.data.events;
			} else {
				return $q.reject(result);
			}
		}, errorHandler('Twitarr.getEvents()'));
	};

	const addEvent = (eventData) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.addEvent(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/event';
		$log.debug('Twitarr.addEvent()');

		return post(url, eventData).then((response) => {
			$log.debug('addEvent: success: ' + angular.toJson(response));
			return true;
		}, errorHandler('Twitarr.addEvent()'));
	};

	const updateEvent = (eventData) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.updateEvent(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/event/' + eventData.id;
		$log.debug('Twitarr.updateEvent(): ' + angular.toJson(eventData));

		return put(url, { event: eventData }).then((response) => {
			$log.debug('updateEvent: success: ' + angular.toJson(response));
			return true;
		}, errorHandler('Twitarr.updateEvent()'));
	};

	const removeEvent = (eventId) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.removeEvent(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/event/' + eventId;
		$log.debug('Twitarr.removeEvent(): url=' + url);

		return del(url).then((response) => {
			$log.debug('removeEvent: success: ' + angular.toJson(response));
			return true;
		}, errorHandler('Twitarr.removeEvent(' + eventId + ')'));
	};

	const followEvent = (eventId) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.followEvent(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/event/' + eventId + '/favorite';
		return post(url).then((response) => {
			$log.debug('Twitarr.followEvent(): response = ' + angular.toJson(response));
			return response;
		}, errorHandler('Twitarr.followEvent('+eventId+')'));
	};

	const unfollowEvent = (eventId) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.unfollowEvent(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/event/' + eventId + '/favorite';
		return del(url).then((response) => {
			$log.debug('Twitarr.followEvent(): response = ' + angular.toJson(response));
			return response;
		}, errorHandler('Twitarr.followEvent('+eventId+')'));
	};

	const getText = (file) => {
		const url = 'api/v2/text/' + file;
		$log.debug('Twitarr.getText(' + file + ')');
		return get(url).then((response) => {
			if (response.data && response.data.status && response.data.status !== 'ok') {
				$log.warn('Twitarr.getText(' + file + '): invalid response: ' + angular.toJson(response));
				return $q.reject('Invalid response.');
			}
			return response.data;
		}).then((data) => {
			if (data[file]) {
				return data[file];
			}
			return data;
		});
	};

	const getForums = () => {
		const url = 'api/v2/forums';
		$log.debug('Twitarr.getForums()');
		return get(url).then((response) => {
			if (response.data && response.data['forum_meta']) {
				return response.data['forum_meta'];
			} else {
				$log.warn('Twitarr.getForums(): invalid response: ' + angular.toJson(response));
				return $q.reject('Invalid response.');
			}
		}, (errorResponse) => {
			$log.error('Twitarr.getForums(): Failed: ' + angular.toJson(errorResponse));
			if (errorResponse.status) {
				return $q.reject([errorResponse.data, errorResponse.status]);
			} else {
				return $q.reject([angular.toJson(errorResponse)]);
			}
		});
	};

	const getForum = (id, page) => {
		page = parseInt(page);
		const url = 'api/v2/forums/thread/' + id + '?page=' + page;
		$log.debug('Twitarr.getForum('+id+', '+page+')');
		return get(url).then((response) => {
			if (response.data && response.data.forum) {
				return response.data.forum;
			} else {
				$log.warn('Twitarr.getForum('+id+', '+page+'): invalid response: ' + angular.toJson(response));
				return $q.reject('Invalid response.');
			}
		}, (errorResponse) => {
			$log.error('Twitarr.getForum('+id+', '+page+'): Failed: ' + angular.toJson(errorResponse));
			if (errorResponse.status) {
				return $q.reject([errorResponse.data, errorResponse.status]);
			} else {
				return $q.reject([angular.toJson(errorResponse)]);
			}
		});
	};

	const getStatus = (shouldReset) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.getStatus(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/alerts/check';
		$log.debug('Twitarr.getStatus(): url=' + url);

		return get(url, {no_reset:!shouldReset}).then((response) => {
			if (response && response.data && response.data.status === 'ok') {
				return response.data.user;
			} else {
				return $q.reject(response);
			}
		}, (errorResponse) => {
			$log.error('Twitarr.getStatus(): Failed: ' + angular.toJson(errorResponse));
			if (errorResponse.status) {
				return $q.reject([errorResponse.data, errorResponse.status]);
			} else {
				return $q.reject([angular.toJson(errorResponse)]);
			}
		});
	};

	const uniqueUsers = (users) => {
		const seen = {};
		return users.filter((user) => {
			if (user === undefined || user === null || seen[user.username]) {
				return false;
			}
			return seen[user.username] = true;
		});
	};

	const getSeamail = () => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.getSeamail(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/seamail';
		$log.debug('Twitarr.getSeamail(): url=' + url);

		return get(url).then((response) => {
			const unread = [];
			if (response.data.seamail_meta) {
				for (let i=0, len=response.data.seamail_meta.length, meta; i < len; i++) {
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
		}, (errorResponse) => {
			$log.error('Failed getSeamail(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const postSeamail = (seamail) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.postSeamail(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/seamail?key=' + user.key;
		$log.debug('Twitarr.postSeamail(): url=' + url + ', seamail=' + angular.toJson(seamail));
		if (seamail) {
			seamail.users = uniqueUsers(seamail.users).filter((user) => {
				return user !== null && user.trim() !== '';
			});
		}

		return post(url, seamail).then((response) => {
			if (response.data && response.data.errors && response.data.errors.length > 0) {
				$log.error('Failed postSeamail(): ' + response.data.errors[0]);
				return $q.reject(response.data.errors);
			} else {
				return response.data;
			}
		}, (errorResponse) => {
			$log.error('Failed postSeamail(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const getSeamailMessages = (id) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.getSeamailMessages(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/seamail/' + id;
		$log.debug('Twitarr.getSeamailMessages(): url=' + url);

		return get(url).then((response) => {
			if (response.data && response.data.seamail) {
				if (response.data.seamail.messages) {
					for (let i=0, len=response.data.seamail.messages.length, message; i < len; i++) {
						message = response.data.seamail.messages[i];
						message._hash = hashFunc(message.timestamp + message.author.username);
						message.timestamp = datetime.create(message.timestamp);
						$log.debug('message: ' + angular.toJson(message));
					}
				}
				if (response.data.seamail.users) {
					response.data.seamail.users = uniqueUsers(response.data.seamail.users);
				}
			}
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed getSeamailMessages(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const postSeamailMessage = (id, text) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.postSeamailMessage(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/seamail/' + id + '?key=' + user.key;
		$log.debug('Twitarr.postSeamailMessage(): url=' + url + ', text=',text);

		return post(url, { text: text }).then((response) => {
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed postSeamailMessage(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const like = (tweetId) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.like(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/tweet/' + tweetId + '/react/like?key=' + user.key;
		$log.debug('Twitarr.like(): url=' + url);

		return post(url).then((response) => {
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed like(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const unlike = (tweetId) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.unlike(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/tweet/' + tweetId + '/react/like';
		$log.debug('Twitarr.unlike(): url=' + url);
		return del(url).then((response) => {
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed unlike(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const getStream = (nextPage, additional_params) => {
		let url = 'api/v2/stream?app=plain';
		if (nextPage) {
			url += '&start=' + parseInt(nextPage) + '&older_posts=true';
		}
		if (additional_params) {
			for (const param in additional_params) {
				url += '&' + param + '=' + encodeURIComponent(additional_params[param]);
			}
		}
		$log.debug('Twitarr.getStream(): url=' + url);

		return get(url).then((response) => {
			if (response.data) {
				return response.data;
			} else {
				$log.warn('Twitarr.getStream(): no posts.');
				return {
					next_page: undefined,
					stream_posts: []

				};
			}
		}, (errorResponse) => {
			$log.error('Failed getStream(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const getStreamByAuthor = (username, nextPage) => {
		return getStream(nextPage, { author: username });
	};

	const getStreamByHashtag = (hashtag, nextPage) => {
		return getStream(nextPage, { hashtag: hashtag });
	};

	const getStreamByMentions = (username, nextPage) => {
		return getStream(nextPage, {
			mentions: username,
			include_author: true
		});
	};

	const getStreamByReacted = (nextPage) => {
		return getStream(nextPage, { reacted: true });
	};

	const getStreamByStarred = (nextPage) => {
		return getStream(nextPage, { starred: true });
	};

	const getTweet = (id) => {
		const url = 'api/v2/thread/' + id + '?app=plain';
		$log.debug('Twitarr.getTweet(' + id + '): url=' + url);
		return get(url).then((response) => {
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed getTweet(' + id + '): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const addTweet = (tweet) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.addTweet(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/stream?app=plain';
		$log.debug('Twitarr.addTweet(): url=' + url);

		return post(url, tweet).then((response) => {
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed addTweet(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const updateTweet = (tweet) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.updateTweet(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/tweet/' + tweet.id + '?app=plain';
		$log.debug('Twitarr.updateTweet(): url=' + url);

		const putMe = {};
		if (tweet.text) {
			putMe.text = tweet.text;
		}
		if (tweet.photo) {
			putMe.photo = tweet.photo;
		}

		return post(url, putMe).then((response) => {
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed updateTweet(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const removeTweet = (tweet) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.removeTweet(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/tweet/' + tweet.id;
		$log.debug('Twitarr.removeTweet(): url=' + url);

		return del(url).then((response) => {
			return response.data;
		}, (errorResponse) => {
			$log.error('Failed removeTweet(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const getSections = () => {
		const url = 'api/v2/admin/sections';
		$log.debug('Twitarr.getSections(): url=' + url);

		return get(url).then((response) => {
			if (response.data && response.data.status && response.data.status !== 'ok') {
				return $q.reject([response.data, response.status]);
			}
			const ret = {};
			for (let i=0, len=response.data.sections.length, section; i < len; i++) {
				section = response.data.sections[i];
				ret[section.name] = Boolean.of(section.enabled);
			}
			return ret;
		}, (errorResponse) => {
			$log.error('Failed updateTweet(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject([errorResponse.data, errorResponse.status]);
		});
	};

	const isString = (entity) => {
		return entity instanceof String || typeof entity === 'string';
	};

	const postPhoto = (image, url) => {
		const user = UserService.get();
		if (!user.key || !user.loggedIn) {
			$log.error('Twitarr.postPhoto(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		if (!url) {
			url = 'api/v2/photo';
		}

		let file, fileName, mimeType;
		if (isString(image)) {
			fileName = image.substr(image.lastIndexOf('/') + 1) || image;
			mimeType = image.match(/\.png$/)? 'image/png':'image/jpeg';
			file = image;
		} else if (image.data && isString(image.data)) {
			fileName = image.name;
			mimeType = image.type;
			const binary = atob(image.data.split(',')[1]);
			const array = [];
			for (let i=0, len = binary.length; i < len; i++) {
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

			const deferred = $q.defer();
			SettingsService.getTwitarrRoot().then((twitarrRoot) => {
				url = twitarrRoot + url;
				$log.debug('Twitarr.postPhoto(): url=' + url + ', image=' + image);

				const ft = new FileTransfer();
				const opts = new FileUploadOptions();
				opts.mimeType = mimeType;
				opts.httpMethod = 'POST';
				opts.chunkedMode = false;
				opts.fileName = fileName;
				opts.headers = { Connection: 'close' };
				if (user.key) {
					opts.params = {
						key: user.key,
						files: [opts.fileName]
					};
				}
				ft.onprogress = (progress) => {
					$scope.$evalAsync(() => {
						deferred.notify(progress);
					});
				};

				ft.upload(
					file,
					encodeURI(url),
					function success(result) {
						$scope.$evalAsync(() => {
							$log.debug('Twitarr.postPhoto(): success! ' + angular.toJson(result));
							deferred.resolve(result);
						});
					},
					function err(res) {
						$scope.$evalAsync(() => {
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
			return SettingsService.getTwitarrRoot().then((twitarrRoot) => {
				const options = {
					url: twitarrRoot + url,
					file: file,
					fileFormDataName: 'files',
					fileName: fileName,
					name: fileName
				};
				$log.debug('uploading: ' + angular.toJson(options));
				return Upload.upload(options).then((res) => {
					$log.debug('Twitarr.postPhoto(): success! ' + angular.toJson(res));
					return res.data;
				}, (err) => {
					$log.error('Twitarr.postPhoto(): failure. ' + angular.toJson(err));
					return $q.reject(err);
				}, (progress) => {
					$log.debug('Twitarr.postPhoto: progress=' + angular.toJson(progress));
				});
			});
		}
	};

	const toggleStarred = (username) => {
		const url = 'api/v2/user/profile/' + username + '/star';
		$log.debug('Twitarr.toggleStarred: url=' + url);

		return post(url).then((response) => {
			if (response.data.user) {
				if (response.data.user.room_number) {
					response.data.user.room_number = parseInt(response.data.user.room_number, 10);
				}
				return response.data.user;
			} else {
				return undefined;
			}
		}, (errorResponse) => {
			$log.error('Failed getUserInfo(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject(errorResponse.data);
		});
	};

	const getUserInfo = (username) => {
		let url = 'api/v2/user/profile/' + username;
		if (username === UserService.getUsername()) {
			url = 'api/v2/user/whoami';
		}

		$log.debug('Twitarr.getUserInfo: url=' + url);

		return get(url).then((response) => {
			if (response.data.user) {
				if (response.data.user.room_number) {
					response.data.user.room_number = parseInt(response.data.user.room_number, 10);
				}
				return response.data.user;
			} else {
				return undefined;
			}
		}, (errorResponse) => {
			$log.error('Failed getUserInfo(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject(errorResponse.data);
		});
	};

	const setUserInfo = (user) => {
		const u = UserService.get();
		if (!u.key || !u.loggedIn) {
			$log.error('Twitarr.getAlerts(): Not logged in.');
			return $q.reject('Not logged in.');
		}

		const url = 'api/v2/user/profile';
		$log.debug('Twitarr.setUserInfo: url=' + url);

		const postUser = angular.copy(user);
		for (const key in postUser) {
			if (postUser[key] === undefined || postUser[key] === null) {
				delete postUser[key];
			}
		}
		return post(url, postUser).then((response) => {
			if (response.data.user) {
				if (response.data.user.room_number) {
					response.data.user.room_number = parseInt(response.data.user.room_number, 10);
				}
				return response.data.user;
			} else {
				return undefined;
			}
		}, (errorResponse) => {
			$log.error('Failed setUserInfo(): ' + errorResponse.status + ': ' + angular.toJson(errorResponse.data));
			return $q.reject(errorResponse.data);
		});
	};

	const postUserPhoto = (pic) => {
		return postPhoto(pic, 'api/v2/user/photo');
	};

	const checkStatus = () => {
		$log.debug('Twitarr.checkStatus: retrieving sections.');

		return getSections().then((sections) => {
			$log.debug(`Twitarr.checkStatus: got statuses for ${Object.keys(sections).length} sections.`);

			$rootScope.sections = sections;
		}).catch((err) => {
			$log.warn('Twitarr.checkStatus: failed to get sections', err);
			return $q.reject(err);
		});
	};

	const checkAlerts = () => {
		const user = UserService.get();
		if (user.loggedIn && user.key) {
			$log.debug('Twitarr.checkAlerts: doing alert check.');
			return getAlerts(false).then((alerts) => {
				// $log.debug('Twitarr.checkAlerts: ' + angular.toJson(alerts));
				const new_mentions = [],
					new_announcements = [],
					new_seamails = [];
				let i, mention, announcement;

				const seen = {
					mention_ids: [],
					seamail_ids: [],
					announcement_timestamps: []
				};

				if (alerts.tweet_mentions) {
					for (i=0; i < alerts.tweet_mentions.length; i++) {
						mention = alerts.tweet_mentions[i];
						seen.mention_ids.push(mention.id);
						if ($scope.lastStatus && $scope.lastStatus.mention_ids.includes(mention.id)) {
							$log.debug('Twitarr.checkAlerts: already seen mention: ' + mention.id);
						} else {
							$log.debug('Twitarr.checkAlerts: new mention: ' + mention.id);
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
							$log.debug('Twitarr.checkAlerts: already seen announcement: ' + announcement.id);
						} else {
							$log.debug('Twitarr.checkAlerts: new announcement: ' + announcement.text);
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
						new_seamails.push(alerts.unread_seamail[i]);
					}
					if (new_seamails.length > 0 && $scope.isForeground) {
						$rootScope.$broadcast('cruisemonkey.notify.newSeamail', new_seamails);
					}
					$rootScope.$broadcast('cruisemonkey.notify.tabs.showSeamails', new_seamails.length > 0);
					$rootScope.$broadcast('cruisemonkey.notify.unreadSeamail', new_seamails.length);
				}

				const count = new_mentions.length + new_announcements.length + new_seamails.length;
				$log.debug(`Twitarr.checkAlerts: ${count} new alerts.`);

				LocalNotifications.announcements(new_announcements);
				LocalNotifications.seamail(new_seamails);
				LocalNotifications.mentions(new_mentions);

				LocalNotifications.badge(count);

				$scope.lastStatus = seen;
				updateLastStatus();
				$log.debug('Twitarr.checkAlerts: complete.');
				return true;
			}).catch((err) => {
				$log.error('Twitarr.checkAlerts: an error occurred: ' + angular.toJson(err));
				return $q.reject(err);
			});
		}
	};

	$scope.$on('cruisemonkey.user.updated', (ev, newUser /*, oldUser */) => {
		if (newUser && newUser.loggedIn && newUser.key) {
			$log.debug('Twitarr: User logged in, doing an immediate update.');
			return checkStatus().then(() => {
				return checkAlerts();
			})
		}
	});

	BackgroundManager.onUpdate(() => {
		$log.info('Twitarr: BackgroundManager update triggered, checking status.');
		return checkStatus();
	});

	BackgroundManager.onUpdate(() => {
		$log.info('Twitarr: BackgroundManager update triggered, checking alerts.');
		return checkAlerts();
	});

	return {
		getStream: getStream,
		getStreamByAuthor: getStreamByAuthor,
		getStreamByHashtag: getStreamByHashtag,
		getStreamByMentions: getStreamByMentions,
		getStreamByReacted: getStreamByReacted,
		getStreamByStarred: getStreamByStarred,
		getTweet: getTweet,
		addTweet: addTweet,
		updateTweet: updateTweet,
		removeTweet: removeTweet,
		postPhoto: postPhoto,

		getUserInfo: getUserInfo,
		setUserInfo: setUserInfo,
		postUserPhoto: postUserPhoto,
		toggleStarred: toggleStarred,

		getStatus: getStatus,
		getAlerts: getAlerts,

		getAutocompleteUsers: getAutocompleteUsers,

		getEvents: getEvents,
		addEvent: addEvent,
		updateEvent: updateEvent,
		removeEvent: removeEvent,
		followEvent: followEvent,
		unfollowEvent: unfollowEvent,

		getText: getText,

		getForums: getForums,
		getForum: getForum,

		getSeamail: getSeamail,
		postSeamail: postSeamail,
		getSeamailMessages: getSeamailMessages,
		postSeamailMessage: postSeamailMessage,

		like: like,
		unlike: unlike,

		getSections: getSections
	};
});
