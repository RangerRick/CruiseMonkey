(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Login', [
		'cruisemonkey.Config',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.User'
	])
	.controller('CMLoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'UserService', 'SettingsService', 'Notifications', function($scope, $rootScope, $location, $http, UserService, SettingsService, notifications) {
		console.log('Initializing CMLoginCtrl');

		$scope.oldUser = UserService.get();
		$scope.user = UserService.get();

		$scope.goToTwitarr = function() {
			var twitarrRoot = SettingsService.getTwitarrRoot();
			$rootScope.openUrl(twitarrRoot + 'user/new', '_system');
		};

		$scope.canSubmit = function(newUser) {
			if (newUser.username && newUser.password) {
				return true;
			}
			return false;
		};

		$scope.cancel = function() {
			$scope.user = $scope.oldUser;
		};

		$scope.saveUser = function(user) {
			user.loggedIn = true;
			if (user.username) {
				user.username = user.username.toLowerCase();
			}
			console.log('saving user: ' + user.username);
			UserService.save(user);
		};

		$scope.logIn = function(user) {
			console.log('Logging in.');
			var twitarrRoot = SettingsService.getTwitarrRoot();

			var loginPasswordElement = document.getElementById('loginPassword');
			var loginUsernameElement = document.getElementById('loginUsername');
			if (loginPasswordElement) {
				loginPasswordElement.blur();
			}
			if (loginUsernameElement) {
				loginUsernameElement.blur();
			}
			document.activeElement.blur();

			if (!user.username) {
				return;
			}
			user.username = user.username.toLowerCase();

			var url = twitarrRoot + 'api/v2/user/auth';
			console.log('Logging in to ' + url);

			$http({
				method: 'GET',
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
				var key = data? data.key : undefined;
				console.log('success: ' + key);
				user.key = key;
				$scope.saveUser(user);
				$rootScope.$broadcast('cruisemonkey.notify.toast', { message: 'Logged in as ' + user.username });
			})
			.error(function(data, status, headers, config) {
				console.log('failure!');
				console.log('url:' + url);
				console.log('status:' + status);
				console.log('data:');
				console.log(data);
				console.log('headers:');
				console.log(headers);
				console.log('config:');
				console.log(config);
				$rootScope.$broadcast('cruisemonkey.login.failed');
				$rootScope.$broadcast('cruisemonkey.notify.alert', { message: 'Login failed.' });
			});

			return;
		};

		if ($scope.user.loggedIn) {
			$scope.logIn($scope.user);
		}
	}]);
}());
