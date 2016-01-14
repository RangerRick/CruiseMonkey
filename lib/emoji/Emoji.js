(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic');

	angular.module('cruisemonkey.emoji.Emoji', [
		'ionic'
	])
	.factory('EmojiService', function($rootScope, $log, $ionicPopover) {
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
			'die-ship',
		];

		var tokens = emoji.map(function(e) {
			return ':' + e + ':';
		});

		return {
			large: function(type) {
				return 'images/emoji/' + type + '-500.png';
			},
			small: function(type) {
				return 'images/emoji/' + type + '-80.png';
			},
			tokens: function() {
				return tokens;
			},
			types: function() {
				return emoji;
			},
		};
	});

}());