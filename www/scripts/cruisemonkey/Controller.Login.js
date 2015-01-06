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
			$rootScope.openUrl(twitarrRoot, '_system');
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

			document.getElementById('loginPassword').blur();
			document.getElementById('loginUsername').blur();
			document.activeElement.blur();

			if (!user.username) {
				return;
			}
			user.username = user.username.toLowerCase();

			var host = $location.host();
			if (host === '0.0.0.0' || host === '127.0.0.1' || host === 'localhost' || host.toLowerCase() === 'sin.local') {
				// special case, let Ben log in regardless  ;)
				$scope.saveUser(user);
				$rootScope.$broadcast('cruisemonkey.notify.toast', { message: 'Logged in as ' + user.username });
				return;
			}

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
				console.log('success:',data);
				user.key = data.key;
				$scope.saveUser(user);
				$rootScope.$broadcast('cruisemonkey.notify.toast', { message: 'Logged in as ' + user.username });
			})
			.error(function(data, status, headers, config) {
				console.log('failure!');
				console.log('url:',url);
				console.log('data:', data);
				console.log('status:',status);
				console.log('headers:',headers);
				console.log('config:',config);
				$rootScope.$broadcast('cruisemonkey.notify.alert', { message: 'Login failed.' });
			});

			return;
		};
	}]);
}());
