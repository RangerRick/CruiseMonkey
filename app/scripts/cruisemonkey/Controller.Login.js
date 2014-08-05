(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Login', [
		'cruisemonkey.Config',
		'cruisemonkey.Cordova',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.User'
	])
	.controller('CMLoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'UserService', 'SettingsService', 'CordovaService', 'NotificationService', function($scope, $rootScope, $location, $http, UserService, SettingsService, cor, notifications) {
		console.info('Initializing CMLoginCtrl');
		$rootScope.headerTitle = "Log In";
		$rootScope.leftButtons = $rootScope.getLeftButtons();

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
			console.info('saving user');
			console.debug(user);
			UserService.save(user);
			$rootScope.user = UserService.get();
		};

		$scope.update = function(user) {
			var twitarrRoot = SettingsService.getTwitarrRoot();

			document.getElementById('loginPassword').blur();
			document.getElementById('loginUsername').blur();
			document.activeElement.blur();

			if (!user.username) {
				notifications.alert('No username! Something went wrong.');
				return;
			}
			user.username = user.username.toLowerCase();

			notifications.status('Logging in...', 10000);

			var host = $location.host();
			if (host === '0.0.0.0' || host === '127.0.0.1' || host === 'localhost') {
				// special case, let Ben log in regardless  ;)
				notifications.removeStatus('Logging in...');
				notifications.status('YOU ARE MAGIC ADMIN', 5000);
				$scope.saveUser(user);
				$rootScope.$broadcast('cm.loggedIn', user);
				$location.path('/events/my');
				return;
			}
			var url = twitarrRoot + 'api/v2/user/auth';
			console.debug('Logging in to ' + url);

			$http({
				method: 'POST',
				url: url,
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
				console.debug('success:',data);
				notifications.removeStatus('Logging in...');
				user.key = data.key;
				$scope.saveUser(user);
				$rootScope.$broadcast('cm.loggedIn', user);
				$location.path('/events/my');
			})
			.error(function(data, status, headers, config) {
				notifications.removeStatus('Logging in...');
				console.warn('failure!');
				console.debug('url:',url);
				console.debug('data:', data);
				console.debug('status:',status);
				console.debug('headers:',headers);
				console.debug('config:',config);
				notifications.alert('Failed to log in to twit-arr! You may need to import the twit-arr certificate in "Advanced" before login will work.');
			});

			return;
		};
	}]);
}());
