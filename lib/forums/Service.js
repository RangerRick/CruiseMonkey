(function() {
	'use strict';

	var datetime = require('../util/datetime');

	angular.module('cruisemonkey.forums.Service', [
		'cruisemonkey.Twitarr'
	])
	.factory('ForumService', function($log, Twitarr) {
		var listForums = function() {
			$log.debug('ForumService.list()');
			return Twitarr.getForums().then(function(forums) {
				return forums.map(function(forum) {
					forum.timestamp = datetime.create(forum.timestamp);
					return forum;
				});
			});
		};

		var getForum = function(id) {
			$log.debug('ForumService.get('+id+')');
			return $q.when({});
			/*
			return Twitarr.getForum(id).then(function(forum) {

			});
			*/
		};

		return {
			list: listForums,
			get: getForum
		};
	})
	;
}());
