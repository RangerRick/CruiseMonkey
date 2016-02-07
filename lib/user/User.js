(function() {
	'use strict';

	angular.module('cruisemonkey.user.User', [
		'ionic',
		'cruisemonkey.DB'
	])
	.factory('UserService', function($ionicPopover, $log, $rootScope, $timeout, kv) {
		var defaultValue = {
			loggedIn: false,
			username: '',
			password: ''
		};

		var $scope = $rootScope.$new();

		$scope.user = angular.copy(defaultValue);
		$scope.callbacks = [];

		kv.get('cruisemonkey.user').then(function(u) {
			if (u) {
				setUser(u);
			} else {
				setUser(defaultValue);
			}
		});

		$scope.$on('cruisemonkey.user.settings-changed', function(ev, settings) {
			if (settings.old && settings.new && settings.old['twitarr.root'] && settings.new['twitarr.root'] && settings.old['twitarr.root'] !== settings.new['twitarr.root']) {
				$log.debug('Twit-Arr root changed.  Logging out user.');
				var user = getUser();
				user.loggedIn = false;
				delete user.key;
				delete user.password;
				setUser(user);
			}
		});

		var getUser = function() {
			return angular.copy($scope.user);
		};
		var setUser = function(user) {
			var oldUser = getUser();
			var newUser = angular.copy(user);
			newUser.username = newUser.username.toLowerCase();

			if (angular.toJson(oldUser) !== angular.toJson(newUser)) {
				//$log.debug('User.setUser: user has changed.');
				//$log.debug('User.setUser: old=' + angular.toJson(oldUser));
				//$log.debug('User.setUser: new=' + angular.toJson(newUser));
				kv.set('cruisemonkey.user', newUser).then(function(savedUser) {
					$scope.user = savedUser;
					$timeout(function() {
						$rootScope.$broadcast('cruisemonkey.user.updated', savedUser, oldUser);
						//$log.debug('calling ' + $scope.callbacks.length + ' callbacks');
						for (var i=0, len=$scope.callbacks.length, cb; i < len; i++) {
							cb = $scope.callbacks[i];
							$scope.$evalAsync(function() {
								cb(savedUser, oldUser);
							});
						}
					});
				});
			} else {
				$rootScope.$broadcast('cruisemonkey.user.updated', newUser, oldUser);
			}
		};

		var resetUser = function() {
			var user = getUser();
			user.loggedIn = false;
			user.key = undefined;
			user.password = undefined;
			setUser(user);
			return getUser();
		};

		$rootScope.$on('cruisemonkey.wipe-cache', function() {
			resetUser();
		});

		return {
			onUserChanged: function(callback) {
				$scope.callbacks.push(callback);
			},
			loggedIn: function() {
				return getUser().loggedIn;
			},
			getUsername: function() {
				var user = getUser();
				if (user.loggedIn && user.username) {
					return user.username;
				} else {
					return undefined;
				}
			},
			matches: function(username) {
				if (username) {
					username = username.toLowerCase();
				}
				return user.username === username;
			},
			get: function() {
				return getUser();
			},
			save: function(newUser) {
				setUser(newUser);
			},
			reset: resetUser
		};
	});

}());
