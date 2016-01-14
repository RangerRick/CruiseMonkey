(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic'),
		moment = require('moment');

	angular.module('cruisemonkey.forums.Controller', [
		'cruisemonkey.Twitarr',
		'cruisemonkey.forums.Service',
		'cruisemonkey.user.Detail',
	])
	.controller('CMForumsCtrl', function($log, $scope, forums, UserDetail) {
		$scope.openUser = UserDetail.open;
		$scope.forums = forums;
	})
	.controller('CMForumCtrl', function($log, $scope, forum, UserDetail) {
		$scope.openUser = UserDetail.open;
		$scope.forum = forum;
	})
	;
}());
