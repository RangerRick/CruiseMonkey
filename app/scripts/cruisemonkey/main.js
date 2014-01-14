(function () {
	'use strict';

	/*global TestFlight: true*/

	angular.module('cruisemonkey',
	[
		'ui.router',
		'ionic',
		'cruisemonkey.Config',
		'cruisemonkey.controllers.About',
		'cruisemonkey.controllers.Advanced',
		'cruisemonkey.controllers.DeckList',
		'cruisemonkey.controllers.Events',
		'cruisemonkey.controllers.Header',
		'cruisemonkey.controllers.Login',
		'cruisemonkey.controllers.Logout',
		'cruisemonkey.Database',
		'cruisemonkey.Navigation',
		'cruisemonkey.Events',
		'cruisemonkey.User',
		'btford.phonegap.ready',
		'angularLocalStorage'
	])
	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/events/official');

		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: 'template/login.html',
				controller: 'CMLoginCtrl'
			})
			.state('logout', {
				url: '/logout',
				templateUrl: 'template/logout.html',
				controller: 'CMLogoutCtrl'
			})
			.state('events', {
				url: '/events/:eventType',
				templateUrl: 'template/event-list.html',
				controller: 'CMEventCtrl'
			})
			.state('deck-plans', {
				url: '/deck-plans/:deck',
				templateUrl: 'template/deck-plans.html',
				controller: 'CMDeckListCtrl'
			})
			.state('about', {
				url: '/about',
				templateUrl: 'template/about.html',
				controller: 'CMAboutCtrl'
			})
			.state('advanced', {
				url: '/advanced',
				templateUrl: 'template/advanced.html',
				controller: 'CMAdvancedCtrl'
			});
	}])
	.run(['$q', '$rootScope', '$window', '$location', '$timeout', '$urlRouter', 'UserService', 'EventService', 'storage', 'phonegapReady', function($q, $rootScope, $window, $location, $timeout, $urlRouter, UserService, EventService, storage, phonegapReady) {
		console.log('CruiseMonkey run() called.');

		$rootScope.safeApply = function(fn) {
			var phase = this.$root.$$phase;
			if(phase === '$apply' || phase === '$digest') {
				if(fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};

		var waiting = $q.defer();
		$rootScope.$on('cm.eventCachePrimed', function() {
			waiting.resolve(true);
		});
		waiting.promise.then(function() {
			// wait a little longer for things to settle down
			$timeout(function() {
				$rootScope.hideSpinner = true;
			}, 3000);
		});

		$window.handleOpenURL = function(url) {
			var translated = url.replace('cruisemonkey://','/');
			$rootScope.safeApply(function() {
				$location.path(translated);
			});
		};

		var initCordova = function() {
			if (window.device) {
				$rootScope.isCordova = true;
				console.log('main: This is a Cordova device!');

				var tf = new TestFlight();
				$rootScope.testFlight = tf;
			} else {
				console.log('main: This is not a Cordova device.');
			}
		};

		$rootScope.isCordova = false;
		if (window.device) {
			initCordova();
		} else {
			phonegapReady(initCordova);
		}

		$rootScope.openLeft = function() {
			$rootScope.sideMenuController.toggleLeft();
		};

		$rootScope.$on('$locationChangeSuccess', function(evt, newUrl, oldUrl) {
			// console.log('locationChangeSuccess:',evt,newUrl,oldUrl);

			$rootScope.user = UserService.get();
			$rootScope.sideMenuController.close();

			evt.preventDefault();

			if (UserService.loggedIn()) {
				$urlRouter.sync();
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				return;
			}

			if (newUrl.endsWith('/events') || newUrl.endsWith('/events/')) {
				$location.path('/events/official');
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				return;
			}

			if (newUrl.endsWith('/events/my')) {
				$location.path('/login');
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				return;
			}

			$urlRouter.sync();
			storage.set('cm.lasturl', newUrl);
			angular.noop();

			return;
		});

		var savedUrl = storage.get('cm.lasturl');
		if (savedUrl) {
			var index = savedUrl.indexOf('#');
			if (index > -1) {
				savedUrl = savedUrl.substring(savedUrl.indexOf('#') + 1);
				$location.path(savedUrl);
			}
		}

		$rootScope.$on('cm.loggedIn', function(event) {
			console.log('User logged in, refreshing menu.');
		});
		$rootScope.$on('cm.loggedOut', function(event) {
			console.log('User logged out, refreshing menu.');
		});
	}])
	;
}());
