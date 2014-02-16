(function() {
	'use strict';

	angular.module('cruisemonkey.User', ['angularLocalStorage'])
	.factory('UserService', ['$rootScope', 'storage', function($rootScope, storage) {
		var defaultValue = {
			'loggedIn': false,
			'username': '',
			'password': ''
		};

		storage.bind($rootScope, '_user', {
			'defaultValue': defaultValue,
			'storeName': 'cm.user'
		});

		return {
			'loggedIn': function() {
				return $rootScope._user.loggedIn;
			},
			'getUsername': function() {
				if ($rootScope._user.loggedIn && $rootScope._user.username) {
					return $rootScope._user.username.toLowerCase();
				} else {
					return undefined;
				}
			},
			'get': function() {
				return angular.copy($rootScope._user);
			},
			'matches': function(username) {
				var existing = $rootScope._user;
				if (existing) {
					existing = existing.toLowerCase();
				}
				if (username) {
					username = username.toLowerCase();
				}
				return existing === username;
			},
			'save': function(newUser) {
				newUser.username = newUser.username.toLowerCase();
				$rootScope._user = angular.copy(newUser);
			},
			'reset': function() {
				$rootScope._user = angular.copy(defaultValue);
				return $rootScope._user;
			}
		};
	}]);

}());
