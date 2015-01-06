(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Menu', [
	])
	.controller('CMMenuCtrl', ['$rootScope', '$scope', '$ionicPopover', 'UserService', function($rootScope, $scope, $ionicPopover, UserService) {
		console.log('CMMenuCtrl initializing.');

		/** set up the user in the scope **/
		$scope.user = UserService.get();
		var loginPopover;

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser, oldUser) {
			if (newUser.loggedIn && !oldUser.loggedIn) {
				console.log('User "' + newUser.username + '" logged in.');
			}
			$scope.user = newUser;
			loginPopover.hide();
		});

		$scope.logIn = function($event) {
			loginPopover.show($event);
		};

		$scope.logOut = function() {
			console.log('Logging out.');
			UserService.reset();
		};

		$ionicPopover.fromTemplateUrl('template/login.html', {
			scope: $scope,
			focusFirstInput: true
		}).then(function(popover) {
			loginPopover = popover;
		});

		$scope.$on('$destroy', function() {
			loginPopover.remove();
		});
	}]);
}());
