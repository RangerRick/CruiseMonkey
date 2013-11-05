(function () {
	'use strict';

	angular.module('cruisemonkey',
	[
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
		'ek.mobileFrame',
		'btford.phonegap.ready'
	])
	.config(['$routeProvider', '$mobileFrameProvider', function($routeProvider, $mobileFrameProvider) {
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
				controller: 'CMEventCtrl' /*,
				resolve: {
					events: ['$q', '$route', '$timeout', 'EventService', 'LoggingService', function($q, $route, $timeout, EventService, log) {
						var func;
						var eventType = $route.current.params.eventType;
						if (eventType === 'official') {
							func = EventService.getOfficialEvents;
						} else if (eventType === 'unofficial') {
							func = EventService.getUnofficialEvents;
						} else if (eventType === 'my') {
							func = EventService.getMyEvents;
						} else {
							log.warn('unknown event type: ' + eventType);
						}

						var response = $q.defer();
						if (func) {
							$q.when(func()).then(function(events) {
								var i, ret = {};
								for (i = 0; i < events.length; i++) {
									var e = events[i];
									if (!e.hasOwnProperty('isFavorite')) {
										e.isFavorite = false;
									}
									ret[e._id] = e;
								}
								response.resolve(ret);
							});
						} else {
							$timeout(function() {
								response.reject('unknown event type');
							}, 0);
						}
						return response.promise;
					}]
				} */
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
		$mobileFrameProvider
			.setHeaderHeight(40)
			.setFooterHeight(0)
			.setNavWidth(250);
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

		$rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute) {
			$rootScope.actions = [];
			$rootScope.user = UserService.get();

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