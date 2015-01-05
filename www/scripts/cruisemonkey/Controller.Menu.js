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
			var oldUser = $rootScope.user;
			$rootScope.user = UserService.reset();
			$rootScope.$broadcast('cm.loggedOut', oldUser);
		};

		$scope.$on('cm.loggedIn', function(event) {
			console.info('User "' + UserService.getUsername() + '" logged in.');
			$scope.loginPopover.hide();
		});
		$scope.$on('cm.loggedOut', function(event) {
			console.info('User logged out.');
		});

		$scope.$on('$destroy', function() {
			$scope.loginPopover.remove();
		});
	}]);
}());
