(function () {
	'use strict';

	/*global TestFlight: true*/

	angular.module('cruisemonkey',
	[
		'ionic',
		'ui.router',
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Cordova',
		'cruisemonkey.controllers.About',
		'cruisemonkey.controllers.Advanced',
		'cruisemonkey.controllers.Amenities',
		'cruisemonkey.controllers.DeckList',
		'cruisemonkey.controllers.Events',
		'cruisemonkey.controllers.Help',
		'cruisemonkey.controllers.Login',
		'cruisemonkey.controllers.Logout',
		'cruisemonkey.controllers.Navigation',
		'cruisemonkey.User'
	])
	.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', function($stateProvider, $urlRouterProvider, $compileProvider) {
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file):/);

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
			.state('amenities', {
				url: '/amenities',
				templateUrl: 'template/amenities.html',
				controller: 'CMAmenitiesCtrl'
			})
			.state('events', {
				url: '/events/:eventType',
				templateUrl: 'template/event-list.html',
				controller: 'CMEventCtrl',
				resolve: {
					events: ['$q', '$stateParams', '$rootScope', 'LoggingService', 'EventService', function($q, $stateParams, $rootScope, log, EventService) {
						log.info('events.resolve: waiting for ' + $stateParams.eventType + ' events');
						var ret = $q.defer();
						if ($stateParams.eventType === 'official') {
							$rootScope.title = 'Official Events';
							EventService.getOfficialEvents().then(function(events) {
								log.info('events.resolve: got ' + events.length + ' official events');
								ret.resolve(events);
							}, function() {
								log.warn('events.resolve: failed to get official events');
								ret.resolve([]);
							});
						} else if ($stateParams.eventType === 'unofficial') {
							$rootScope.title = 'Unofficial Events';
							EventService.getUnofficialEvents().then(function(events) {
								log.info('events.resolve: got ' + events.length + ' unofficial events');
								ret.resolve(events);
							}, function() {
								log.warn('events.resolve: failed to get unofficial events');
								ret.resolve([]);
							});
						} else if ($stateParams.eventType === 'my') {
							$rootScope.title = 'My Events';
							EventService.getMyEvents().then(function(events) {
								log.info('events.resolve: got ' + events.length + ' my events');
								ret.resolve(events);
							}, function() {
								log.warn('failed to get my events');
								ret.resolve([]);
							});
						} else {
							log.warn('unknown event type: ' + $stateParams.eventType);
							ret.resolve([]);
						}
						return ret.promise;
					}]
				}
			})
			.state('deck-plans', {
				url: '/deck-plans/:deck',
				templateUrl: 'template/deck-plans.html',
				controller: 'CMDeckListCtrl'
			})
			.state('help', {
				url: '/help',
				templateUrl: 'template/help.html',
				controller: 'CMHelpCtrl'
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
	.run(['$q', '$rootScope', '$window', '$location', '$timeout', '$urlRouter', 'UserService', 'storage', 'CordovaService', function($q, $rootScope, $window, $location, $timeout, $urlRouter, UserService, storage, CordovaService) {
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

		$window.handleOpenURL = function(url) {
			var translated = url.replace('cruisemonkey://','/');
			$rootScope.safeApply(function() {
				$location.path(translated);
			});
		};

		/*
		CordovaService.ifCordova(function() {
			// is cordova
			$rootScope.hideSpinner = true;
			$rootScope.isCordova = true;
			console.log('main: This is a Cordova device!');

			//$rootScope.testFlight = new TestFlight();
		}, function() {
			// is not cordova
			$rootScope.hideSpinner = true;
			$rootScope.isCordova = false;
			console.log('main: This is not a Cordova device.');
		});
		*/

		$rootScope.openLeft = function() {
			$rootScope.sideMenuController.toggleLeft();
		};

		$rootScope.$on('$locationChangeSuccess', function(evt, newUrl, oldUrl) {
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
