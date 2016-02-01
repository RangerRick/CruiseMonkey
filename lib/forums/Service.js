(function() {
	'use strict';

	var moment = require('moment');

	require('moment-timezone');

	angular.module('cruisemonkey.forums.Service', [
		'cruisemonkey.Twitarr'
	])
	.factory('ForumService', function($log, $q, Twitarr) {
		var listForums = function() {
			$log.debug('ForumService.list()');
			return Twitarr.getForums().then(function(forums) {
				return forums.map(function(forum) {
					forum.timestamp = moment(forum.timestamp);
					return forum;
				});
			});
		};

		var getForum = function(id, page) {
			$log.debug('ForumService.get('+id+')');
			return Twitarr.getForum(id, page).then(function(forum) {
				forum.posts = forum.posts.map(function(post) {
					post.timestamp = moment(post.timestamp);
					return post;
				});
				return forum;
			});
		};

		return {
			list: listForums,
			get: getForum
		};
	})
	;
}());
