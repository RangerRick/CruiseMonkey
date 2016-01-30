(function() {
	'use strict';

	var moment = require('moment');

	require('../user/User');

	angular.module('cruisemonkey.info.Controller', [
		'ionic',
		'cruisemonkey.user.User'
	])
	.controller('CMInfoCtrl', function($log, $scope, UserService) {
		$log.info('Initializing CMInfoCtrl');

		$scope.user = UserService.get();
		UserService.onUserChanged(function(newUser) {
			$scope.user = newUser;
		});
	})
	;
}());
