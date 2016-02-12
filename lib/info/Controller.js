(function() {
	'use strict';

	require('../user/User');

	angular.module('cruisemonkey.info.Controller', [
		'ionic',
		'cruisemonkey.Settings',
		'cruisemonkey.user.User'
	])
	.controller('CMInfoCtrl', function($log, $scope, $window, SettingsService, UserService) {
		$log.info('Initializing CMInfoCtrl');
		$scope.u = UserService;

		$scope.openForums = function() {
			SettingsService.getTwitarrRoot().then(function(tr) {
				$window.open(tr + '#/forums', '_blank', 'closebuttoncaption=Close,transitionstyle=fliphorizontal');
			});
		};
	})
	;
}());
