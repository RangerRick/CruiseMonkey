(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic');

	require('../util/HTTP');

	angular.module('cruisemonkey.controllers.Login', [
		'cruisemonkey.Config',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.user.User',
		'cruisemonkey.util.HTTP'
	])
	.controller('CMLoginCtrl', function($ionicPopup, $location, $log, $rootScope, $scope, cmHTTP, Notifications, SettingsService, UserService) {
		$log.info('Initializing CMLoginCtrl');

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
			SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				$rootScope.openUrl(twitarrRoot + 'user/new', '_system');
			});
		};

		$scope.goToLostPassword = function() {
			SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				$rootScope.openUrl(twitarrRoot + 'user/forgot_password', '_system');
			});
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
			$log.debug('saving user: ' + user.username);
			UserService.save(user);
		};

		$scope.logOut = function() {
			$ionicPopup.confirm({
				title: 'Log Out',
				template: 'Are you sure you want to log out?'
			}).then(function(res) {
				if (res) {
					$log.info('Logging out.');
					var user = angular.copy($scope.user);
					user.loggedIn = false;
					user.key = undefined;
					user.password = undefined;
					UserService.save(user);
				}
			});
		};

		$scope.logIn = function(user) {
			$log.info('Logging in.');

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

			return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				var url = $rootScope.twitarrRoot + 'api/v2/user/auth';
				$log.debug('Logging in to ' + url);

				return cmHTTP.get(url, {
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
				.then(function(response) {
					var key = response.data? response.data.key : undefined;
					$log.debug('success: ' + angular.toJson(response));
					user.key = key;
					$scope.saveUser(user);
					return cmHTTP.get(twitarrRoot + 'api/v2/user/whoami?key=' + key, {
						timeout: 5000,
						headers: {
							Accept: 'application/json'
						}
					}).then(function(response) {
						//$log.debug('user = ' + angular.toJson(response.data));
						if (response.data && response.data.status === 'ok' && response.data.user) {
							var keys = Object.keys(response.data.user);
							for (var i=0, len=keys.length, key; i < len; i++) {
								key = keys[i];
								user[key] = response.data.user[key];
							}
							$scope.saveUser(user);
							$log.debug('user=' + angular.toJson(user));
						}
						return user;
					});
				}, function(err) {
					$log.error('Failed to log in!  url=' + url);
					$log.debug('status:' + angular.toJson(err.status));
					$log.debug('data: ' + angular.toJson(err.data));
					$log.debug('headers: ' + angular.toJson(err.config));
					$rootScope.$broadcast('cruisemonkey.login.failed');
					$rootScope.$broadcast('cruisemonkey.notify.alert', { message: 'Login failed.' });
				});
			});
		};

		if ($scope.user.loggedIn) {
			$scope.logIn($scope.user);
		}
	});
}());
