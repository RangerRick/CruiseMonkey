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
					text = text.replace(found.input, 'ng-click="openUser(\'' + found[1] + '\');"');
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
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr'
	])
	.directive('twitterHtml', ['$sce', '$parse', '$compile', function($sce, $parse, $compile) {
		return function(scope, element, attr) {
			var text = translateText(scope.entry.text);
			//console.log('twitterHtml.text=',text);
			element.html(text);
			$compile(element.contents())(scope);
		};
	}])
	.controller('CMTwitarrStreamCtrl', ['$q', '$scope', '$sce', '$compile', '$ionicScrollDelegate', 'SettingsService', 'Twitarr', 'UserService', function($q, $scope, $sce, $compile, $ionicScrollDelegate, SettingsService, Twitarr, UserService) {
		console.log('Initializing CMTwitarrStream');

		$scope.users = {};
		$scope.entries = [];
		$scope.twitarrRoot = SettingsService.getTwitarrRoot();
		$scope.user = UserService.get();

		$scope.loading = $q.defer();
		$scope.loading.resolve();

		var lookupUser = function(username) {
			Twitarr.getUserInfo(username).then(function(user) {
				$scope.users[username] = user;
			});
		};

		var addEvents = function(events) {
			$scope.user = UserService.get();
			var i, j, k;
			console.log('TwitarrStream: addEvents:',events);
			for (i=0; i < events.length; i++) {
				events[i].timestamp = moment(events[i].timestamp);
				events[i].text = translateText(events[i].text);
				$scope.entries.push(events[i]);
				var users = [];
				if (!$scope.users[events[i].author]) {
					users.push(events[i].author);
				}
				if (events[i].likes) {
					for (j=0; j < events[i].likes.length; j++) {
						if (!$scope.users[events[i].likes[j]]) {
							users.push(events[i].likes[j]);
						}
					}
				}
				for (k=0; k < users.length; k++) {
					lookupUser(users[k]);
				}
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
				Twitarr.unlike(entry.id).then(function(res) {
					entry.likes.splice(entry.likes.indexOf(user.username), 1);
				}, function(err) {
					console.log('Unable to toggle like on ' + entry.id + ':' + err[0]);
				});
			} else {
				Twitarr.like(entry.id).then(function(res) {
					if (!entry.likes) {
						entry.likes = [];
					}
					entry.likes.push(user.username);
				}, function(err) {
					console.log('Unable to toggle like on ' + entry.id + ':' + err[0]);
				});
			}
		};

		$scope.reply = function(entry) {
			console.log('Controller.Twitarr.Stream.reply(' + entry.id + ')');
		};

		$scope.openUser = function(username) {
			console.log('Opening User: ' + username);
		};

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('twitarr').scrollTop(true);
		};

		$scope.done = false;

		$scope.doRefresh = function() {
			console.log('Controller.Twitarr.Stream.doRefresh()');
			$scope.loading.promise.then(function() {
				$scope.done = false;
				console.log('Controller.Twitarr.Stream.doRefresh(): ready');
				$scope.loading = $q.defer();
				Twitarr.getStream().then(function(res) {
					if (res && (res.next_page === undefined || res.next_page === 0)) {
						$scope.done = true;
					}
					$scope.entries = [];
					if (res && res.stream_posts && res.stream_posts.length > 0) {
						addEvents(res.stream_posts);
						$scope.$broadcast('scroll.refreshComplete');
					}
					$scope.loading.resolve();
				}, function(err) {
					console.log('Controller.Twitarr.Stream: failed to get entries:', err);
					$scope.$broadcast('scroll.refreshComplete');
					$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
					$scope.done = true;
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
						console.log('Controller.Twitarr.Stream: loadMore found:',res);
						if (res && (res.next_page === undefined || res.next_page === 0)) {
							$scope.done = true;
						}
						if (res && res.stream_posts && res.stream_posts.length > 0) {
							addEvents(res.stream_posts);
						}
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
