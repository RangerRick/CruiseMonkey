(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Login', ['cruisemonkey.Logging', 'cruisemonkey.User', 'cruisemonkey.Config'])
	.controller('CMLoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'UserService', 'LoggingService', 'config.twitarr.root', function($scope, $rootScope, $location, $http, UserService, log, twitarrRoot) {
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

		$scope.cancel = function() {
			$rootScope.user = {};
			$rootScope.$broadcast('cm.loggedOut');
			$location.path('/events/official');
		};

		$rootScope.rightButtons = [
			{
				type: 'button-positive',
				content: 'Cancel',
				tap: function(e) {
					$scope.cancel();
				}
			}
		];

		$scope.update = function(user) {
			/*
			$http({
				method: 'GET',
				url: twitarrRoot + '/api/v1/user/auth',
				params: {
					username: user.username,
					password: user.password
				},
				cache: false,
				timeout: 5000,
				headers: {
					Accept: 'application/json'
				}
			})
			.success(function(data, status, headers, config) {
				console.log('success:',data);
			})
			.error(function(data, status, headers, config) {
				console.log('failure:', data);
			});

			return;
			*/

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