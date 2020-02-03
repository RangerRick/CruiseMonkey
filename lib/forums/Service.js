const datetime = require('../util/datetime');

angular.module('cruisemonkey.forums.Service', [
	'cruisemonkey.Twitarr'
])
.factory('ForumService', ($log, Twitarr) => {
	const listForums = () => {
		$log.debug('ForumService.list()');
		return Twitarr.getForums().then((forums) => {
			return forums.map((forum) => {
				forum.timestamp = datetime.create(forum.timestamp);
				return forum;
			});
		});
	};

	const getForum = (id, page) => {
		$log.debug('ForumService.get('+id+')');
		return Twitarr.getForum(id, page).then((forum) => {
			forum.posts = forum.posts.map((post) => {
				post.timestamp = datetime.create(post.timestamp);
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
