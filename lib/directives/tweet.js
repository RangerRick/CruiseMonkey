const datetime = require('../util/datetime');
const tweetTemplate = require('./tweet.html');

require('../util/Photo');

angular.module('cruisemonkey.directives.tweet', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr',
	'cruisemonkey.emoji.Emoji',
	'cruisemonkey.images.Viewer',
	'cruisemonkey.muffles.Service',
	'cruisemonkey.twitarr.Editor',
	'cruisemonkey.user.User'
])
.directive('cmTweet', ($log, $rootScope, $state, $timeout, ImageViewer, MuffleService, SettingsService, TweetEditor, UserService) => {
	$log.info('cmTweet Initializing.');

	let twitarrRoot;
	const muffleWatchers = [];
	const userWatchers = [];

	SettingsService.getTwitarrRoot((root) => {
		twitarrRoot = root;
	});

	$rootScope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
			twitarrRoot = changed.new.twitarrRoot;
			$log.debug(`cmTweet: twitarrRoot changed: ${twitarrRoot}`);
		}
	});

	$rootScope.$on('cruisemonkey.muffles.refresh', () => {
		$log.debug(`cmTweet: calling ${muffleWatchers.length} tweet muffle refresh triggers.`);
		for (const watcher of muffleWatchers) {
			watcher();
		}
	});

	$rootScope.$on('cruisemonkey.muffles.updated', () => {
		$log.debug(`cmTweet: calling ${muffleWatchers.length} tweet muffle update triggers.`);
		for (const watcher of muffleWatchers) {
			watcher();
		}
	});

	$rootScope.$on('cruisemonkey.user.updated', (ev, newUser) => {
		$log.debug(`cmTweet: calling ${userWatchers.length} tweet user triggers.`);
		for (const watcher of userWatchers) {
			watcher(newUser);
		}
	});

	return {
		scope: true,
		restrict: 'E',
		replace: true,
		templateUrl: tweetTemplate,
		link: (scope, el, attrs) => {
			scope.allowRecursion = attrs.allowRecursion === undefined || Boolean.of(attrs.allowRecursion.trim());
			scope.hideControls = attrs.hideControls !== undefined && Boolean.of(attrs.hideControls.trim());

			if (attrs.tweet !== undefined) {
				const tweet = scope[attrs.tweet.trim()];
				$log.info('cmTweet: setting scope tweet to:', tweet);
				scope.tweet = tweet;
			}

			const username = scope.tweet?.author?.username;

			const configureMuffles = () => {
				scope.muffled = MuffleService.isMuffled(username);
				let expanded = !scope.muffled;
	
				if (attrs.expanded !== undefined) {
					$log.debug(`cmTweet: attrs.expanded is set: ${attrs.expanded}`);
					expanded = Boolean.of(attrs.expanded);
				}
	
				if (scope.focusedTweet === scope.tweet.id) {
					expanded = true;
				}

				scope.expanded = expanded;
			};

			configureMuffles();
			$log.debug(`username=${username}, muffled=${scope.muffled}, expanded=${scope.expanded}`);

			scope.user = UserService.get();

			scope.expand = () => {
				scope.expanded = true;
			};

			scope.getClass = () => {
				const classes = [];
				classes.push(scope.expanded? 'expanded' : 'not-expanded');
				classes.push(scope.muffled? 'muffled' : 'not-muffled');
				return classes.join(' ');
			};

			scope.hasImageURL = () => {
				return twitarrRoot && scope.tweet && scope.tweet.photo;
			};

			scope.getImageURL = () => {
				if (twitarrRoot && twitarrRoot !== 'undefined') {
					return `${twitarrRoot}api/v2/photo/small_thumb/${scope.tweet.photo.id}`;
				}
				return undefined;
			};

			scope.tweetClicked = (ev) => {
				$log.debug(`tweetClicked: expanded=${scope.expanded}, allowRecursion=${scope.allowRecursion}`);
				ev.preventDefault();
				ev.stopPropagation();
				if (scope.expanded) {
					if (scope.allowRecursion) {
						scope.$evalAsync(() => {
							$state.go('tab.twitarr-tweet', { id: scope.tweet.id });
						});
					}
				} else {
					scope.$evalAsync(() => {
						scope.expanded = true;
					});
				}
				return false;
			};

			scope.i = ImageViewer;
			scope.reply = TweetEditor.reply;
			scope.editTweet = TweetEditor.edit;
			scope.showOptions = TweetEditor.showOptions;
			scope.deleteTweet = TweetEditor.del;
			scope.toggleLike = TweetEditor.toggleLike;

			scope.timestamp = datetime.moment(scope.tweet.timestamp).fromNow();

			const onMufflesRefresh = () => {
				configureMuffles();
			};
			muffleWatchers.push(onMufflesRefresh);

			const onUserUpdated = (user) => {
				scope.user = user;
			};
			userWatchers.push(onUserUpdated);

			scope.$on('$ionicView.beforeEnter', () => {
				muffleWatchers.push(onMufflesRefresh);
				userWatchers.push(onUserUpdated);
			});

			scope.$on('$ionicView.afterLeave', () => {
				muffleWatchers.remove(onMufflesRefresh);
				userWatchers.remove(onUserUpdated);
			});
		}
	};
});
