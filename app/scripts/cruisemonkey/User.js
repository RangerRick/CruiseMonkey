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
				if ($rootScope.testFlight) {
					$rootScope.testFlight.addCustomEnvironmentInformation(function() {
						// success
						console.log('username submitted to testflight');
					}, function() {
						// failure
					}, 'username', newUser.username);
				}
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
