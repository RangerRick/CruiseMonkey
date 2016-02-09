'use strict';

require('./deck');
require('./emoji');
require('./hashtag');
require('./link');
require('./tweet');
require('./twitter-html');
require('./user');
require('./user-avatar');
require('./user-display');

angular.module('cruisemonkey.directives.all', [
	'cruisemonkey.directives.deck',
	'cruisemonkey.directives.emoji',
	'cruisemonkey.directives.hashtag',
	'cruisemonkey.directives.link',
	'cruisemonkey.directives.tweet',
	'cruisemonkey.directives.twitter-html',
	'cruisemonkey.directives.user',
	'cruisemonkey.directives.user-avatar',
	'cruisemonkey.directives.user-display'
]);