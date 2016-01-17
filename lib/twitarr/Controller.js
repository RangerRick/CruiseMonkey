(function() {
	'use strict';

	/*jshint bitwise: false*/

	var angular = require('angular'),
		moment = require('moment');

	require('moment-timezone');
	require('ngFitText/src/ng-FitText');
	require('../images/Viewer');

	var d3 = {};

	function d3_ascending(a, b) {
		return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	d3.ascending = d3_ascending;

	function d3_bisector(compare) {
		return {
			left: function(a, x, lo, hi) {
				if (arguments.length < 3) { lo = 0; }
				if (arguments.length < 4) { hi = a.length; }
				while (lo < hi) {
					var mid = lo + hi >>> 1;
					if (compare(a[mid], x) < 0) { lo = mid + 1; }
					else { hi = mid; }
				}
				return lo;
			},
			right: function(a, x, lo, hi) {
				if (arguments.length < 3) { lo = 0; }
				if (arguments.length < 4) { hi = a.length; }
				while (lo < hi) {
					var mid = lo + hi >>> 1;
					if (compare(a[mid], x) > 0) { hi = mid; }
					else { lo = mid + 1; }
				}
				return lo;
			}
		};
	}

	var d3_bisect = d3_bisector(d3_ascending);
	d3.bisectLeft = d3_bisect.left;
	d3.bisect = d3.bisectRight = d3_bisect.right;

	d3.bisector = function(f) {
		return d3_bisector(f.length === 1? function(d, x) { return d3_ascending(f(d), x); } : f);
	};

	var post_bisect = d3.bisector(function(a, b) {
		return b.timestamp.valueOf() - a.timestamp.valueOf();
	}).right;

	var detailedFormat = 'dddd, MMMM Do YYYY, h:mm:ss.SSS a';

	var hrefMatch    = /href="([^"]*)"/gmi;
	var userSubMatch = /\#\/user\/([^"]*)/;
	var tagSubMatch  = /\#\/tag\/([^"]*)/;
	var urlSubMatch  = /href="([^"]*)"/i;

	var translateText = function(text, EmojiService) {
		var result = text.match(hrefMatch);
		if (result) {
			for (var i=0, len=result.length, found; i < len; i++) {
				found = result[i].match(userSubMatch);
				if (found) {
					//$log.debug('user link:', found);
					text = text.replace(found.input, 'ng-click="openUser(\'' + found[1] + '\', \$event);"');
				} else {
					found = result[i].match(tagSubMatch);
					if (found) {
						//$log.debug('tag link:', found);
						text = text.replace(found.input, 'ng-click="openTag(\'' + found[1] + '\');"');
					} else {
						found = result[i].match(urlSubMatch);
						//$log.debug('external link:', found);
						text = text.replace(found.input, 'ng-click="openUrl(\'' + found[1] + '\', \'_blank\');"');
					}
				}
			}
		}

		if (EmojiService) {
			var emoji = EmojiService.types();
			for (var i=0, len=emoji.length, t; i < len; i++) {
				t = emoji[i];
				text = text.replace(new RegExp('\:' + t + '\:', 'gmi'), '<img src="' + EmojiService.small(t) + '" class="emoji" />');
			}
		}

		//$log.debug('text=',text);
		return text;
	};

	angular.module('cruisemonkey.controllers.Twitarr.Stream', [
		'uuid4',
		'ngFitText',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.emoji.Emoji',
		'cruisemonkey.images.Viewer',
		'cruisemonkey.user.Detail'
	])
	.directive('twitterHtml', function($compile, $log, $parse, EmojiService) {
		return function(scope, element, attr) {
			var text;
			if (scope.entry) {
				text = translateText(scope.entry.text, EmojiService);
			} else if (scope.tweet) {
				text = translateText(scope.tweet.text, EmojiService);
			} else {
				text = 'ERROR!';
			}
			//$log.debug('twitterHtml.text=',text);
			element.html(text);
			$compile(element.contents())(scope);
		};
	})
	.controller('CMTweetCtrl', function($log, $scope, ImageViewer, tweet, twitarrRoot, UserDetail) {
		tweet.timestamp = moment(tweet.timestamp);

		$scope.tweet = tweet;
		$scope.twitarrRoot = twitarrRoot;
		$scope.openUser = UserDetail.open;

		if (tweet.authorUser) {
			var user = tweet.authorUser;
			if (user.display_name && user.displayName !== tweet.author) {
				$scope.displayName = user.display_name;
				$scope.displayHandle = '(@' + tweet.author + ')';
			} else {
				$scope.displayName = '@' + tweet.author;
				$scope.displayHandle = '';
			}
		} else {
			$scope.displayName = '@' + tweet.author;
		}

		$scope.showImage = function() {
			ImageViewer.show($scope.tweet.photo.id);
		};
	})
	.controller('CMTwitarrStreamCtrl', function($q, $scope, $log, $interval, $timeout, $ionicLoading, $ionicScrollDelegate, EmojiService, SettingsService, Twitarr, UserDetail, UserService, uuid4) {
		$log.info('Initializing CMTwitarrStreamCtrl');

		$scope.users = {};
		$scope.entries = [];
		$scope.e = EmojiService;
		$scope.u = UserService;

		$scope.loading = $q.defer();
		$scope.loading.resolve();

		var newestSeen;
		var currentTop;
		$scope.unreadCount = 4;

		$scope.openUser = UserDetail.open;

		var processTweet;
		processTweet = function(tweet) {
			tweet.timestamp = moment(tweet.timestamp);
			//tweet.text = translateText(tweet.text);
			//$log.debug('processTweet: ' + angular.toJson(tweet));
			return tweet;
		};

		$scope.updateTopVisible = function() {
			//$log.debug('updateTopVisible()');
			$timeout(function() {
				for (var i=0, len=$scope.entries.length, entry, elm, offset; i < len; i++) {
					entry = $scope.entries[i];
					elm = angular.element(document.getElementById(entry.id));
					offset = elm.offset().top;
					if (offset >= 0) {
						// $log.debug('updateTopVisible(): top = ' + entry.text);
						currentTop = entry;
						$scope.setNewestSeen(entry);
						break;
					}
				}
			});
		};

		$scope.setNewestSeen = function(entry) {
			var index = getIndex(entry),
				newestIndex = getNewestSeenIndex();

			// $log.debug('setNewestSeen: index=' + index + ', newestIndex=' + newestIndex);
			if (newestIndex === undefined || index <= newestIndex) {
				newestSeen = entry;
				updateUnreadCount(index);
			}
		};

		$scope.getDisplayName = function(user) {
			if ($scope.users[user] && $scope.users[user].display_name) {
				return $scope.users[user].display_name;
			} else {
				return user;
			}
		};

		$scope.getDisplayHandle = function(user) {
			if ($scope.users[user] && $scope.users[user].display_name && $scope.users[user].display_name !== user) {
				return '(@' + user + ')';
			} else {
				return '';
			}
		};

		var updateUnreadCount = function(index) {
			$scope.unreadCount = index || getNewestSeenIndex();
		};

		var getIndex = function(entry) {
			if (!entry) {
				return undefined;
			}
			var i, index=0;
			for (i=0; i < $scope.entries.length; i++) {
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
			Twitarr.getUserInfo(username).then(function(user) {
				$scope.users[username] = user;
			});
		};

		var prependTweets = function(tweets) {
			var seenUsers = {};
			var prepend = [];
			for (var i=0, len=tweets.length, tweet; i < len; i++) {
				tweet = processTweet(tweets[i]);
				lookupUser(tweet.author);
				prepend.push(tweet);
			}
			$scope.entries.splice(0, 0, prepend);
		};

		var addTweets = function(tweets) {
			var seenUsers = {};
			//$log.debug('TwitarrStream: addTweets:',tweets);
			for (var i=0, len=tweets.length, tweet; i < len; i++) {
				tweet = processTweet(tweets[i]);
				if (!seenUsers.hasOwnProperty(tweet.author)) {
					lookupUser(tweet.author);
				}
				seenUsers[tweet.author]++;
				$scope.entries.push(tweet);
			}
			if ($scope.entries.length > 500) {
				$scope.entries = $scope.entries.slice(0, 500);
			}
		};

		$scope.toggleLike = function(entry) {
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
				//$log.debug('offset='+position);
				return position;
				/* $scope.$broadcast('scroll.scrollTo', 0, position, true); */
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

		$scope.doRefresh = function(keepPosition, showLoading) {
			$scope.updateTopVisible();
			$log.debug('Controller.Twitarr.Stream.doRefresh(' + keepPosition + ')');
			if (showLoading) {
				$ionicLoading.show({
					template: 'Refreshing stream...'
				});
			}
			var topEntry = $scope.entries[0];
			if (keepPosition && currentTop) {
				goToEntry(currentTop.id, false);
			}
			$scope.loading.promise.then(function() {
				$scope.done = false;
				//$log.debug('Controller.Twitarr.Stream.doRefresh(): ready');
				$scope.loading = $q.defer();
				Twitarr.getStream().then(function(res) {
					if (res && (res.next_page === undefined || res.next_page === 0)) {
						$scope.done = true;
					}
					$scope.entries = [];
					if (res && res.stream_posts && res.stream_posts.length > 0) {
						addTweets(res.stream_posts);
						$scope.$broadcast('scroll.refreshComplete');
						if (keepPosition) {
							if (currentTop) {
								goToEntry(currentTop.id, false);
							} else if (topEntry) {
								goToEntry(topEntry.id, false);
							}
						}
					} else {
						$scope.$broadcast('scroll.refreshComplete');
					}
					$scope.error = undefined;
					updateUnreadCount();
					$ionicLoading.hide();
					$scope.loading.resolve();
				}, function(err) {
					$log.error('Controller.Twitarr.Stream: failed to get entries:', err);
					$scope.$broadcast('scroll.refreshComplete');
					$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
					$scope.done = true;
					$ionicLoading.hide();
					$scope.loading.resolve();
				});
			});
		};

		$scope.loadMore = function() {
			$log.debug('Controller.Twitarr.Stream.loadMore()');

			if ($scope.done) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
				return;
			}

			$scope.loading.promise.then(function() {
				var nextPage = 0;
				if ($scope.entries.length > 0) {
					// get whatever's older than the last entry
					nextPage = $scope.entries[$scope.entries.length-1].timestamp.valueOf() - 1;
				}
				$log.debug('Controller.Twitarr.Stream.loadMore(): next_page=' + moment(nextPage).format(detailedFormat));
				if ($scope.entries.length > 0) {
					$scope.loading = $q.defer();
					Twitarr.getStream(nextPage).then(function(res) {
						//$log.debug('Controller.Twitarr.Stream: loadMore found:',res);
						if (res && (res.next_page === undefined || res.next_page === 0)) {
							$scope.done = true;
						}
						if (res && res.stream_posts && res.stream_posts.length > 0) {
							addTweets(res.stream_posts);
						}
						$scope.updateTopVisible();
						$scope.$broadcast('scroll.infiniteScrollComplete');
						$scope.loading.resolve();
					}, function(err) {
						$log.error('Controller.Twitarr.Stream: failed to get more entries:', err);
						$scope.$broadcast('scroll.infiniteScrollComplete');
						$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
						$scope.loading.resolve();
					});
				} else {
					$log.debug('Controller.Twitarr.Stream.loadMore(): Skipped update.');
				}
			});
		};

		$scope.doRefresh();

		$scope.$on('cruisemonkey.notify.tweetPosted', function(ev, tweet) {
			prependTweets([tweet]);
		});

		$scope.$on('$ionicView.loaded', function(ev, info) {
			// $scope.doRefresh();
		});
	});
}());
