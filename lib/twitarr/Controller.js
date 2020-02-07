require('../data/DB');

const datetime = require('../util/datetime');
// const translator = require('./translator');

require('ngstorage');
require('ng-fittext');
require('../data/DB');
require('../images/Cache');
require('../images/Viewer');
require('./Editor');

const hashFunc = require('string-hash/index');

const typeChooser = require('./chooser.html');

const detailedFormat = 'dddd, MMMM Do YYYY, h:mm:ss.SSS a';

const decorateTweet = (tweet) => {
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
.controller('CMTweetCtrl', ($ionicLoading, $ionicScrollDelegate, $q, $scope, $stateParams, $localStorage, ImageViewer, SettingsService, Twitarr, UserDetail, UserService) => {
	$scope.openUser = UserDetail.open;
	$scope.user = UserService.get();

	$scope.$storage = $localStorage;

	$scope.$on('cruisemonkey.user.updated', (ev, newUser) => {
		$scope.user = newUser;
	});

	const drawTweets = (tweets) => {
		const newTweets = [];

		for (let i=0, len=tweets.length, tweet; i < len; i++) {
			if (tweets[i].status === 'ok') tweets[i] = tweets[i].post;
			tweet = decorateTweet(tweets[i]);
			newTweets.push(tweet);
		}

		$scope.$storage['cruisemonkey.twitarr.tweet.tweets'] = newTweets;
		$scope.$broadcast('scroll.refreshComplete');
	};

	$scope.scrollTop = () => {
		$ionicScrollDelegate.$getByHandle('tweet-detail').scrollTop(true);
	};

	$scope.doRefresh = () => {
		$q.all({
			tweet: Twitarr.getTweet($stateParams.id),
			twitarrRoot: SettingsService.getTwitarrRoot()
		}).then((res) => {
			$scope.twitarrRoot = res.twitarrRoot;
			const tweet = res.tweet.post;
			if (tweet.parent_chain && tweet.parent_chain.length > 0) {
				return Twitarr.getTweet(tweet.parent_chain[0]).then((parentRes) => {
					const post = parentRes.post;
					let tweets = [post];
					const children = post.children;
					if (Array.isArray(children)) {
						tweets = tweets.concat(children);
					}
					delete post.children;
					drawTweets(tweets);
				});
			} else {
				let tweets = [tweet];
				const children = tweet.children;
				if (Array.isArray(children)) {
					tweets = tweets.concat(children);
				}
				delete tweet.children;
				drawTweets(tweets);
			}
		}).finally(() => {
			$ionicLoading.hide();
		});
		return true;
	};

	$scope.isLiked = (entry) => {
		return entry && entry.likes && (entry.likes.indexOf('You') >= 0 || entry.likes.indexOf($scope.user.username) >= 0);
	};

	$scope.showImage = (photoId, ev) => {
		ImageViewer.show(photoId, ev);
	};

	$scope.$on('$ionicView.beforeEnter', () => {
		const tweets = $scope.$storage['cruisemonkey.twitarr.tweet.tweets'];
		if (!tweets || tweets.length === 0) {
			$ionicLoading.show({
				template: 'Loading...',
				duration: 5000,
				noBackdrop: true
			});
		}
		$scope.doRefresh();
	});
	$scope.$on('$ionicView.afterLeave', () => {
		delete $scope.twitarrRoot;
		delete $scope.displayName;
		delete $scope.displayHandle;
	});
})
.filter('everythingFilter', () => {
	return (input) => {
		//$log.debug('Filter: everything.');
		return input;
	};
})
.filter('myTweetFilter', () => {
	return (input, username) => {
		//$log.debug('Filter: mine.  Username=' + username);
		return input.filter((tweet) => {
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
.filter('reactedTweetFilter', () => {
	return (input /*, username */) => {
		//$log.debug('Filter: starred.  Username=' + username);
		return input.filter((tweet) => {
			const keys = tweet.reactions? Object.keys(tweet.reactions) : [];
			for (let j=0, jlen = keys.length, reaction; j < jlen; j++) {
				reaction = tweet.reactions[j];
				if (reaction.me) {
					return true;
				}
			}
			return false;
		});
	}
})
.filter('starredTweetFilter', () => {
	return (input /*, username */) => {
		//$log.debug('Filter: starred.  Username=' + username);
		const ret = [];
		for (let i=0, len=input.length, tweet; i < len; i++) {
			tweet = input[i];
			if (tweet.author.starred) {
				ret.push(tweet);
			}
		}
		return ret;
	}
})
.filter('cmfilter', ($filter) => {
	return (input, filterType, username) => {
		if (filterType) {
			return $filter(filterType)(input, username);
		}
		return $filter('everythingFilter')(input, username);
	}
})
.controller('CMTwitarrStreamCtrl', ($ionicHistory, $ionicLoading, $ionicPopover, $ionicScrollDelegate, $log, $q, $rootScope, $scope, $localStorage, $timeout, CacheFactory, EmojiService, TweetEditor, Twitarr, UserCache, UserDetail, UserService) => {
	$log.info('Initializing CMTwitarrStreamCtrl');

	if (!CacheFactory.get('tweets')) {
		CacheFactory.createCache('tweets', {
			deleteOnExpire: 'passive',
			maxAge: 60 * 60 * 1000 // 1 hour
		});
	}

	const tweetCache = CacheFactory.get('tweets');
	const defaultStreamType = 'all';

	$scope.e = EmojiService;
	$scope.u = UserService;
	$scope.t = TweetEditor;

	$scope.$storage = $localStorage;
	if (!$scope.$storage['cruisemonkey.twitarr.tweets']) {
		$scope.$storage['cruisemonkey.twitarr.tweets'] = [];
	}

	$scope.entries = undefined;

	const loadCache = () => {
		const cachedTweets = [];
		for (let i=0, len=$scope.$storage['cruisemonkey.twitarr.tweets'].length, tweetId, tweet; i<len; i++) {
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

	const updateTweet = (tweet) => {
		tweetCache.put(tweet.id, decorateTweet(tweet));
	};

	const updateEntries = (entries) => {
		$scope.entries = entries;
		$scope.$storage['cruisemonkey.twitarr.tweets'] = entries.map((entry) => {
			return entry.id;
		});
	};

	$scope.streamTypes = {
		all: {
			enabled: () => { return true; },
			type: 'all',
			description: () => { return 'All Tweets'; },
			query: (nextPage) => {
				return Twitarr.getStream(nextPage);
			}
		},
		mine: {
			enabled: () => { return $scope.user.loggedIn; },
			type: 'mine',
			description: () => { return 'By Me' },
			query: (nextPage) => {
				return Twitarr.getStreamByAuthor(UserService.getUsername(), nextPage);
			}
		},
		mentions: {
			enabled: () => { return $scope.user.loggedIn; },
			type: 'mentions',
			description: () => { return 'Involve Me' },
			query: (nextPage) => {
				return Twitarr.getStreamByMentions(UserService.getUsername(), nextPage);
			}
		},
		reacted: {
			enabled: () => { return $scope.user.loggedIn; },
			type: 'reacted',
			description: () => { return 'Liked Tweets'; }, // TODO 2020: call this "Reacted"
			query: (nextPage) => {
				return Twitarr.getStreamByReacted(nextPage);
			}
		},
		starred: {
			enabled: () => { return $scope.user.loggedIn; },
			type: 'starred',
			description: () => { return 'Starred Users'; },
			query: (nextPage) => {
				return Twitarr.getStreamByStarred(nextPage);
			}
		}
	};
	$scope.users = {};

	const popover = $ionicPopover.fromTemplateUrl(typeChooser, { scope: $scope });
	$scope.openStreamTypePopover = (ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		popover.then((p) => {
			p.show(ev);
		});
	};
	$scope.getStreamTypes = () => {
		const types = angular.copy($scope.streamTypes);
		if (!$scope.user.loggedIn) {
			delete types.mine;
		}
		return types;
	};
	$scope.getStreamType = () => {
		return $scope.$storage['cruisemonkey.twitarr.streamType'] || defaultStreamType;
	};
	$scope.setStreamType = (type, ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$scope.$storage['cruisemonkey.twitarr.streamType'] = type;
		popover.then((p) => {
			p.hide().then(() => {
				$ionicScrollDelegate.$getByHandle('twitarr').scrollTop(false);
				$scope.$evalAsync(() => {
					$scope.doRefresh();
				});
			});
		});
	};

	let newestSeen;
	let currentTop;
	$scope.unreadCount = 0;

	$scope.openUser = UserDetail.open;

	const getIndex = (entry) => {
		if (!entry || $scope.entries === undefined || $scope.entries.length === 0) {
			return undefined;
		}
		for (let i=0, index=0, len=$scope.entries.length; i < len; i++) {
			if ($scope.entries[i].id === entry.id) {
				return index;
			} else {
				index++;
			}
		}
		return undefined;
	};

	const getNewestSeenIndex = () => {
		return getIndex(newestSeen);
	};

	const updateUnreadCount = (index) => {
		$scope.unreadCount = index || getNewestSeenIndex();
		if (!$scope.entries || $scope.entries.length === 0) {
			return;
		}
		const currentView = $ionicHistory.currentView();
		if (currentView && currentView.stateName === 'tab.twitarr') {
			const read = $scope.entries[index];
			if (read) {
				const date = datetime.create(read.timestamp);
				$rootScope.$broadcast('cruisemonkey.notify.mention-seen', date);
			}
		}
	};

	$scope.updateTopVisible = () => {
		$timeout(() => {
			if ($scope.entries === undefined) {
				return;
			}
			for (let i=0, len=$scope.entries.length, entry, elm, offset; i < len; i++) {
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

	$scope.setNewestSeen = (entry) => {
		const index = getIndex(entry),
			newestIndex = getNewestSeenIndex();

		if (newestIndex === undefined || index <= newestIndex) {
			newestSeen = entry;
			updateUnreadCount(index);
		}
	};

	$scope.isLiked = (entry) => {
		return entry && entry.reactions && entry.reactions.like && entry.reactions.like.me;
	};

	const lookupUser = (username) => {
		return UserCache.get(username).then((user) => {
			$scope.users[username] = user;
			return user;
		});
	};

	const prependTweets = (tweets) => {
		const seenUsers = {};
		for (let i=tweets.length, tweet; i >= 0; i--) {
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

	const addTweets = (tweets) => {
		const seenUsers = {};
		const seenIDs = {};
		if ($scope.entries) {
			for (let i=0, len=$scope.entries.length; i < len; i++) {
				seenIDs[$scope.entries[i]] = i;
			}
		} else {
			updateEntries([]);
		}
		for (let i=0, len=tweets.length, tweet, seen; i < len; i++) {
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

	$scope.scrollTop = () => {
		$ionicScrollDelegate.$getByHandle('twitarr').scrollTop(true);
	};

	const findHash = (hash) => {
		let scrollEl, position = 0;
		const elm = document.getElementById(hash);
		if (elm) {
			scrollEl = angular.element(elm);
			while (scrollEl) {
				if (scrollEl.hasClass('scroll-content')) {
					break;
				}
				const offsetTop = scrollEl[0].offsetTop,
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

	const goToEntry = (hash, shouldAnimate) => {
		const hashLocation = findHash(hash);
		$log.debug('scrolling to hash location: ' + hashLocation);
		$timeout(() => {
			$ionicScrollDelegate.$getByHandle('twitarr').scrollTo(0, hashLocation, shouldAnimate);
		});
	};

	$scope.done = false;

	let errors = 0;
	$scope.doRefresh = (keepPosition) => {
		$scope.user = UserService.get();
		$scope.updateTopVisible();

		const topEntry = $scope.entries === undefined? undefined:$scope.entries[0];
		if (keepPosition && currentTop) {
			goToEntry(currentTop.id, false);
		}

		$scope.done = false;
		const streamType = $scope.getStreamType();
		$log.debug('Controller.Twitarr.Stream.doRefresh(' + keepPosition + ') type=' + streamType);
		const func = $scope.streamTypes[streamType].query;
		return func().then((res) => {
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
		}, (err) => {
			errors++;
			$log.error('Controller.Twitarr.Stream: failed to get entries:', err);
			$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
			// retry a few times before giving up on refreshing down
			if (errors >= 5) {
				$scope.done = true;
			}
			return $q.reject(err);
		}).finally(() => {
			updateUnreadCount();
			$ionicLoading.hide();
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.loadMore = () => {
		$log.debug('Controller.Twitarr.Stream.loadMore()');

		if ($scope.done) {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			return;
		}

		let nextPage = 0;
		if ($scope.entries && $scope.entries.length > 0) {
			// get whatever's older than the last entry
			nextPage = $scope.entries[$scope.entries.length-1].timestamp.valueOf() - 1;
		}

		$log.debug('Controller.Twitarr.Stream.loadMore(): next_page=' + datetime.create(nextPage).format(detailedFormat));
		if ($scope.entries && $scope.entries.length > 0) {
			const streamType = $scope.getStreamType();
			const func = $scope.streamTypes[streamType].query;
			return func(nextPage).then((res) => {
				if (res && (res.next_page === undefined || res.next_page === 0)) {
					$scope.done = true;
				}
				if (res && res.stream_posts && res.stream_posts.length > 0) {
					addTweets(res.stream_posts);
				}
			}, (err) => {
				$log.error('Controller.Twitarr.Stream: failed to get more entries:', err);
				$scope.error = 'An error occurred getting posts from Twit-arr.' + (err[0]? '  (Error: ' + err[0] + ')':'');
			}).finally(() => {
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

	$scope.$on('cruisemonkey.tweet.deleted', (ev, id) => {
		for (let i=0, len=$scope.entries.length; i < len; i++) {
			if ($scope.entries[i].id === id) {
				$scope.entries.remove($scope.entries[i]);
				break;
			}
		}
	});
	$scope.$on('cruisemonkey.tweet.refresh', (ev, keepPosition) => {
		$scope.doRefresh(keepPosition);
	});
	$scope.$on('cruisemonkey.notify.tweetPosted', (ev, tweetId) => {
		Twitarr.getTweet(tweetId).then((response) => {
			const tweet = response.post;
			lookupUser(tweet.author.username);

			// look for an existing tweet by this ID and update it
			for (let i=0, len=$scope.entries.length, entry; i < len; i++) {
				entry = $scope.entries[i];
				if (entry.id === tweet.id) {
					$log.debug('tweet updated: ' + angular.toJson(entry));
					const updated = angular.copy(entry);
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

	const resetController = function resetController() {
		$log.info('CMTwitarrStreamCtrl: resetting all data');
		$scope.done = true;
		updateEntries([]);
		$scope.error = undefined;
		$scope.unreadCount = 0;
		$scope.users = {};
		$scope.setStreamType(defaultStreamType);
		delete $scope.twitarrRoot;
	};

	const refreshWait = 100;

	$scope.$on('cruisemonkey.wipe-cache', () => {
		$log.info('CMTwitarrStreamCtrl: wiping cache.');
		resetController();
		if ($scope.isVisible) {
			$timeout($scope.doRefresh, refreshWait);
		}
	});
	$scope.$on('cruisemonkey.user.updated', () => {
		$timeout($scope.doRefresh, refreshWait);
	});
	$scope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
			$log.info('CMTwitarrStreamCtrl: wiping cache (Twit-arr root changed).');
			resetController();
			if ($scope.isVisible) {
				$timeout($scope.doRefresh, refreshWait);
			}
		}
	});
	$scope.$on('cruisemonkey.user.toggle-starred', (/* ev, starred */) => {
		$timeout($scope.doRefresh, refreshWait);
	});

	$scope.$on('$ionicView.beforeEnter', () => {
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
	$scope.$on('$ionicView.beforeLeave', () => {
		$scope.isVisible = false;
	});
	$scope.$on('$ionicView.unloaded', () => {
		resetController();
	});
});
