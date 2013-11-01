(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Login', ['cruisemonkey.Logging', 'cruisemonkey.User'])
	.controller('CMLoginCtrl', ['$scope', '$rootScope', '$location', 'UserService', 'LoggingService', function($scope, $rootScope, $location, UserService, log) {
		log.info('Initializing CMLoginCtrl');
		$rootScope.title = "Log In";

		$rootScope.user = UserService.get();

		$scope.isUnchanged = function(newUser) {
			var savedUser = UserService.get();
			if (savedUser === null || savedUser === undefined) {
				if (newUser === null || newUser === undefined) {
					return true;
				} else {
					return false;
				}
			}
			return savedUser.username === newUser.username && savedUser.password === newUser.password;
		};

		$scope.reset = function() {
			var user = UserService.get();
			log.info('resetting user: ', user);
			$rootScope.user = user;
			$rootScope.$broadcast('cm.loggedOut');
			$location.path('/events/official');
		};

		$scope.update = function(user) {
			if (user.username === 'official') {
				console.log('Attempt to log in as "official", skipping.');
				$location.path('/events/official');
				return;
			}
			user.loggedIn = true;
			log.info('saving user');
			console.log(user);
			UserService.save(user);
			$rootScope.user = UserService.get();
			$rootScope.$broadcast('cm.loggedIn');
			$location.path('/events/my');
		};
	}]);
}());