(function() {
	'use strict';

	/*jshint bitwise: false*/

	var datetime = require('../util/datetime');

	require('angular-cache');
	require('ngFitText/src/ng-FitText');
	require('../images/Cache');
	require('../images/Viewer');

	var hashFunc = require('string-hash/index');

	var d3 = require('d3');

	var post_bisect = d3.bisector(function(a, b) {
		return b.timestamp.valueOf() - a.timestamp.valueOf();
	}).right;

	var detailedFormat = 'dddd, MMMM Do YYYY, h:mm:ss.SSS a';

	var hrefMatch    = /href="([^"]*)"/gmi;
	var userSubMatch = /\#\/user\/([^"]*)/;
	var tagSubMatch  = /\#\/tag\/([^"]*)/;
	var urlSubMatch  = /href="([^"]*)"/i;
	var imgSubMatch  = /<img src="\/img\/emoji\/small\/(\S+)\.png" class="emoji">/gmi;

	var matchers = {};

	var getMatcher = function(type) {
		if (!matchers[type]) {
			matchers[type] = new RegExp('<img src="\/img\/emoji\/small\/' + type + '\.png" class="emoji">');
		}
		return matchers[type];
	};

	var translateText = function(text, EmojiService) {
		if (!text) {
			return text;
		}
		var result = text.match(hrefMatch);
		if (result) {
			for (var i=0, len=result.length, found; i < len; i++) {
				found = result[i].match(userSubMatch);
				if (found) {
					text = text.replace(found.input, 'ng-click="openUser(\'' + found[1] + '\', \$event);"');
				} else {
					found = result[i].match(tagSubMatch);
					if (found) {
						text = text.replace(found.input, 'ng-click="openTag(\'' + found[1] + '\');"');
					} else {
						found = result[i].match(urlSubMatch);
						if (found) {
							text = text.replace(found.input, 'ng-click="openUrl(\'' + found[1] + '\', \'_blank\');"');
						} else {
							/* eslint-disable no-console */
							console.log('Unknown href sub-match: ' + result[i]);
							/* eslint-enable no-console */
						}
					}
				}
			}
		}

		if (EmojiService) {
			var emoji = EmojiService.types();
			for (var i=0, len=emoji.length, t, re; i < len; i++) {
				t = emoji[i];
				re = getMatcher(t);
				text = text.replace(re, '<img src="' + EmojiService.small(t) + '" class="emoji" />');
			}
		}

		return text;
	};

	angular.module('cruisemonkey.controllers.Twitarr.Stream', [
		'uuid4',
		'ngFitText',
		'angular-cache',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.emoji.Emoji',
		'cruisemonkey.images.Cache',
		'cruisemonkey.images.Viewer',
		'cruisemonkey.user.Detail'
	])
	.directive('twitterHtml', function($compile, $log, $parse, EmojiService) {
		var updateElement = function(element, scope, entry) {
			var text = translateText(entry.text, EmojiService);
			element.html(text);
			$compile(element.contents())(scope);
		};

		return function(scope, element, attr) {
			var text;
			if (scope.entry) {
				updateElement(element, scope, scope.entry);
				scope.$watch('entry', function(ev, updatedEntry) {
					updateElement(element, scope, updatedEntry);
				});
			} else if (scope.tweet) {
				updateElement(element, scope, scope.tweet);
				scope.$watch('tweet', function(ev, updatedEntry) {
					updateElement(element, scope, updatedEntry);
				});
			} else {
				updateElement(element, scope, {text:'ERROR!'});
			}
		};
	})
	.controller('CMTweetCtrl', function($ionicLoading, $ionicScrollDelegate, $log, $q, $scope, $stateParams, CacheFactory, ImageViewer, SettingsService, Twitarr, UserDetail) {
		$scope.openUser = UserDetail.open;

		if (!CacheFactory.get('userCache')) {
			CacheFactory.createCache('userCache', {
				deleteOnExpire: 'passive',
				maxAge: 10000
			});
		}
		var userCache = CacheFactory.get('userCache');

		$scope.$on('cruisemonkey.wipe-cache', function() {
			userCache.clear();
		});

		var updateUser = function(tweet) {
			var user = userCache.get(tweet.author);
			if (!user) {
				return Twitarr.getUserInfo(tweet.author).then(function(u) {
					userCache.put(tweet.author, user);

					if (u.display_name && u.displayName !== tweet.author) {
						tweet.displayName = u.display_name;
						tweet.displayHandle = '(@' + tweet.author + ')';
					}
				});
			} else {
				if (user.display_name && user.displayName !== tweet.author) {
					tweet.displayName = user.display_name;
					tweet.displayHandle = '(@' + tweet.author + ')';
				}
				return $q.when(user);
			}
		};

		var drawTweets = function(tweets) {
			var newTweets = [];
			var promises = [];

			for (var i=0, len=tweets.length, tweet; i < len; i++) {
				tweet = tweets[i];

				tweet.timestamp = datetime.create(tweet.timestamp);
				tweet.displayName = '@' + tweet.author;
				tweet.displayHandle = '';

				promises.push(updateUser(tweet));
				newTweets.push(tweet);
			}

			$scope.tweets = newTweets;
			return $q.all(promises).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
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

		$scope.showImage = function(ev) {
			ImageViewer.show($scope.tweet.photo.id, ev);
		};

		$scope.$on('$ionicView.beforeEnter', function() {
			$ionicLoading.show({
				template: 'Loading...',
				duration: 5000,
				noBackdrop: true
			});
			$scope.doRefresh();
		});
		$scope.$on('$ionicView.afterLeave', function() {
			delete $scope.tweet;
			delete $scope.twitarrRoot;
			delete $scope.displayName;
			delete $scope.displayHandle;
		});
	})
	.controller('CMTwitarrStreamCtrl', function($interval, $ionicActionSheet, $ionicHistory, $ionicLoading, $ionicPopup, $ionicScrollDelegate, $log, $q, $rootScope, $scope, $timeout, EmojiService, SettingsService, Twitarr, UserDetail, UserService, uuid4) {
		$log.info('Initializing CMTwitarrStreamCtrl');

		$scope.e = EmojiService;
		$scope.u = UserService;

		$scope.users = {};

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
					if (elm && elm.offset) {
						offset = elm.offset().top;
						if (offset >= 0) {
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

		$scope.getDisplayName = function(user) {
			if ($scope.users[user] && $scope.users[user].display_name && $scope.users[user].display_name !== user) {
				return $scope.users[user].display_name;
			} else {
				return '@' + user;
			}
		};

		$scope.getDisplayHandle = function(user) {
			if ($scope.users[user] && $scope.users[user].display_name && $scope.users[user].display_name !== user) {
				return '(@' + user + ')';
			} else {
				return '';
			}
		};

		$scope.isLiked = function(entry) {
			return entry && entry.likes && (entry.likes.indexOf('You') >= 0 || entry.likes.indexOf($scope.user.username) >= 0);
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
			var now = new Date().getTime();
			if ($scope.users[username]) {
				// update existing users every 10 minutes
				if ($scope.users[username]._refreshed >= now - 600000) {
					return $q.when($scope.users[username]);
				}
			} else {
				$scope.users[username] = {
					username: username,
					_refreshed: now
				};
			}
			return Twitarr.getUserInfo(username).then(function(user) {
				user._refreshed = now;
				$scope.users[username] = user;
			});
		};

		var decorateTweet = function(tweet) {
			tweet.tracker = tweet.id + hashFunc(tweet.text);
			tweet.timestamp = datetime.create(tweet.timestamp);
			if (tweet.text.contains('&amp;')) {
				tweet.text = tweet.text.replace('&amp;', '&');
			}
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

		$scope.toggleLike = function(entry, ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$log.debug('Controller.Twitarr.Stream.toggleLike(' + entry.id + ')');
			var user = UserService.get();
			if (entry.likes && entry.likes.indexOf(user.username) >= 0) {
				// we have already liked it, unlike it
				entry.likes.splice(entry.likes.indexOf(user.username), 1);
				Twitarr.unlike(entry.id).then(function(res) {
				}, function(err) {
					$log.error('Unable to toggle like on ' + entry.id + ':' + err[0]);
				});
			} else {
				if (!entry.likes) {
					entry.likes = [];
				}
				entry.likes.push(user.username);
				Twitarr.like(entry.id).then(function(res) {
				}, function(err) {
					$log.error('Unable to toggle like on ' + entry.id + ':' + err[0]);
				});
			}
		};

		$scope.deleteTweet = function(tweet) {
			return $ionicPopup.confirm({
				title: 'Delete tweet?',
				template: 'Are you sure you want to delete this tweet?'
			}).then(function(res) {
				if (res) {
					for (var i=0, len=$scope.entries.length; i < len; i++) {
						if ($scope.entries[i].id === tweet.id) {
							$scope.entries.remove($scope.entries[i]);
							break;
						}
					}
					return Twitarr.removeTweet(tweet).then(function() {
						$scope.$broadcast('scroll.refreshComplete');
						return true;
					}, function(err) {
						$log.error('Failed to remove tweet: ' + angular.toJson(err));
						$scope.doRefresh(true);
						return $q.reject(err);
					});
				} else {
					return false;
				}
			});
		};

		$scope.tweetOptions = function(tweet, ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$ionicActionSheet.show({
				buttons: [
					{ text: 'Reply' },
					{ text: 'Edit' }
				],
				destructiveText: 'Delete',
				cancelText: 'Cancel',
				buttonClicked: function(index) {
					switch(index) {
						case 0:
							$scope.editTweet({
								tweet:tweet,
								reply:true
							});
							break;
						case 1:
							$scope.editTweet({
								tweet:tweet,
								edit:true
							});
							break;
					}
					return true;
				},
				destructiveButtonClicked: function() {
					$scope.deleteTweet(tweet);
					return true;
				}
			});
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
			return Twitarr.getStream().then(function(res) {
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
				return Twitarr.getStream(nextPage).then(function(res) {
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

		$scope.$on('cruisemonkey.notify.tweetPosted', function(ev, tweet) {
			lookupUser(tweet.author);
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
		$scope.$on('cruisemonkey.user.updated', function() {
			$timeout($scope.doRefresh, 30);
		});

		$scope.$on('$ionicView.beforeEnter', function() {
			$ionicLoading.show({
				template: 'Loading...',
				duration: 5000,
				noBackdrop: true
			});
			$scope.isVisible = true;
			$scope.doRefresh(false);
		});
		$scope.$on('$ionicView.beforeLeave', function() {
			$scope.isVisible = false;
		});
		$scope.$on('$ionicView.unloaded', function() {
			delete $scope.entries;
			delete $scope.users;
			delete $scope.twitarrRoot;
		});
	});
}());
