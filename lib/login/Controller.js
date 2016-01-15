(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic');

	angular.module('cruisemonkey.controllers.Login', [
		'cruisemonkey.Config',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.user.User'
	])
	.controller('CMLoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'UserService', 'SettingsService', 'Notifications', function($scope, $rootScope, $location, $http, UserService, SettingsService, notifications) {
		console.log('Initializing CMLoginCtrl');

		$scope.oldUser = UserService.get();
		$scope.user = UserService.get();

		$scope.$on('cruisemonkey.user.updated', function(ev, user, oldUser) {
			$scope.user = user;
			$scope.oldUser = user;
			if (user.loggedIn && !oldUser.loggedIn) {
				$rootScope.$broadcast('cruisemonkey.notify.toast', { message: 'Logged in as ' + user.username });
			}
		});

		$scope.goToTwitarr = function() {
			$rootScope.openUrl($scope.twitarrRoot + 'user/new', '_system');
		};

		$scope.goToLostPassword = function() {
			$rootScope.openUrl($scope.twitarrRoot + 'user/forgot_password', '_system');
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

		$scope.logOut = function() {
			console.log('Logging out.');
			var user = angular.copy($scope.user);
			user.loggedIn = false;
			user.key = undefined;
			user.password = undefined;
			UserService.save(user);
		};

		$scope.logIn = function(user) {
			console.log('Logging in.');

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

			var url = $rootScope.twitarrRoot + 'api/v2/user/auth';
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
				console.log('success: ' + angular.toJson(data));
				user.key = key;
				$scope.saveUser(user);
				$http({
					method: 'GET',
					url: $rootScope.twitarrRoot + 'api/v2/user/whoami?key=' + key,
					timeout: 5000,
					headers: {
						Accept: 'application/json'
					}
				}).success(function(data, status, headers, config) {
					//console.log('user = ' + angular.toJson(data));
					if (data && data.status === 'ok' && data.user) {
						var keys = Object.keys(data.user);
						for (var i=0, len=keys.length, key; i < len; i++) {
							key = keys[i];
							user[key] = data.user[key];
						}
						$scope.saveUser(user);
						console.log('user=' + angular.toJson(user));
					}
				});
			})
			.error(function(data, status, headers, config) {
				console.log('failure!');
				console.log('url:' + url);
				console.log('status:' + status);
				console.log('data: ' + angular.toJson(data));
				console.log('headers: ' + angular.toJson(config));
				console.log('config: ' + angular.toJson(config));
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
