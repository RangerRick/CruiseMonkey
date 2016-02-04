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

module.exports = {
	list: function() {
		return emoji;
	},
	tokens: function() {
		return tokens;
	},
	small: function(name) {
		return urlCache[name]['80'];
	},
	large: function(name) {
		return urlCache[name]['500'];
	}
};