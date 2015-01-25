(function() {
	'use strict';

	var moduleName = 'cruisemonkey.User';
	angular.module(moduleName, ['angularLocalStorage'])
	.factory('UserService', ['$rootScope', 'storage', function($rootScope, storage) {
		var defaultValue = {
			'loggedIn': false,
			'username': '',
			'password': ''
		};

		$rootScope.user = storage.get('cruisemonkey.user');
		if (!$rootScope.user) {
			$rootScope.user = angular.copy(defaultValue);
		}

		var getUser = function() {
			return angular.copy($rootScope.user);
		};
		var setUser = function(user) {
			var oldUser = getUser();
			var savedUser = angular.copy(user);
			savedUser.username = savedUser.username.toLowerCase();
			$rootScope.user = savedUser;
			storage.set('cruisemonkey.user', savedUser);
			$rootScope.$broadcast('cruisemonkey.user.updated', savedUser, oldUser);
		};

		return {
			'loggedIn': function() {
				return getUser().loggedIn;
			},
			'getUsername': function() {
				var user = getUser();
				if (user.loggedIn && user.username) {
					return user.username;
				} else {
					return undefined;
				}
			},
			'matches': function(username) {
				if (username) {
					username = username.toLowerCase();
				}
				return $rootScope.user.username === username;
			},
			'get': function() {
				return getUser();
			},
			'save': function(newUser) {
				setUser(newUser);
			},
			'reset': function() {
				var user = getUser();
				user.loggedIn = false;
				user.password = undefined;
				setUser(user);
				return getUser();
			}
		};
	}]);

}());
