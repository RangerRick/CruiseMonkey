(function() {
	'use strict';

	/*global ionic: true*/

	angular.module('cruisemonkey.controllers.Menu', [
		'cruisemonkey.Twitarr'
	])
	.controller('CMMenuCtrl', ['$scope', '$state', '$templateCache', '$ionicPopover', '$cordovaKeyboard', 'storage', 'UserService', 'Twitarr', function($scope, $state, $templateCache, $ionicPopover, $cordovaKeyboard, storage, UserService, Twitarr) {
		console.log('CMMenuCtrl initializing.');

		var loginPopover;

		/** set up the user in the scope **/
		$scope.user = UserService.get();

		$scope.seamail = 0;
		storage.bind($scope, 'lastTab', {
			'defaultValue': 'app.events.official',
			'storeName': 'cruisemonkey.menu.last-tab'
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

		Twitarr.getStatus().then(function(res) {
			if (res && res.seamail_unread_count) {
				$scope.seamail = res.seamail_unread_count;
			}
		});

		$scope.$on('cruisemonkey.notify.newSeamail', function(ev, newSeamail) {
			$scope.seamail = newSeamail;
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

		$scope.$on('$destroy', function() {
			loginPopover.remove();
		});
	}]);
}());
