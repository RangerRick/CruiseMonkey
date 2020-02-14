require('../data/DB');

(function() {
	'use strict';

	/*jshint bitwise: false*/

	var datetime = require('../util/datetime');
	var translator = require('./translator');

	require('ngstorage');
	require('ng-fittext');
	require('../data/DB');
	require('../images/Cache');
	require('../images/Viewer');
	require('./Editor');

	var hashFunc = require('string-hash/index');

	var typeChooser = require('./chooser.html');

	var detailedFormat = 'dddd, MMMM Do YYYY, h:mm:ss.SSS a';

	var decorateTweet = function(tweet) {
		tweet.tracker = tweet.id + hashFunc(tweet.text);
		tweet.timestamp = datetime.create(tweet.timestamp);
		return tweet;
	};

	angular.module('cruisemonkey.controllers.Twitarr.Stream', [
		'uuid4',
		'ngFitText',
		'ngStorage',
		'angular-cache',
		'cruisemonkey.DB',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.directives.all',
		'cruisemonkey.emoji.Emoji',
		'cruisemonkey.images.Cache',
		'cruisemonkey.images.Viewer',
		'cruisemonkey.twitarr.Editor',
		'cruisemonkey.user.Cache',
		'cruisemonkey.user.Detail',
		'cruisemonkey.user.User'
	])
	.controller('CMTweetCtrl', function($ionicLoading, $ionicScrollDelegate, $log, $q, $scope, $stateParams, $localStorage, ImageViewer, SettingsService, Twitarr, UserDetail, UserService) {
		$scope.openUser = UserDetail.open;
		$scope.user = UserService.get();

		$scope.$storage = $localStorage;

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser) {
			$scope.user = newUser;
		});

		var drawTweets = function(tweets) {
			var newTweets = [];

			for (var i=0, len=tweets.length, tweet; i < len; i++) {
				if (tweets[i].status === 'ok') tweets[i] = tweets[i].post;
				tweet = decorateTweet(tweets[i]);
				newTweets.push(tweet);
			}

			$scope.$storage['cruisemonkey.twitarr.tweet.tweets'] = newTweets;
			$scope.$broadcast('scroll.refreshComplete');
		};

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('tweet-detail').scrollTop(true);
		};

		$scope.doRefresh = function() {
			$q.all({
				tweet: Twitarr.getTweet($stateParams.id),
				twitarrRoot: SettingsService.getTwitarrRoot()
			}).then(function(res) {
				$scope.twitarrRoot = res.twitarrRoot;
				var tweet = res.tweet.post;
				if (tweet.parent_chain && tweet.parent_chain.length > 0) {
					return Twitarr.getTweet(tweet.parent_chain[0]).then(function(parentRes) {
						var post = parentRes.post;
						var tweets = [post];
						var children = post.children;
						if (Array.isArray(children)) {
							tweets = tweets.concat(children);
						}
						delete post.children;
						drawTweets(tweets);
					});
				} else {
					var tweets = [tweet];
					var children = tweet.children;
					if (Array.isArray(children)) {
						tweets = tweets.concat(children);
					}
					delete tweet.children;
					drawTweets(tweets);
				}
			}).finally(function() {
				$ionicLoading.hide();
			});
			return true;
		};

		$scope.isLiked = function(entry) {
			return entry && entry.likes && (entry.likes.indexOf('You') >= 0 || entry.likes.indexOf($scope.user.username) >= 0);
		};

		$scope.showImage = function(photoId, ev) {
			ImageViewer.show(photoId, ev);
		};

		$scope.$on('$ionicView.beforeEnter', function() {
			var tweets = $scope.$storage['cruisemonkey.twitarr.tweet.tweets'];
			if (!tweets || tweets.length === 0) {
				$ionicLoading.show({
					template: 'Loading...',
					duration: 5000,
					noBackdrop: true
				});
			}
			$scope.doRefresh();
		});
		$scope.$on('$ionicView.afterLeave', function() {
			delete $scope.twitarrRoot;
			delete $scope.displayName;
			delete $scope.displayHandle;
		});
	})
	.filter('everythingFilter', function($log) {
		return function(input) {
			//$log.debug('Filter: everything.');
			return input;
		};
	})
	.filter('myTweetFilter', function($log) {
		return function(input, username) {
			//$log.debug('Filter: mine.  Username=' + username);
			return input.filter(function(tweet) {
				if (tweet.author.username === username) {
					return true;
				} else if (tweet.mentions && tweet.mentions.length > 0) {
					if (tweet.mentions.includes('You') || tweet.mentions.includes(username)) {
						return true;
					}
				}
				return false;
			});
		};
	})
	.filter('reactedTweetFilter', function($log) {
		return function(input, username) {
			//$log.debug('Filter: starred.  Username=' + username);
			return input.filter(function(tweet) {
				var keys = tweet.reactions? Object.keys(tweet.reactions) : [];
				for (var j=0, jlen = keys.length, reaction; j < jlen; j++) {
					reaction = tweet.reactions[j];
					if (reaction.me) {
						return true;
					}
				}
				return false;
			});
		}
	})
	.filter('starredTweetFilter', function($log) {
		return function(input, username) {
			//$log.debug('Filter: starred.  Username=' + username);
			var ret = [];
			for (var i=0, len=input.length, tweet; i < len; i++) {
				tweet = input[i];
				if (tweet.author.starred) {
					ret.push(tweet);
				}
			}
			return ret;
		}
	})
	.filter('cmfilter', function($filter) {
		return function(input, filterType, username) {
			if (filterType) {
				return $filter(filterType)(input, username);
			}
			return $filter('everythingFilter')(input, username);
		}
	})
	.controller('CMTwitarrStreamCtrl', function($ionicHistory, $ionicLoading, $ionicPopover, $ionicScrollDelegate, $log, $q, $rootScope, $scope, $localStorage, $timeout, CacheFactory, EmojiService, TweetEditor, Twitarr, UserCache, UserDetail, UserService) {
		$log.info('Initializing CMTwitarrStreamCtrl');

		if (!CacheFactory.get('tweets')) {
			CacheFactory.createCache('tweets', {
				deleteOnExpire: 'passive',
				maxAge: 60 * 60 * 1000 // 1 hour
			});
		}
		var tweetCache = CacheFactory.get('tweets');

		var defaultStreamType = 'all';

		$scope.e = EmojiService;
		$scope.u = UserService;
		$scope.t = TweetEditor;

		$scope.$storage = $localStorage;
		if (!$scope.$storage['cruisemonkey.twitarr.tweets']) {
			$scope.$storage['cruisemonkey.twitarr.tweets'] = [];
		}

		$scope.entries = undefined;

		var loadCache = function() {
			var cachedTweets = [];
			for (var i=0, len=$scope.$storage['cruisemonkey.twitarr.tweets'].length, tweetId, tweet; i<len; i++) {
				tweetId = $scope.$storage['cruisemonkey.twitarr.tweets'][i];
				tweet = decorateTweet(tweetCache.get(tweetId));
				if (tweet) {
					cachedTweets.push(tweet);
				}
			}
			if (cachedTweets.length > 0) {
				$ionicLoading.hide();
				$scope.entries = cachedTweets;
			}
		};

		var updateTweet = function(tweet) {
			tweetCache.put(tweet.id, decorateTweet(tweet));
		};

		var updateEntries = function(entries) {
			$scope.entries = entries;
			$scope.$storage['cruisemonkey.twitarr.tweets'] = entries.map(function(entry) {
				return entry.id;
			});
		};

		$scope.streamTypes = {
			all: {
				enabled: function() { return true; },
				type: 'all',
				description: function() { return 'All Tweets'; },
				query: function(nextPage) {
					return Twitarr.getStream(nextPage);
				}
			},
			mine: {
				enabled: function() { return $scope.user.loggedIn; },
				type: 'mine',
				description: function() { return 'By Me' },
				query: function(nextPage) {
					return Twitarr.getStreamByAuthor(UserService.getUsername(), nextPage);
				}
			},
			mentions: {
				enabled: function() { return $scope.user.loggedIn; },
				type: 'mentions',
				description: function() { return 'Involve Me' },
				query: function(nextPage) {
					return Twitarr.getStreamByMentions(UserService.getUsername(), nextPage);
				}
			},
			reacted: {
				enabled: function() { return $scope.user.loggedIn; },
				type: 'reacted',
				description: function() { return 'Liked Tweets'; }, // TODO 2020: call this "Reacted"
				query: function(nextPage) {
					return Twitarr.getStreamByReacted(nextPage);
				}
			},
			starred: {
				enabled: function() { return $scope.user.loggedIn; },
				type: 'starred',
				description: function() { return 'Starred Users'; },
				query: function(nextPage) {
					return Twitarr.getStreamByStarred(nextPage);
				}
			}
		};
		$scope.users = {};

		var popover = $ionicPopover.fromTemplateUrl(typeChooser, {
			scope: $scope
		});
		$scope.openStreamTypePopover = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			popover.then(function(p) {
				p.show(ev);
			});
		};
		$scope.getStreamTypes = function() {
			var types = angular.copy($scope.streamTypes);
			if (!$scope.user.loggedIn) {
				delete types.mine;
			}
			return types;
		};
		$scope.getStreamType = function() {
			return $scope.$storage['cruisemonkey.twitarr.streamType'] || defaultStreamType;
		};
		$scope.setStreamType = function(type, ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$scope.$storage['cruisemonkey.twitarr.streamType'] = type;
			popover.then(function(p) {
				p.hide().then(function() {
					$ionicScrollDelegate.$getByHandle('twitarr').scrollTop(false);
					$scope.$evalAsync(function() {
						$scope.doRefresh();
					});
				});
			});
		};

		var newestSeen;
		var currentTop;
		$scope.unreadCount = 0;

		$scope.openUser = UserDetail.open;

		var getIndex = function(entry) {
			if (!entry || $scope.entries === undefined || $scope.entries.length === 0) {
				return undefined;
			}
			for (var i=0, index=0, len=$scope.entries.length; i < len; i++) {
				if ($scope.entries[i].id === entry.id) {
					return index;
				} else {
					index++;
				}
			}
			return undefined;
		};

		var getNewestSeenIndex = function() {
			return getIndex(newestSeen);
		};

		var updateUnreadCount = function(index) {
			$scope.unreadCount = index || getNewestSeenIndex();
			if (!$scope.entries || $scope.entries.length === 0) {
				return;
			}
			var currentView = $ionicHistory.currentView();
			if (currentView && currentView.stateName === 'tab.twitarr') {
				var read = $scope.entries[index];
				if (read) {
					var date = datetime.create(read.timestamp);
					$rootScope.$broadcast('cruisemonkey.notify.mention-seen', date);
				}
			}
		};

		$scope.updateTopVisible = function() {
			$timeout(function() {
				if ($scope.entries === undefined) {
					return;
				}
				for (var i=0, len=$scope.entries.length, entry, elm, offset; i < len; i++) {
					entry = $scope.entries[i];
					elm = angular.element(document.getElementById(entry.id));
					if (elm && elm.offset) {
						offset = elm.offset();
						if (offset && offset.top >= 0) {
							currentTop = entry;
							$scope.setNewestSeen(entry);
							break;
						}
					}
				}
			});
		};

		$scope.setNewestSeen = function(entry) {
			var index = getIndex(entry),
				newestIndex = getNewestSeenIndex();

			if (newestIndex === undefined || index <= newestIndex) {
				newestSeen = entry;
				updateUnreadCount(index);
			}
		};

		$scope.isLiked = function(entry) {
			return entry && entry.reactions && entry.reactions.like && entry.reactions.like.me;
		};

		var lookupUser = function(username) {
			return UserCache.get(username).then(function(user) {
				$scope.users[username] = user;
				return user;
			});
		};

		var prependTweets = function(tweets) {
			var seenUsers = {};
			for (var i=tweets.length, tweet; i >= 0; i--) {
				tweet = tweets[i];
				if (tweet) {
					updateTweet(tweet);
					if (!seenUsers[tweet.author.username]) {
						lookupUser(tweet.author.username);
					}
					seenUsers[tweet.author.username]++;
					if ($scope.entries === undefined) {
						updateEntries([]);
					}
					$scope.entries.unshift(tweet);
				}
			}
			$scope.$broadcast('scroll.refreshComplete');
		};

		var addTweets = function(tweets) {
			var seenUsers = {};
			var seenIDs = {};
			if ($scope.entries) {
				for (var i=0, len=$scope.entries.length; i < len; i++) {
					seenIDs[$scope.entries[i]] = i;
				}
			} else {
				updateEntries([]);
			}
			for (var i=0, len=tweets.length, tweet, seen; i < len; i++) {
				tweet = tweets[i];
				decorateTweet(tweet);
				seen = seenIDs[tweet.id];
				if (seen) {
					$scope.entries[seen] = tweet;
				}
				seenIDs[tweet.id] = i;
				updateTweet(tweet);
				if (!seenUsers[tweet.author.username]) {
					lookupUser(tweet.author.username);
				}
				seenUsers[tweet.author.username]++;
				$scope.entries.push(tweet);
			}
			if ($scope.entries.length > 500) {
				updateEntries($scope.entries.slice(0, 500));
			}
		};

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('twitarr').scrollTop(true);
		};

		var findHash = function(hash) {
			var elm, scrollEl, position = 0;
			elm = document.getElementById(hash);
			if (elm) {
				scrollEl = angular.element(elm);
				while (scrollEl) {
					if (scrollEl.hasClass('scroll-content')) {
						break;
					}
					var offsetTop = scrollEl[0].offsetTop,
						scrollTop = scrollEl[0].scrollTop,
						clientTop = scrollEl[0].clientTop;
					position += offsetTop - scrollTop + clientTop;
					scrollEl = scrollEl.parent();
				}
				return position;
			} else {
				$log.error('can\'t find element ' + hash);
				return 0;
			}
		};

		var goToEntry = function(hash, shouldAnimate) {
			var hashLocation = findHash(hash);
			$log.debug('scrolling to hash location: ' + hashLocation);
			$timeout(function() {
				$ionicScrollDelegate.$getByHandle('twitarr').scrollTo(0, hashLocation, shouldAnimate);
			});
		};

		$scope.done = false;

		var errors = 0;
		$scope.doRefresh = function(keepPosition) {
			$scope.user = UserService.get();
			$scope.updateTopVisible();

			var topEntry = $scope.entries === undefined? undefined:$scope.entries[0];
			if (keepPosition && currentTop) {
				goToEntry(currentTop.id, false);
			}

			$scope.done = false;
			var streamType = $scope.getStreamType();
			$log.debug('Controller.Twitarr.Stream.doRefresh(' + keepPosition + ') type=' + streamType);
			var func = $scope.streamTypes[streamType].query;
			return func().then(function(res) {
				if (res && (res.next_page === undefined || res.next_page === 0)) {
					$scope.done = true;
				}
				updateEntries([]);
				if (res && res.stream_posts && res.stream_posts.length > 0) {
					addTweets(res.stream_posts);
					if (keepPosition) {
						if (currentTop) {
							goToEntry(currentTop.id, false);
						} else if (topEntry) {
							goToEntry(topEntry.id, false);
						}
					}
				}

				errors = 0;
				$scope.error = undefined;
				updateUnreadCount();
				return true;
			}, function(err) {
				errors++;
				$log.error('Controller.Twitarr.Stream: failed to get entries:', err);
				$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
				// retry a few times before giving up on refreshing down
				if (errors >= 5) {
					$scope.done = true;
				}
				return $q.reject(err);
			}).finally(function() {
				updateUnreadCount();
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		$scope.loadMore = function() {
			$log.debug('Controller.Twitarr.Stream.loadMore()');

			if ($scope.done) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
				return;
			}

			var nextPage = 0;
			if ($scope.entries && $scope.entries.length > 0) {
				// get whatever's older than the last entry
				nextPage = $scope.entries[$scope.entries.length-1].timestamp.valueOf() - 1;
			}

			$log.debug('Controller.Twitarr.Stream.loadMore(): next_page=' + datetime.create(nextPage).format(detailedFormat));
			if ($scope.entries && $scope.entries.length > 0) {
				var streamType = $scope.getStreamType();
				var func = $scope.streamTypes[streamType].query;
				return func(nextPage).then(function(res) {
					if (res && (res.next_page === undefined || res.next_page === 0)) {
						$scope.done = true;
					}
					if (res && res.stream_posts && res.stream_posts.length > 0) {
						addTweets(res.stream_posts);
					}
				}, function(err) {
					$log.error('Controller.Twitarr.Stream: failed to get more entries:', err);
					$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
				}).finally(function() {
					$scope.updateTopVisible();
					$scope.$broadcast('scroll.infiniteScrollComplete');
				});
			} else {
				$scope.done = true;
				$log.debug('Controller.Twitarr.Stream.loadMore(): Skipped update.');
				return $scope.$broadcast('scroll.infiniteScrollComplete');
			}
		};

		$scope.doRefresh();

		$scope.$on('cruisemonkey.tweet.deleted', function(ev, id) {
			for (var i=0, len=$scope.entries.length; i < len; i++) {
				if ($scope.entries[i].id === id) {
					$scope.entries.remove($scope.entries[i]);
					break;
				}
			}
		});
		$scope.$on('cruisemonkey.tweet.refresh', function(ev, keepPosition) {
			$scope.doRefresh(keepPosition);
		});
		$scope.$on('cruisemonkey.notify.tweetPosted', function(ev, tweetId) {
			Twitarr.getTweet(tweetId).then(function(response) {
				var tweet = response.post;
				lookupUser(tweet.author.username);

				// look for an existing tweet by this ID and update it
				for (var i=0, len=$scope.entries.length, entry; i < len; i++) {
					entry = $scope.entries[i];
					if (entry.id === tweet.id) {
						$log.debug('tweet updated: ' + angular.toJson(entry));
						var updated = angular.copy(entry);
						updated.text = tweet.text;
						updated.photo = tweet.photo;
						updateTweet(updated);
						$scope.entries[i] = updated;
						$scope.$broadcast('scroll.refreshComplete');
						return;
					}
				}
				// otherwise, it's a new tweet
				prependTweets([tweet]);
			});
		});

		var resetController = function resetController() {
			$log.info('CMTwitarrStreamCtrl: resetting all data');
			$scope.done = true;
			updateEntries([]);
			$scope.error = undefined;
			$scope.unreadCount = 0;
			$scope.users = {};
			$scope.setStreamType(defaultStreamType);
			delete $scope.twitarrRoot;
		};

		var refreshWait = 100;

		$scope.$on('cruisemonkey.wipe-cache', function() {
			$log.info('CMTwitarrStreamCtrl: wiping cache.');
			resetController();
			if ($scope.isVisible) {
				$timeout($scope.doRefresh, refreshWait);
			}
		});
		$scope.$on('cruisemonkey.user.updated', function() {
			$timeout($scope.doRefresh, refreshWait);
		});
		$scope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
			if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
				$log.info('CMTwitarrStreamCtrl: wiping cache (Twit-arr root changed).');
				resetController();
				if ($scope.isVisible) {
					$timeout($scope.doRefresh, refreshWait);
				}
			}
		});
		$scope.$on('cruisemonkey.user.toggle-starred', function(ev, starred) {
			$timeout($scope.doRefresh, refreshWait);
		});

		$scope.$on('$ionicView.beforeEnter', function() {
			loadCache();

			//$ionicListDelegate.closeOptionButtons();
			if (!$scope.entries || $scope.entries.length === 0) {
				$ionicLoading.show({
					template: 'Loading...',
					duration: 5000,
					noBackdrop: true
				});
			}
			loadCache();
			$scope.isVisible = true;
			$scope.doRefresh(false);
		});
		$scope.$on('$ionicView.beforeLeave', function() {
			$scope.isVisible = false;
		});
		$scope.$on('$ionicView.unloaded', function() {
			resetController();
		});
	});
}());
