(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Logout', ['cruisemonkey.Logging', 'cruisemonkey.User'])
	.controller('CMLogoutCtrl', ['$rootScope', '$location', 'UserService', 'LoggingService', function($rootScope, $location, UserService, log) {
		log.info('Initializing CMLogoutCtrl');
		$rootScope.title = "Logging Out";
		$rootScope.user = UserService.reset();

		$location.path('/events/official').replace();
	}]);
}());