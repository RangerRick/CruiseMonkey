(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Logout', ['cruisemonkey.User'])
	.controller('CMLogoutCtrl', ['$rootScope', '$location', 'UserService', function($rootScope, $location, UserService) {
		console.info('Initializing CMLogoutCtrl');
		var oldUser = $rootScope.user;
		$rootScope.user = UserService.reset();
		$rootScope.$broadcast('cm.loggedOut', oldUser);
		$location.path('/events/official').replace();
	}]);
}());
