(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Logout', ['cruisemonkey.Logging', 'cruisemonkey.User'])
	.controller('CMLogoutCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 'UserService', 'LoggingService', function($scope, $rootScope, $routeParams, $location, UserService, log) {
		log.info('Initializing CMLogoutCtrl');
		$rootScope.title = "Logging Out";
		$rootScope.user = UserService.reset();

		$location.replace();
		$location.path('/events/official');
	}]);
}());