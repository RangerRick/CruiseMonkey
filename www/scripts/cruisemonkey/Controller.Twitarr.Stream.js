(function() {
	'use strict';

	/*jshint bitwise: false*/
	/*global moment: true*/

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

	var detailedFormat = "dddd, MMMM Do YYYY, h:mm:ss.SSS a";

	var hrefMatch    = /href="([^"]*)"/gmi;
	var userSubMatch = /\#\/user\/([^"]*)/;
	var tagSubMatch  = /\#\/tag\/([^"]*)/;
	var urlSubMatch  = /href="([^"]*)"/i;

	var translateText = function(text) {
		var result = text.match(hrefMatch), found;
		if (result) {
			for (var i=0; i < result.length; i++) {
				found = result[i].match(userSubMatch);
				if (found) {
					//console.log('user link:', found);
					text = text.replace(found.input, 'ng-click="openUser(\'' + found[1] + '\', \$event);"');
				} else {
					found = result[i].match(tagSubMatch);
					if (found) {
						//console.log('tag link:', found);
						text = text.replace(found.input, 'ng-click="openTag(\'' + found[1] + '\');"');
					} else {
						found = result[i].match(urlSubMatch);
						//console.log('external link:', found);
						text = text.replace(found.input, 'ng-click="openUrl(\'' + found[1] + '\', \'_blank\');"');
					}
				}
			}
		}
		//console.log('text=',text);
		return text;
	};

	angular.module('cruisemonkey.controllers.Twitarr.Stream', [
		'cruisemonkey.Images',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
	])
	.directive('twitterHtml', ['$parse', '$compile', function($parse, $compile) {
		return function(scope, element, attr) {
			var text;
			if (scope.openedTweet) {
				text = translateText(scope.openedTweet.text);
			} else if (scope.entry) {
				text = translateText(scope.entry.text);
			} else {
				return;
			}
			//console.log('twitterHtml.text=',text);
			element.html(text);
			$compile(element.contents())(scope);
		};
	}])
	.controller('CMTwitarrStreamCtrl', ['$q', '$scope', '$timeout', '$ionicLoading', '$ionicModal', '$ionicScrollDelegate', 'Images', 'SettingsService', 'Twitarr', 'UserService', function($q, $scope, $timeout, $ionicLoading, $ionicModal, $ionicScrollDelegate, Images, SettingsService, Twitarr, UserService) {
		console.log('Initializing CMTwitarrStreamCtrl');

		$scope.users = {};
		$scope.entries = [];
		$scope.twitarrRoot = SettingsService.getTwitarrRoot();
		$scope.user = UserService.get();

		$scope.loading = $q.defer();
		$scope.loading.resolve();

		var newestSeen;
		var currentTop;
		$scope.unreadCount = 0;

		$scope.updateTopVisible = function() {
			//console.log('updateTopVisible()');
			$timeout(function() {
				var i, entry;
				for (i=0; i < $scope.entries.length; i++) {
					entry = $scope.entries[i];
					var elm = angular.element(document.getElementById(entry.id));
					var offset = elm.offset().top;
					if (offset >= 0) {
						// console.log('updateTopVisible(): top = ' + entry.text);
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

			// console.log('setNewestSeen: index=' + index + ', newestIndex=' + newestIndex);
			if (newestIndex === undefined || index <= newestIndex) {
				newestSeen = entry;
				updateUnreadCount(index);
			}
		};

		$ionicModal.fromTemplateUrl('template/tweet-detail.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.tweetModal = modal;
		});

		$scope.closeTweet = function() {
			$scope.tweetModal.hide();
			$scope.openedTweet = undefined;
			$scope.openedPhoto = 'images/blank.gif';
		};

		$scope.openTweet = function(tweet) {
			console.log('Opening tweet:',tweet);
			$scope.twitarrRoot = SettingsService.getTwitarrRoot();
			$scope.openedTweet = tweet;
			Images.get($scope.twitarrRoot + 'photo/full/' + tweet.photo.id).then(function(url) {
				$scope.openedPhoto = url;
			});
			$scope.tweetModal.show();
		};

		$scope.getImage = function(url) {
			return Images.get(url);
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

		var addTweets = function(tweets) {
			$scope.user = UserService.get();
			var i, j, k;
			//console.log('TwitarrStream: addTweets:',tweets);
			for (i=0; i < tweets.length; i++) {
				tweets[i].timestamp = moment(tweets[i].timestamp);
				tweets[i].text = translateText(tweets[i].text);
				$scope.entries.push(tweets[i]);
			}
			if ($scope.entries.length > 500) {
				$scope.entries = $scope.entries.slice(0, 500);
			}
		};

		$scope.toggleLike = function(entry) {
			console.log('Controller.Twitarr.Stream.toggleLike(' + entry.id + ')');
			var user = UserService.get();
			if (entry.likes && entry.likes.indexOf(user.username) >= 0) {
				// we have already liked it, unlike it
				entry.likes.splice(entry.likes.indexOf(user.username), 1);
				Twitarr.unlike(entry.id).then(function(res) {
				}, function(err) {
					console.log('Unable to toggle like on ' + entry.id + ':' + err[0]);
				});
			} else {
				if (!entry.likes) {
					entry.likes = [];
				}
				entry.likes.push(user.username);
				Twitarr.like(entry.id).then(function(res) {
				}, function(err) {
					console.log('Unable to toggle like on ' + entry.id + ':' + err[0]);
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
					position += (offsetTop - scrollTop + clientTop);
					scrollEl = scrollEl.parent();
				}
				//console.log('offset='+position);
				return position;
				/* $scope.$broadcast('scroll.scrollTo', 0, position, true); */
			} else {
				console.log("can't find element " + hash);
				return 0;
			}
		};

		var goToEntry = function(hash, shouldAnimate) {
			var hashLocation = findHash(hash);
			console.log('scrolling to hash location: ' + hashLocation);
			$timeout(function() {
				$ionicScrollDelegate.$getByHandle('twitarr').scrollTo(0, hashLocation, shouldAnimate);
			});
		};

		$scope.done = false;

		$scope.doRefresh = function(keepPosition, showLoading) {
			console.log('Controller.Twitarr.Stream.doRefresh(' + keepPosition + ')');
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
				//console.log('Controller.Twitarr.Stream.doRefresh(): ready');
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
					}
					updateUnreadCount();
					$ionicLoading.hide();
					$scope.loading.resolve();
				}, function(err) {
					console.log('Controller.Twitarr.Stream: failed to get entries:', err);
					$scope.$broadcast('scroll.refreshComplete');
					$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
					$scope.done = true;
					$ionicLoading.hide();
					$scope.loading.resolve();
				});
			});
		};

		$scope.loadMore = function() {
			console.log('Controller.Twitarr.Stream.loadMore()');

			if ($scope.done) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
				return;
			}

			$scope.loading.promise.then(function() {
				var nextPage = 0;
				if ($scope.entries.length > 0) {
					// get whatever's older than the last entry
					nextPage = ($scope.entries[$scope.entries.length-1].timestamp.valueOf() - 1);
				}
				console.log('Controller.Twitarr.Stream.loadMore(): next_page=' + moment(nextPage).format(detailedFormat));
				if ($scope.entries.length > 0) {
					$scope.loading = $q.defer();
					Twitarr.getStream(nextPage).then(function(res) {
						//console.log('Controller.Twitarr.Stream: loadMore found:',res);
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
						console.log('Controller.Twitarr.Stream: failed to get more entries:', err);
						$scope.$broadcast('scroll.infiniteScrollComplete');
						$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
						$scope.loading.resolve();
					});
				} else {
					console.log('Controller.Twitarr.Stream.loadMore(): Skipped update.');
				}
			});
		};

		$scope.$on('$ionicView.loaded', function(ev, info) {
			$scope.doRefresh();
		});
	}]);
}());
