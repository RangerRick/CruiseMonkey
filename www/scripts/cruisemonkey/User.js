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

		var getUser = function() {
			return angular.copy(storage.get('cruisemonkey.user') || defaultValue);
		};
		var setUser = function(user) {
			var oldUser = getUser();
			var savedUser = angular.copy(user);
			savedUser.username = savedUser.username.toLowerCase();
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
				var existing = getUser();
				if (username) {
					username = username.toLowerCase();
				}
				return existing.username === username;
			},
			'get': function() {
				return getUser();
			},
			'save': function(newUser) {
				setUser(newUser);
			},
			'reset': function() {
				setUser(defaultValue);
				return getUser();
			}
		};
	}]);

}());
