(function() {
	'use strict';

	/*jshint bitwise: false*/

	var datetime = require('../util/datetime');
	var translator = require('./translator');

	require('ngFitText/src/ng-FitText');
	require('../data/DB');
	require('../images/Cache');
	require('../images/Viewer');
	require('./Editor');

	var hashFunc = require('string-hash/index');

	var typeChooser = require('ngtemplate!html!./chooser.html');

	var detailedFormat = 'dddd, MMMM Do YYYY, h:mm:ss.SSS a';

	var decorateTweet = function(tweet) {
		tweet.tracker = tweet.id + hashFunc(tweet.text);
		tweet.timestamp = datetime.create(tweet.timestamp);
		return tweet;
	};

	angular.module('cruisemonkey.controllers.Twitarr.Stream', [
		'uuid4',
		'ngFitText',
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
	.controller('CMTweetCtrl', function($ionicLoading, $ionicScrollDelegate, $log, $q, $scope, $stateParams, ImageViewer, SettingsService, Twitarr, UserDetail, UserService) {
		$scope.openUser = UserDetail.open;
		$scope.user = UserService.get();

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser) {
			$scope.user = newUser;
		});

		var drawTweets = function(tweets) {
			var newTweets = [];

			for (var i=0, len=tweets.length, tweet; i < len; i++) {
				tweet = decorateTweet(tweets[i]);
				newTweets.push(tweet);
			}

			$scope.tweets = newTweets;
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

				if (res.tweet.parent_chain && res.tweet.parent_chain.length > 0) {
					return Twitarr.getTweet(res.tweet.parent_chain[0]).then(function(parentRes) {
						var tweets = parentRes.children.reverse();
						delete parentRes.children;
						tweets.push(parentRes);
						return drawTweets(tweets);
					});
				} else {
					return drawTweets([res.tweet]);
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
			if (!$scope.tweets || $scope.tweets.length === 0) {
				$ionicLoading.show({
					template: 'Loading...',
					duration: 5000,
					noBackdrop: true
				});
			}
			$scope.doRefresh();
		});
		$scope.$on('$ionicView.afterLeave', function() {
			delete $scope.tweet;
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
			var ret = [];
			for (var i=0, len=input.length, tweet; i < len; i++) {
				tweet = input[i];
				if (tweet.author === username) {
					ret.push(tweet);
				} else if (tweet.mentions && tweet.mentions.length > 0) {
					if (tweet.mentions.includes('You') || tweet.mentions.includes(username)) {
						ret.push(tweet);
					}
				}
			}
			return ret;
		};
	})
	.filter('favoriteTweetFilter', function($log) {
		return function(input, username) {
			//$log.debug('Filter: favorites.  Username=' + username);
			var ret = [];
			for (var i=0, len=input.length, tweet; i < len; i++) {
				tweet = input[i];
				if (tweet.all_likes && tweet.all_likes.length > 0) {
					if (tweet.all_likes.includes('You') || tweet.all_likes.includes(username)) {
						ret.push(tweet);
					}
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
	.controller('CMTwitarrStreamCtrl', function($filter, $interval, $ionicActionSheet, $ionicHistory, $ionicListDelegate, $ionicLoading, $ionicPopover, $ionicPopup, $ionicScrollDelegate, $log, $q, $rootScope, $scope, $timeout, EmojiService, kv, SettingsService, TweetEditor, Twitarr, UserCache, UserDetail, UserService, uuid4) {
		$log.info('Initializing CMTwitarrStreamCtrl');

		$scope.e = EmojiService;
		$scope.u = UserService;
		$scope.t = TweetEditor;

		$scope.streamTypes = {
			all: {
				type: 'all',
				description: function() { return 'Tweets'; },
				query: function(nextPage) {
					return Twitarr.getStream(nextPage);
				}
			},
			mine: {
				type: 'mine',
				description: function() { return '@' + UserService.getUsername(); },
				query: function(nextPage) {
					return Twitarr.getStreamByUser(UserService.getUsername(), nextPage);
				}
			},
			favorite: {
				type: 'favorite',
				description: function() { return 'Favorites'; },
				query: function(nextPage) {
					return Twitarr.getStreamByLikes(UserService.getUsername(), nextPage);
				}
			}
		};
		$scope.streamType = 'all';
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
		$scope.setStreamType = function(type, ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$scope.streamType = type;
			popover.then(function(p) {
				p.hide().then(function() {
					$ionicScrollDelegate.$getByHandle('twitarr').scrollTop(false);
					$scope.doRefresh();
				});
			});
		};

		kv.get('cruisemonkey.stream.type', function(type) {
			$scope.streamType = type;
		});

		var newestSeen;
		var currentTop;
		$scope.unreadCount = 0;

		$scope.openUser = UserDetail.open;

		$scope.updateTopVisible = function() {
			$timeout(function() {
				if ($scope.entries === undefined) {
					return;
				}
				for (var i=0, len=$scope.entries.length, entry, elm, offset; i < len; i++) {
					entry = $scope.entries[i];
					elm = angular.element(document.getElementById(entry.id));
					if (elm) {
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
			return entry && entry.likes && (entry.likes.indexOf('You') >= 0 || $scope.user && entry.likes.indexOf($scope.user.username) >= 0);
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

		var getIndex = function(entry) {
			if (!entry || $scope.entries === undefined) {
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
					decorateTweet(tweet);
					if (!seenUsers[tweet.author]) {
						lookupUser(tweet.author);
					}
					seenUsers[tweet.author]++;
					if ($scope.entries === undefined) {
						$scope.entries = [];
					}
					$scope.entries.unshift(tweet);
				}
			}
			$scope.$broadcast('scroll.refreshComplete');
		};

		var addTweets = function(tweets) {
			var seenUsers = {};
			for (var i=0, len=tweets.length, tweet; i < len; i++) {
				tweet = tweets[i];
				decorateTweet(tweet);
				if (!seenUsers[tweet.author]) {
					lookupUser(tweet.author);
				}
				seenUsers[tweet.author]++;
				if ($scope.entries === undefined) {
					$scope.entries = [];
				}
				$scope.entries.push(tweet);
			}
			if ($scope.entries.length > 500) {
				$scope.entries = $scope.entries.slice(0, 500);
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
			$log.debug('Controller.Twitarr.Stream.doRefresh(' + keepPosition + ')');

			var topEntry = $scope.entries === undefined? undefined:$scope.entries[0];
			if (keepPosition && currentTop) {
				goToEntry(currentTop.id, false);
			}

			$scope.done = false;
			var func = $scope.streamTypes[$scope.streamType].query;
			return func().then(function(res) {
				if (res && (res.next_page === undefined || res.next_page === 0)) {
					$scope.done = true;
				}
				$scope.entries = [];
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
				var func = $scope.streamTypes[$scope.streamType].query;
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
			Twitarr.getTweet(tweetId).then(function(tweet) {
				lookupUser(tweet.author);

				// look for an existing tweet by this ID and update it
				for (var i=0, len=$scope.entries.length, entry; i < len; i++) {
					entry = $scope.entries[i];
					if (entry.id === tweet.id) {
						$log.debug('tweet updated: ' + angular.toJson(entry));
						var updated = angular.copy(entry);
						updated.text = tweet.text;
						updated.photo = tweet.photo;
						decorateTweet(updated);
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
			$scope.entries = [];
			$scope.error = undefined;
			$scope.streamType = 'all';
			$scope.unreadCount = 0;
			$scope.users = {};
			delete $scope.twitarrRoot;
		};

		$scope.$on('cruisemonkey.user.updated', function() {
			$timeout($scope.doRefresh, 30);
		});
		$scope.$on('cruisemonkey.wipe-cache', function() {
			$log.info('CMTwitarrStreamCtrl: wiping cache.');
			resetController();
			if ($scope.isVisible) {
				$timeout($scope.doRefresh, 1000);
			}
		});
		$scope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
			if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
				$log.info('CMTwitarrStreamCtrl: wiping cache (Twit-arr root changed).');
				resetController();
				if ($scope.isVisible) {
					$timeout($scope.doRefresh, 1000);
				}
			}
		});

		$scope.$on('$ionicView.beforeEnter', function() {
			//$ionicListDelegate.closeOptionButtons();
			if (!$scope.entries || $scope.entries.length === 0) {
				$ionicLoading.show({
					template: 'Loading...',
					duration: 5000,
					noBackdrop: true
				});
			}
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
