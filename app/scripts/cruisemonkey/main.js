(function () {
	'use strict';

	angular.module('cruisemonkey',
	[
		'ui.router',
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
	.run(['$rootScope', '$location', '$urlRouter', 'UserService', 'EventService', 'phonegapReady', function($rootScope, $location, $urlRouter, UserService, EventService, phonegapReady) {
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

		$rootScope.openLeft = function() {
			$rootScope.sideMenuController.toggleLeft();
		};

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

		$rootScope.$on('$locationChangeSuccess', function(evt, newUrl, oldUrl) {
			console.log('locationChangeSuccess:',evt,newUrl,oldUrl);

			$rootScope.user = UserService.get();
			$rootScope.sideMenuController.close();

			evt.preventDefault();

			if (UserService.loggedIn()) {
				$urlRouter.sync();
				angular.noop();
				return;
			}

			if (newUrl.endsWith('/events') || newUrl.endsWith('/events/')) {
				$location.path('/events/official');
				angular.noop();
				return;
			}

			if (newUrl.endsWith('/events/my')) {
				$location.path('/login');
				angular.noop();
				return;
			}

			$urlRouter.sync();
			angular.noop();

			updateMenu();
			return;
		});
		
		$rootScope.$on('cm.loggedIn', function(event) {
			console.log('User logged in, refreshing menu.');
			updateMenu();
		});
		$rootScope.$on('cm.loggedOut', function(event) {
			console.log('User logged out, refreshing menu.');
			updateMenu();
		});

		$rootScope.hideSpinner = true;
	}])
	;
}());