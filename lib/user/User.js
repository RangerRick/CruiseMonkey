require('../data/DB');

const defaultValue = {
	loggedIn: false,
	username: '',
	password: ''
};

angular.module('cruisemonkey.user.User', [
	'ionic',
	'cruisemonkey.DB'
])
.factory('UserService', function($ionicPopover, $log, $q, $rootScope, $timeout, kv) {
	const $scope = $rootScope.$new();

	$scope.user = angular.copy(defaultValue);

		const getUser = function() {
			return angular.copy($scope.user);
		};

		const setUser = function(user) {
			const oldUser = getUser();
			const newUser = angular.copy(user);
			newUser.username = newUser.username.toLowerCase();

			return kv.set('cruisemonkey.user', newUser).then((savedUser) => {
				$scope.user = savedUser;

				if (angular.toJson(oldUser) !== angular.toJson(savedUser)) {
					$rootScope.$broadcast('cruisemonkey.user.updated', savedUser, oldUser);
				}

				return savedUser;
			});
		};

		const ready = $q.defer();
		const waitForReady = () => {
			return ready.promise.then(() => {
				return getUser();
			});
		};

		const resetUser = function() {
			const user = getUser();
			user.loggedIn = false;
			user.key = undefined;
			user.password = undefined;
			return setUser(user);
		};

	$rootScope.$on('cruisemonkey.wipe-cache', function() {
		return resetUser();
	});

	kv.get('cruisemonkey.user').then(function(u) {
		let ret;
		if (u) {
			ret = setUser(u);
		} else {
			ret = setUser(defaultValue);
		}
		return ret.then((user) => {
			$rootScope.$broadcast('cruisemonkey.user.updated', user, {});
		});
	}).finally(() => {
		ready.resolve(true);
	});

	$scope.$on('cruisemonkey.user.settings-changed', function(ev, settings) {
		if (settings.old && settings.new && settings.old.twitarrRoot !== settings.new.twitarrRoot) {
			$log.debug('Twit-Arr root changed.  Logging out user.');
			const user = getUser();
			user.loggedIn = false;
			delete user.key;
			delete user.password;
			setUser(user);
		}
	});

	return {
		loggedIn: function() {
			return getUser().loggedIn;
		},
		getUsername: function() {
			const user = getUser();
			if (user && user.loggedIn && user.username) {
				return user.username;
			} else {
				return undefined;
			}
		},
		matches: function(username) {
			if (username) {
				username = username.toLowerCase();
			}
			return $scope.user && $scope.user.username === username;
		},
		get: function() {
			return getUser();
		},
		save: function(newUser) {
			setUser(newUser);
		},
		reset: resetUser,
		waitForReady: waitForReady,
	};
});
