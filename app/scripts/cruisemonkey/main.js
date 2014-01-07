(function () {
	'use strict';

	angular.module('cruisemonkey',
	[
		'ionic',
		'ngRoute',
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
		'btford.phonegap.ready'
	])
	.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
		// Needed for routing to work
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

		$routeProvider
			.when('/login', {
				templateUrl: 'template/login.html',
				controller: 'CMLoginCtrl'
			})
			.when('/logout', {
				templateUrl: 'template/logout.html',
				controller: 'CMLogoutCtrl'
			})
			.when('/events', {
				redirectTo: '/events/official/'
			})
			.when('/events/:eventType', {
				templateUrl: 'template/event-list.html',
				controller: 'CMEventCtrl'
			})
			.when('/deck-plans', {
				redirectTo: '/deck-plans/2/'
			})
			.when('/deck-plans/:deck', {
				templateUrl: 'template/deck-plans.html',
				controller: 'CMDeckListCtrl'
			})
			.when('/about', {
				templateUrl: 'template/about.html',
				controller: 'CMAboutCtrl'
			})
			.when('/advanced', {
				templateUrl: 'template/advanced.html',
				controller: 'CMAdvancedCtrl'
			})
			.otherwise({
				redirectTo: '/events/official/'
			});
	}])
	.run(['$rootScope', '$location', 'UserService', 'EventService', 'phonegapReady', function($rootScope, $location, UserService, EventService, phonegapReady) {
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

		phonegapReady(function() {
			/*global StatusBar: true*/
			if (StatusBar) {
				console.log('StatusBar exists, isVisible = ' + StatusBar.isVisible);
				StatusBar.overlaysWebView(false);
				StatusBar.backgroundColorByName('black');
			}
		});

		$rootScope.openLeft = function() {
			$rootScope.sideMenuController.toggleLeft();
		};

		$rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute) {
			$rootScope.actions = [];
			$rootScope.user = UserService.get();
			$rootScope.sideMenuController.close();

			if (UserService.loggedIn()) {
				angular.noop();
				return;
			}

			if (currRoute.templateUrl === 'template/event-list.html' && currRoute.params.eventType === 'my') {
				event.preventDefault();
				$location.path('/login/');
				angular.noop();
				return;
			}

			if (prevRoute && prevRoute.access) {
				if (prevRoute.access.requiresLogin) {
					event.preventDefault();
					$location.path('/login/');
					angular.noop();
				}
			}

			angular.noop();
			return;
		});
		
		var updateMenu = function() {
			var path = $location.path();
			angular.forEach(document.getElementById('nav').children, function(li, key) {
				if (li.children[0]) {
					var href = li.children[0].href;
					if (href) {
						if (href.charAt(href.length - 1) === '/') {
							href = href.substr(0, href.length - 1);
						}
						var index = href.indexOf('#');
						if (index !== -1) {
							href = href.substring(href.indexOf('#') + 1);
						}
						if (href === '') {
							angular.element(li).removeClass('selected');
						} else if (path.startsWith(href)) {
							angular.element(li).addClass('selected');
						} else {
							angular.element(li).removeClass('selected');
						}
					}
				}
			});
		};

		$rootScope.$on('$routeChangeSuccess', function(event, currRoute, prevRoute) {
			updateMenu();
		});
		$rootScope.$on('cm.loggedIn', function(event) {
			console.log('User logged in, refreshing menu.');
			updateMenu();
		});
		$rootScope.$on('cm.loggedOut', function(event) {
			console.log('User logged out, refreshing menu.');
			updateMenu();
		});

		/* EventService.init(); */

		$rootScope.hideSpinner = true;
	}])
	;
}());