(function() {
	'use strict';

	require('../user/User');

	angular.module('cruisemonkey.info.Controller', [
		'ionic',
		'cruisemonkey.user.User'
	])
	.controller('CMInfoCtrl', function($log, $scope, UserService) {
		$log.info('Initializing CMInfoCtrl');
		$scope.u = UserService;
	})
	;
}());
