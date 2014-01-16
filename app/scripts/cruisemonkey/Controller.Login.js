(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Login', ['cruisemonkey.Logging', 'cruisemonkey.User', 'cruisemonkey.Config', 'cruisemonkey.Settings'])
	.controller('CMLoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'UserService', 'LoggingService', 'SettingsService', function($scope, $rootScope, $location, $http, UserService, log, SettingsService) {
		log.info('Initializing CMLoginCtrl');
		$rootScope.title = "Log In";

		$rootScope.user = UserService.get();

		$scope.goToTwitarr = function() {
			var twitarrRoot = SettingsService.getTwitarrRoot();
			window.open(twitarrRoot, '_system');
		};

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

		$scope.saveUser = function(user) {
			user.loggedIn = true;
			log.info('saving user');
			console.log(user);
			UserService.save(user);
			$rootScope.user = UserService.get();
		};

		$scope.update = function(user) {
			var twitarrRoot = SettingsService.getTwitarrRoot();

			$http({
				method: 'GET',
				url: twitarrRoot + 'api/v1/user/auth',
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
				$scope.saveUser(user);
				$rootScope.$broadcast('cm.loggedIn');
				$location.path('/events/my');
			})
			.error(function(data, status, headers, config) {
				console.log('failure!');
				console.log('data:', data);
				console.log('status:',status);
				console.log('headers:',headers);
				console.log('config:',config);

				$scope.saveUser(user);
				$rootScope.$broadcast('cm.loggedIn');
				$location.path('/events/my');

				if ($rootScope.isCordova) {
					navigator.notification.alert('Failed to log in to twit-arr!', function(){});
				} else {
					window.alert('Failed to log in to twit-arr!');
				}
			});

			return;
		};
	}]);
}());
