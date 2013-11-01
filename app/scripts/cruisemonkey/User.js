(function() {
	'use strict';

	angular.module('cruisemonkey.User', ['angularLocalStorage'])
	.factory('UserService', ['$rootScope', 'storage', function($rootScope, storage) {
		storage.bind($rootScope, '_user', {
			'defaultValue': {
				'loggedIn': false,
				'username': '',
				'password': ''
			},
			'storeName': 'cm.user'
		});

		return {
			'loggedIn': function() {
				return $rootScope._user.loggedIn;
			},
			'getUsername': function() {
				if ($rootScope._user.loggedIn) {
					return $rootScope._user.username;
				} else {
					return undefined;
				}
			},
			'get': function() {
				return angular.copy($rootScope._user);
			},
			'save': function(newUser) {
				$rootScope._user = angular.copy(newUser);
			},
			'reset': function() {
				$rootScope._user = {
					'loggedIn': false,
					'username': '',
					'password': ''
				};
				return $rootScope._user;
			}
		};
	}]);

}());