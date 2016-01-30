(function() {
	'use strict';

	var emoji = [
		'pirate',
		'zombie',
		'joco',
		'towel-monkey',
		'ship',
		'ship-front',
		'tropical-drink',
		'buffet',
		'hottub',
		'fez',
		'die',
		'die-ship'
	];

	var urlCache = {};
	var tokens = emoji.map(function(e) {
		urlCache[e] = {
			80: require('./images/' + e + '-80.png'),
			500: require('./images/' + e + '-500.png')
		};
		return ':' + e + ':';
	});

	var emojiTemplate = require('ngtemplate!html!./emoji.html');

	angular.module('cruisemonkey.emoji.Emoji', [
		'ionic'
	])
	.controller('EmojiPopupCtrl', function($scope, EmojiService) {
	})
	.factory('EmojiService', function($ionicPopover, $log, $q, $rootScope) {
		var scope = $rootScope.$new();
		var popover;

		$ionicPopover.fromTemplateUrl(emojiTemplate, {
			scope: scope
		}).then(function(p) {
			popover = p;
		});

		var getUrl = function(type, size) {
			return urlCache[type][size];
		};

		scope.getSmall = function(type) {
			return getUrl(type, '80');
		};

		scope.getLarge = function(type) {
			return getUrl(type, '500');
		};

		scope.getTokens = function() {
			return tokens;
		};

		scope.getTypes = function() {
			return emoji;
		};

		scope.chooseEmoji = function(emoji) {
			$rootScope.$broadcast('cruisemonkey.emoji.selected', emoji);
		};

		var showEmoji = function(ev) {
			var deferred = $q.defer();
			var selected, canceled;
			selected = scope.$on('cruisemonkey.emoji.selected', function(ev, emoji) {
				$log.debug('Emoji selected: ' + emoji);
				if (selected) {
					selected();
				}
				if (canceled) {
					canceled();
				}
				popover.hide().then(function() {
					deferred.resolve(emoji);
				});
			});
			canceled = scope.$on('popover.hidden', function() {
				$log.debug('Emoji canceled');
				if (selected) {
					selected();
				}
				if (canceled) {
					canceled();
				}
				popover.hide().then(function() {
					deferred.reject();
				});
			});
			popover.show(ev);
			return deferred.promise;
		};

		return {
			small: scope.getSmall,
			large: scope.getLarge,
			tokens: scope.getTokens,
			types: scope.getTypes,
			show: showEmoji
		};
	});

}());
