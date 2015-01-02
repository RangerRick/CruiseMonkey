(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Menu', [
	])
	.controller('CMMenuCtrl', ['$log', '$rootScope', '$scope', '$ionicModal', 'UserService', function($log, $rootScope, $scope, $ionicModal, UserService) {
		$log.info('CMMenuCtrl initializing.');

		$ionicModal.fromTemplateUrl('template/about.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.aboutModal = modal;
		});
		$ionicModal.fromTemplateUrl('template/help.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.helpModal = modal;
		});
		$ionicModal.fromTemplateUrl('template/advanced.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.settingsModal = modal;
		});
		$ionicModal.fromTemplateUrl('template/login.html', {
			scope: $scope,
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			$scope.loginModal = modal;
		});

		$scope.logOut = function() {
			console.info('Logging out.');
			var oldUser = $rootScope.user;
			$rootScope.user = UserService.reset();
			$rootScope.$broadcast('cm.loggedOut', oldUser);
		};

		$scope.$on('cm.loggedIn', function(event) {
			console.info('User "' + UserService.getUsername() + '" logged in.');
			$scope.loginModal.hide();
		});
		$scope.$on('cm.loggedOut', function(event) {
			console.info('User logged out.');
		});

		$scope.$on('$destroy', function() {
			$scope.aboutModal.remove();
			$scope.helpModal.remove();
			$scope.settingsModal.remove();
			$scope.loginModal.remove();
		});
	}]);
}());
