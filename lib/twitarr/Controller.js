(function() {
	'use strict';

	/*jshint bitwise: false*/

	var angular = require('angular'),
		moment = require('moment');

	require('moment-timezone');
	require('ngFitText/src/ng-FitText');
	require('../images/Cache');
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
		if (!text) {
			return text;
		}
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
		'cruisemonkey.images.Cache',
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
	.controller('CMTweetCtrl', function($ionicLoading, $log, $q, $scope, $stateParams, ImageViewer, SettingsService, Twitarr, UserDetail) {
		$scope.openUser = UserDetail.open;
		$scope.loading = false;

		$scope.doRefresh = function() {
			$scope.loading = true;
			$q.all({
				tweet: Twitarr.getTweet($stateParams.id),
				twitarrRoot: SettingsService.getTwitarrRoot()
			}).then(function(res) {
				$scope.tweet = res.tweet;
				$scope.tweet.timestamp = moment($scope.tweet.timestamp);

				$scope.twitarrRoot = res.twitarrRoot;

				$scope.displayName = '@' + $scope.tweet.author;
				$scope.displayHandle = '';

				Twitarr.getUserInfo($scope.tweet.author).then(function(user) {
					if (user.display_name && user.displayName !== $scope.tweet.author) {
						$scope.displayName = user.display_name;
						$scope.displayHandle = '(@' + $scope.tweet.author + ')';
					} else {
						$scope.displayName = '@' + $scope.tweet.author;
						$scope.displayHandle = '';
					}
				});

				return $scope.tweet;
			}).finally(function() {
				$scope.loading = false;
			});
			return true;
		};

		$scope.showImage = function() {
			ImageViewer.show($scope.tweet.photo.id);
		};

		$scope.$on('$ionicView.beforeEnter', $scope.doRefresh);
		$scope.$on('$ionicView.afterLeave', function() {
			delete $scope.tweet;
			delete $scope.twitarrRoot;
			delete $scope.displayName;
			delete $scope.displayHandle;
		});
	})
	.controller('CMTwitarrStreamCtrl', function($q, $scope, $log, $interval, $timeout, $ionicScrollDelegate, EmojiService, SettingsService, Twitarr, UserDetail, UserService, uuid4) {
		$log.info('Initializing CMTwitarrStreamCtrl');

		$scope.e = EmojiService;
		$scope.u = UserService;

		$scope.users = {};
		$scope.loading = false;

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
			Twitarr.getUserInfo(username).then(function(user) {
				$scope.users[username] = user;
			});
		};

		var prependTweets = function(tweets) {
			var seenUsers = {};
			for (var i=tweets.length, tweet; i >= 0; i--) {
				tweet = tweets[i];
				if (tweet) {
					tweet.timestamp = moment(tweet.timestamp);
					if (!seenUsers.hasOwnProperty(tweet.author)) {
						lookupUser(tweet.author);
					}
					seenUsers[tweet.author]++;
					if ($scope.entries === undefined) {
						$scope.entries = [];
					}
					$scope.entries.unshift(tweet);
				}
			}
			$log.debug('$scope.entries = ' + angular.toJson($scope.entries));
		};

		var addTweets = function(tweets) {
			var seenUsers = {};
			//$log.debug('TwitarrStream: addTweets:',tweets);
			for (var i=0, len=tweets.length, tweet; i < len; i++) {
				tweet = tweets[i];
				tweet.timestamp = moment(tweet.timestamp);
				if (!seenUsers.hasOwnProperty(tweet.author)) {
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

		$scope.doRefresh = function(keepPosition) {
			$scope.updateTopVisible();
			$log.debug('Controller.Twitarr.Stream.doRefresh(' + keepPosition + ')');

			$scope.loading = true;

			var topEntry = $scope.entries === undefined? undefined:$scope.entries[0];
			if (keepPosition && currentTop) {
				goToEntry(currentTop.id, false);
			}

			$scope.done = false;
			//$log.debug('Controller.Twitarr.Stream.doRefresh(): ready');
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

				$scope.error = undefined;
				updateUnreadCount();
				return true;
			}, function(err) {
				$log.error('Controller.Twitarr.Stream: failed to get entries:', err);
				$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
				$scope.done = true;
				return $q.reject(err);
			}).finally(function() {
				updateUnreadCount();
				$scope.loading = false;
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

			$log.debug('Controller.Twitarr.Stream.loadMore(): next_page=' + moment(nextPage).format(detailedFormat));
			if ($scope.entries && $scope.entries.length > 0) {
				return Twitarr.getStream(nextPage).then(function(res) {
					//$log.debug('Controller.Twitarr.Stream: loadMore found:',res);
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
			prependTweets([tweet]);
		});

		$scope.$on('$ionicView.beforeEnter', function() {
			$scope.doRefresh(false);
		});
		$scope.$on('$ionicView.unloaded', function() {
			delete $scope.entries;
			delete $scope.users;
			delete $scope.twitarrRoot;
		});
	});
}());
