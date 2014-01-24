(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Logout', ['cruisemonkey.Logging', 'cruisemonkey.User'])
	.controller('CMLogoutCtrl', ['$rootScope', '$location', 'UserService', 'LoggingService', function($rootScope, $location, UserService, log) {
		log.info('Initializing CMLogoutCtrl');
		$rootScope.title = "Logging Out";
		var oldUser = $rootScope.user;
		$rootScope.user = UserService.reset();
		$rootScope.$broadcast('cm.loggedOut', oldUser);
		$location.path('/events/official').replace();
	}]);
}());