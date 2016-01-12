(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic');

	angular.module('cruisemonkey.controllers.Menu', [
		'ionic',
		'cruisemonkey.DB',
		'cruisemonkey.Events',
		'cruisemonkey.user.User',
		'cruisemonkey.Util',
	])
	.controller('CMMenuCtrl', function($rootScope, $scope, $state, $timeout, $ionicModal, $ionicScrollDelegate, kv, util, EventService, UserService) {
		console.log('CMMenuCtrl initializing.');

		var loginModal;

		$scope.unreadSeamail = 0;

		kv.get('cruisemonkey.menu.last-tab').then(function(t) {
			$scope.lastTab = t;
			if (!$scope.lastTab) {
				$scope.lastTab = 'app.events.official';
			}
		});

		$scope.logIn = function($event) {
			loginModal.show();
		};

		$scope.logOut = function() {
			console.log('Logging out.');
			UserService.reset();
		};

		$scope.go = util.go;

		$ionicModal.fromTemplateUrl('template/login.html', {
			scope: $scope,
			focusFirstInput: true
		}).then(function(modal) {
			loginModal = modal;
		});

		$scope.active = function(viewName) {
			if (viewName === $scope.currentView) {
				return 'active';
			}
			return '';
		};

		$scope.$on('cruisemonkey.notify.unreadSeamail', function(ev, count) {
			$scope.unreadSeamail = count;
		});

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser, oldUser) {
			loginModal.hide();
			$scope.closeKeyboard();
		});

		$scope.$on('cruisemonkey.login.succeeded', function() {
			loginModal.hide();
			$scope.closeKeyboard();
		});

		$scope.$on('cruisemonkey.login.failed', function() {
			loginModal.hide();
			$scope.closeKeyboard();
		});

		/** Ionic Events **/

		$rootScope.$on('$ionicView.beforeEnter', function(ev, info) {
			if (info.stateName) {
				console.log('currentView='+info.stateName);
				$scope.currentView = info.stateName;
			}
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			//console.log('Menu: beforeEnter:',ev,info);
			if (info.stateName && info.stateName.startsWith('app.events.')) {
				$scope.lastTab = info.stateName;
				kv.set('cruisemonkey.menu.last-tab', $scope.lastTab);
			} else if (info.stateName === 'app.events') {
				console.log('app.events? this should not happen');
				/*
				var newState = $scope.eventType? ('app.events.' + $scope.eventType) : 'app.events.official';
				console.log('Menu: app.events navigated, going to ' + newState + ' instead.');
				$timeout(function() {
					$state.go(newState);
				});
				*/
			}
		});

		$scope.$on('$destroy', function() {
			loginModal.remove();
		});

	});
}());
