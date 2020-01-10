'use strict';

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
.directive('cmTweet', function($log, $rootScope, ImageViewer, TweetEditor, UserService) {
	$log.info('cmTweet Initializing.');

	return {
		scope: true,
		restrict: 'E',
		replace: true,
		templateUrl: tweetTemplate,
		link: function(scope, el, attrs) {
			if (attrs.allowRecursion) {
				scope.allowRecursion = true;
			} else {
				scope.allowRecursion = false;
			}

			scope.twitarrRoot = $rootScope.twitarrRoot;
			$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
				if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
					scope.twitarrRoot = changed.new['twitarr.root'];
				}
			});

			scope.user = UserService.get();
			$rootScope.$on('cruisemonkey.user.updated', function(ev, newUser) {
				scope.user = newUser;
			});

			scope.hasImageURL = function() {
				return scope.twitarrRoot && scope.twitarrRoot !== undefined && scope.twitarrRoot !== 'undefined' && scope.tweet && scope.tweet.photo;
			};

			scope.getImageURL = function() {
				if (scope.twitarrRoot && scope.twitarrRoot !== 'undefined') {
					return scope.twitarrRoot + 'api/v2/photo/small_thumb/' + scope.tweet.photo.id;
				}
				return undefined;
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
