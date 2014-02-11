(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Login', [
		'cruisemonkey.Config',
		'cruisemonkey.Cordova',
		'cruisemonkey.Logging',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.User'
	])
	.controller('CMLoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'UserService', 'LoggingService', 'SettingsService', 'CordovaService', 'NotificationService', function($scope, $rootScope, $location, $http, UserService, log, SettingsService, cor, notifications) {
		log.info('Initializing CMLoginCtrl');
		$rootScope.title = "Log In";
		$rootScope.leftButtons = [];

		$rootScope.user = UserService.get();

		$scope.goToTwitarr = function() {
			var twitarrRoot = SettingsService.getTwitarrRoot();
			$rootScope.openUrl(twitarrRoot, '_system');
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
			var oldUser = $rootScope.user;
			$rootScope.user = UserService.reset();
			$rootScope.$broadcast('cm.loggedOut', oldUser);
			$location.path('/events/official');
		};

		$rootScope.rightButtons = [
			{
				type: 'button-positive',
				content: 'Cancel',
				tap: function(e) {
					e.preventDefault();
					$scope.cancel();
				}
			}
		];

		$scope.saveUser = function(user) {
			user.loggedIn = true;
			if (user.username) {
				user.username = user.username.toLowerCase();
			}
			log.info('saving user');
			log.debug(user);
			UserService.save(user);
			$rootScope.user = UserService.get();
		};

		$scope.update = function(user) {
			var twitarrRoot = SettingsService.getTwitarrRoot();

			if (!user.username) {
				notifications.alert('No username! Something went wrong.');
				return;
			}
			user.username = user.username.toLowerCase();

			notifications.status('Logging in...');

			$http({
				method: 'POST',
				url: twitarrRoot + 'api/v2/user/auth',
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
				log.debug('success:',data);
				notifications.removeStatus('Logging in...');
				user.key = data.key;
				$scope.saveUser(user);
				$rootScope.$broadcast('cm.loggedIn', user);
				$location.path('/events/my');
			})
			.error(function(data, status, headers, config) {
				log.warn('failure!');
				notifications.removeStatus('Logging in...');
				log.debug('data:', data);
				log.debug('status:',status);
				log.debug('headers:',headers);
				log.debug('config:',config);

				notifications.alert('Failed to log in to twit-arr! You may need to import the twit-arr certificate in "Advanced" before login will work.');
			});

			return;
		};
	}]);
}());
