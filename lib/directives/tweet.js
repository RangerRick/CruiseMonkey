const datetime = require('../util/datetime');
const tweetTemplate = require('./tweet.html');

require('../util/Photo');

angular.module('cruisemonkey.directives.tweet', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr',
	'cruisemonkey.emoji.Emoji',
	'cruisemonkey.images.Viewer',
	'cruisemonkey.twitarr.Editor',
	'cruisemonkey.user.User'
])
.directive('cmTweet', ($log, $rootScope, $state, ImageViewer, TweetEditor, UserService) => {
	$log.info('cmTweet Initializing.');

	return {
		scope: true,
		restrict: 'E',
		replace: true,
		templateUrl: tweetTemplate,
		link: (scope, el, attrs) => {
			scope.allowRecursion = attrs.allowRecursion === undefined || Boolean(attrs.allowRecursion.trim());
			scope.hideControls = attrs.hideControls !== undefined && Boolean(attrs.hideControls.trim());

			if (attrs.tweet !== undefined) {
				const tweet = scope[attrs.tweet.trim()];
				$log.info('cmTweet: setting scope tweet to:', tweet);
				scope.tweet = tweet;
			}

			scope.twitarrRoot = $rootScope.twitarrRoot;
			$rootScope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
				if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
					scope.twitarrRoot = changed.new.twitarrRoot;
				}
			});

			scope.user = UserService.get();
			$rootScope.$on('cruisemonkey.user.updated', (ev, newUser) => {
				scope.user = newUser;
			});

			scope.hasImageURL = () => {
				return scope.twitarrRoot && scope.twitarrRoot !== undefined && scope.twitarrRoot !== 'undefined' && scope.tweet && scope.tweet.photo;
			};

			scope.getImageURL = () => {
				if (scope.twitarrRoot && scope.twitarrRoot !== 'undefined') {
					return scope.twitarrRoot + 'api/v2/photo/small_thumb/' + scope.tweet.photo.id;
				}
				return undefined;
			};

			scope.getLinkURL = () => {
				if (scope.allowRecursion && !scope.hideControls) {
					return $state.href('tab.twitarr-tweet', { id: scope.tweet.id });
				}
				return '';
			};

			scope.i = ImageViewer;
			scope.reply = TweetEditor.reply;
			scope.editTweet = TweetEditor.edit;
			scope.showOptions = TweetEditor.showOptions;
			scope.deleteTweet = TweetEditor.del;
			scope.toggleLike = TweetEditor.toggleLike;

			scope.timestamp = datetime.moment(scope.tweet.timestamp).fromNow();
		}
	};
});