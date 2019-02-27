'use strict';

var tweetTemplate = require('ngtemplate!html!./tweet.html');

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
.directive('cmTweet', function($log, $rootScope, ImageViewer, SettingsService, TweetEditor, UserService) {
	$log.info('cmTweet Initializing.');

	var settings = { twitarrRoot: $rootScope.twitarrRoot };

	SettingsService.getTwitarrRoot().then(function(tr) {
		settings.twitarrRoot = tr;
	});
	settings.user = UserService.get();
	$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
		if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
			settings.twitarrRoot = changed.new['twitarr.root'];
		}
	});
	$rootScope.$on('cruisemonkey.user.updated', function(ev, newUser) {
		settings.user = newUser;
	});

	return {
		scope: true,
		restrict: 'E',
		replace: true,
		templateUrl: tweetTemplate,
		link: function(scope, el, attrs) {
			scope.settings = settings;
			if (attrs.allowRecursion) {
				scope.allowRecursion = true;
			} else {
				scope.allowRecursion = false;
			}

			scope.i = ImageViewer;
			scope.reply = TweetEditor.reply;
			scope.editTweet = TweetEditor.edit;
			scope.showOptions = TweetEditor.showOptions;
			scope.deleteTweet = TweetEditor.del;
			scope.toggleLike = TweetEditor.toggleLike;
		}
	};
});