(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Logout', ['cruisemonkey.User'])
	.controller('CMLogoutCtrl', ['$rootScope', '$location', 'UserService', '$log', function($rootScope, $location, UserService, log) {
		log.info('Initializing CMLogoutCtrl');
		$rootScope.headerTitle = "Logging Out";
		$rootScope.leftButtons = $rootScope.getLeftButtons();
		$rootScope.rightButtons = [];
		var oldUser = $rootScope.user;
		$rootScope.user = UserService.reset();
		$rootScope.$broadcast('cm.loggedOut', oldUser);
		$location.path('/events/official').replace();
	}]);
}());
