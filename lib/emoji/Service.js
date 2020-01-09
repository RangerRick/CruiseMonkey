(function() {
	'use strict';

	var emojiTemplate = require('./emoji.html');
	var utils = require('./utils');

	angular.module('cruisemonkey.emoji.Emoji', [
		'ionic'
	])
	.controller('EmojiPopupCtrl', function($scope, EmojiService) { // eslint-ignore-line @typescript-eslint/no-empty-function
	})
	.factory('EmojiService', function($ionicPopover, $log, $q, $rootScope) {
		var scope = $rootScope.$new();
		var popover;

		$ionicPopover.fromTemplateUrl(emojiTemplate, {
			scope: scope
		}).then(function(p) {
			popover = p;
		});

		scope.getSmall = function(type) {
			return utils.small(type);
		};
		scope.getLarge = function(type) {
			return utils.large(type);
		};
		scope.getTokens = function() {
			return utils.tokens();
		};
		scope.getTypes = function() {
			return utils.list();
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
