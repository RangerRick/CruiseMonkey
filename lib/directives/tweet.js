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
.directive('cmTweet', function($ionicActionSheet, $ionicListDelegate, $ionicModal, $ionicPopup, $location, $log, $rootScope, $timeout, EmojiService, ImageViewer, Photos, SettingsService, TweetEditor, Twitarr, UserService) {
	$log.info('cmTweet Initializing.');

	var settings = {};
	SettingsService.getTwitarrRoot().then(function(tr) {
		settings.twitarrRoot = tr;
	});
	settings.user = UserService.get();
	$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
		if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
			settings.twitarrRoot = changed.new.twitarrRoot;
		}
	});
	$rootScope.$on('cruisemonkey.user.updated', function(ev, newUser) {
		settings.user = newUser;
	});

	var dragged = function(ev, tweet) {
		if (Math.abs(ev.gesture.deltaX) > ev.target.offsetWidth * 0.15) {
			var location = '/tab/twitarr/' + tweet.id;
			$location.path(location);
		}
	};

	return {
		scope: true,
		restrict: 'E',
		replace: true,
		templateUrl: tweetTemplate,
		link: function(scope, el, attrs) {
			scope.settings = settings;
			if (attrs.allowRecursion) {
				scope.dragged = dragged;
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