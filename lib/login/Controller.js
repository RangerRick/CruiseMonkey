require('../conduct/Service');
require('../util/HTTP');

angular.module('cruisemonkey.controllers.Login', [
	'cruisemonkey.conduct.Service',
	'cruisemonkey.Config',
	'cruisemonkey.Notifications',
	'cruisemonkey.Settings',
	'cruisemonkey.user.User',
	'cruisemonkey.util.HTTP'
])
.controller('CMLoginCtrl', ($ionicPopup, $log, $rootScope, $scope, cmHTTP, Conduct, Notifications, SettingsService, UserService) => {
	$log.info('Initializing CMLoginCtrl');

	$scope.defaultTimeout = 20000;
	$scope.oldUser = UserService.get();
	$scope.user = UserService.get();

	$scope.$on('cruisemonkey.user.updated', (ev, newUser, oldUser) => {
		$log.debug('user updated', newUser);
		$scope.user = newUser;
		$scope.oldUser = oldUser;
	});

	$scope.hideConductHeader = false;
	$scope.viewConduct = (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		Conduct.show();
	};

	$scope.goToTwitarr = () => {
		SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			$rootScope.openUrl(twitarrRoot + '#/user/new', '_system');
		});
	};

	$scope.goToLostPassword = () => {
		SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			$rootScope.openUrl(twitarrRoot + '#/user/forgot_password', '_system');
		});
	};

	$scope.canSubmit = (newUser) => {
		if (newUser.username && newUser.password && !$scope.rejectedCoC) {
			return true;
		}
		return false;
	};

	$scope.cancel = () => {
		$scope.user = $scope.oldUser;
	};

	$scope.saveUser = (user) => {
		user.loggedIn = true;
		if (user.username) {
			user.username = user.username.toLowerCase();
		}
		$log.debug('saving user: ' + user.username);
		UserService.save(user);
	};

	$scope.logOut = () => {
		$ionicPopup.confirm({
			title: 'Log Out',
			template: 'Are you sure you want to log out?'
		}).then((res) => {
			if (res) {
				$log.info('Logging out.');
				const user = angular.copy($scope.user);
				user.loggedIn = false;
				user.key = undefined;
				user.password = undefined;
				UserService.save(user);
			}
		});
	};

	$scope.logIn = (user) => {
		$log.info('Logging in.');

		const loginPasswordElement = document.getElementById('loginPassword');
		const loginUsernameElement = document.getElementById('loginUsername');
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

		return SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			const url = $rootScope.twitarrRoot + 'api/v2/user/auth';
			$log.debug('Logging in to ' + url);

			return cmHTTP.get(url, {
				params: {
					username: user.username,
					password: user.password
				},
				cache: false,
				timeout: $scope.defaultTimeout,
				headers: { Accept: 'application/json' }
			})
			.then((response) => {
				const key = response.data? response.data.key : undefined;
				$log.debug('success: ' + angular.toJson(response));
				user.key = key;
				$scope.saveUser(user);
				return cmHTTP.get(twitarrRoot + 'api/v2/user/whoami?key=' + key, {
					timeout: $scope.defaultTimeout,
					headers: { Accept: 'application/json' }
				}).then((response) => {
					//$log.debug('user = ' + angular.toJson(response.data));
					if (response.data && response.data.status === 'ok' && response.data.user) {
						const keys = Object.keys(response.data.user);
						for (let i=0, len=keys.length, key; i < len; i++) {
							key = keys[i];
							user[key] = response.data.user[key];
						}
						$scope.saveUser(user);
						$log.debug('user=' + angular.toJson(user));
						Notifications.toast({ message: 'Logged in as ' + user.username });
					}
					return user;
				});
			}, (err) => {
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
