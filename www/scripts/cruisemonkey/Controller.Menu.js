(function() {
	'use strict';

	/*global ionic: true*/

	angular.module('cruisemonkey.controllers.Menu', [
	])
	.controller('CMMenuCtrl', ['$scope', '$state', '$timeout', '$ionicModal', 'storage', 'UserService', function($scope, $state, $timeout, $ionicModal, storage, UserService) {
		console.log('CMMenuCtrl initializing.');

		var loginModal;

		/** set up the user in the scope **/
		$scope.user = UserService.get();

		$scope.unreadSeamail = 0;
		storage.bind($scope, 'lastTab', {
			'defaultValue': 'app.events.official',
			'storeName': 'cruisemonkey.menu.last-tab'
		});

		$scope.logIn = function($event) {
			loginModal.show();
		};

		$scope.logOut = function() {
			console.log('Logging out.');
			UserService.reset();
		};

		$ionicModal.fromTemplateUrl('template/login.html', {
			scope: $scope,
			focusFirstInput: true
		}).then(function(modal) {
			loginModal = modal;
		});

		$scope.$on('cruisemonkey.notify.unreadSeamail', function(ev, count) {
			$scope.unreadSeamail = count;
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			//console.log('Menu: beforeEnter:',ev,info);
			if (info.stateName && info.stateName.startsWith('app.events.')) {
				$scope.lastTab = info.stateName;
			} else if (info.stateName === 'app.events') {
				var newState = $scope.eventType? ('app.events.' + $scope.eventType) : 'app.events.official';
				console.log('Menu: app.events navigated, going to ' + newState + ' instead.');
				$timeout(function() {
					$state.go(newState);
				});
			}
		});

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser, oldUser) {
			if (newUser.loggedIn && !oldUser.loggedIn) {
				console.log('User "' + newUser.username + '" logged in.');
			}
			$scope.user = newUser;
			loginModal.hide();
			$scope.closeKeyboard();
		});

		$scope.$on('$destroy', function() {
			loginModal.remove();
		});
	}]);
}());
