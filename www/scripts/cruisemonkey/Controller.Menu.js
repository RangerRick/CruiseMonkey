(function() {
	'use strict';

	/*global ionic: true*/

	angular.module('cruisemonkey.controllers.Menu', [
	])
	.controller('CMMenuCtrl', ['$scope', '$templateCache', '$ionicPopover', '$cordovaKeyboard', 'storage', 'UserService', function($scope, $templateCache, $ionicPopover, $cordovaKeyboard, storage, UserService) {
		console.log('CMMenuCtrl initializing.');

		var loginPopover;

		/** set up the user in the scope **/
		$scope.user = UserService.get();

		storage.bind($scope, 'lastTab', {
			'defaultValue': 'app.events.official',
			'storeName': 'cruisemonkey.menu.last-tab'
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			//console.log('Menu: beforeEnter:',ev,info);
			if (info.stateName && info.stateName.startsWith('app.events.')) {
				$scope.lastTab = info.stateName;
			} else if (info.stateName === 'app.events') {
				var newState = $scope.eventType? ('app.events.' + $scope.eventType) : 'app.events.official';
				console.log('Menu: app.events navigated, going to ' + newState + ' instead.');
				$state.go(newState);
			}
		});

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser, oldUser) {
			if (newUser.loggedIn && !oldUser.loggedIn) {
				console.log('User "' + newUser.username + '" logged in.');
			}
			$scope.user = newUser;
			loginPopover.hide();
			if ($scope.isCordova()) {
				$cordovaKeyboard.close();
			}
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
