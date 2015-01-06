(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Menu', [
	])
	.controller('CMMenuCtrl', ['$rootScope', '$scope', '$ionicPopover', 'UserService', function($rootScope, $scope, $ionicPopover, UserService) {
		console.info('CMMenuCtrl initializing.');

		$ionicPopover.fromTemplateUrl('template/login.html', {
			scope: $scope,
			focusFirstInput: true
		}).then(function(popover) {
			$scope.loginPopover = popover;
		});

		$scope.logOut = function() {
			console.info('Logging out.');
			UserService.reset();
		};

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser, oldUser) {
			if (newUser.loggedIn && !oldUser.loggedIn) {
				console.info('User "' + newUser.username + '" logged in.');
			}
			$scope.loginPopover.hide();
		});

		$scope.$on('$destroy', function() {
			$scope.loginPopover.remove();
		});
	}]);
}());
