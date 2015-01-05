(function () {
	'use strict';

	/* global isMobile: true */
	/* global ionic: true */
	/* global cordova: true */
	/* global StatusBar: true */
	angular.module('cruisemonkey',
	[
		'ionic',
		'ngCordova',
		'ui.router',
		'angularLocalStorage',
		'pasvaz.bindonce',
		'cruisemonkey.Config',
		'cruisemonkey.controllers.About',
		'cruisemonkey.controllers.Advanced',
		'cruisemonkey.controllers.Amenities',
		'cruisemonkey.controllers.DeckList',
		'cruisemonkey.controllers.Events',
		'cruisemonkey.controllers.Help',
		'cruisemonkey.controllers.Karaoke',
		'cruisemonkey.controllers.Login',
		'cruisemonkey.controllers.Logout',
		'cruisemonkey.controllers.Menu',
		'cruisemonkey.controllers.Navigation',
		'cruisemonkey.controllers.Photos',
		'cruisemonkey.Database',
		'cruisemonkey.Seamail',
		'cruisemonkey.Settings',
		'cruisemonkey.State',
		'cruisemonkey.Twitarr.Notifications',
		'cruisemonkey.Upgrades',
		'cruisemonkey.User'
	])
	.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', '$ionicConfigProvider', function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider) {
		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file):/);

		$ionicConfigProvider.views.maxCache(20);
		$ionicConfigProvider.views.transition('none');

		$urlRouterProvider.otherwise('/app/events/official');

		$stateProvider
			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'template/menu.html',
				controller: 'CMMenuCtrl'
			})
			.state('app.events', {
				url: '/events',
				/* abstract: true, */
				views: {
					'menuContent': {
						templateUrl: 'template/events-tabs.html',
						controller: 'CMEventsBarCtrl'
					}
				}
			})
			.state('app.events.official', {
				url: '/official',
				views: {
					'events-official': {
						templateUrl: 'template/event-list.html',
						controller: 'CMEventCtrl'
					}
				}
			})
			.state('app.events.unofficial', {
				url: '/unofficial',
				views: {
					'events-unofficial': {
						templateUrl: 'template/event-list.html',
						controller: 'CMEventCtrl'
					}
				}
			})
			.state('app.events.my', {
				url: '/my',
				views: {
					'events-my': {
						templateUrl: 'template/event-list.html',
						controller: 'CMEventCtrl'
					}
				}
			})
			.state('app.events.all', {
				url: '/all',
				views: {
					'events-all': {
						templateUrl: 'template/event-list.html',
						controller: 'CMEventCtrl'
					}
				}
			})
			.state('app.amenities', {
				url: '/amenities',
				views: {
					'menuContent': {
						templateUrl: 'template/amenities.html',
						controller: 'CMAmenitiesCtrl'
					}
				}
			})
			.state('app.deck-plans', {
				url: '/deck-plans/:deck',
				views: {
					'menuContent': {
						templateUrl: 'template/deck-plans.html',
						controller: 'CMDeckListCtrl'
					}
				}
			})
			.state('app.photos', {
				url: '/photos',
				views: {
					'menuContent': {
						templateUrl: 'template/photos.html',
						controller: 'CMPhotoCtrl'
					}
				}
			})
			.state('app.help', {
				url: '/help',
				views: {
					'menuContent': {
						templateUrl: 'template/help.html',
						controller: 'CMHelpCtrl'
					}
				}
			})
			.state('app.karaoke', {
				url: '/karaoke',
				views: {
					'menuContent': {
						templateUrl: 'template/karaoke.search.html',
						controller: 'CMKaraokeSearchCtrl'
					}
				}
			})
			.state('app.about', {
				url: '/about',
				views: {
					'menuContent': {
						templateUrl: 'template/about.html',
						controller: 'CMAboutCtrl'
					}
				}
			})
			.state('app.advanced', {
				url: '/advanced',
				views: {
					'menuContent': {
						templateUrl: 'template/advanced.html',
						controller: 'CMAdvancedCtrl'
					}
				}
			})
		;
	}])
	.run(['Twitarr.Notifications', '$rootScope', '$timeout', '$ionicPlatform', '$cordovaDialogs', '$cordovaSplashscreen', 'UserService', 'SettingsService', 'EventService', '_database', function(notifications, $rootScope, $timeout, $ionicPlatform, $cordovaDialogs, $cordovaSplashscreen, UserService, SettingsService, EventService, database) {
		console.debug('CruiseMonkey run() called.');

		if (ionic.Platform.isWebView()) {
			console.debug('Initializing ionic platform plugins and events.');
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard or form inputs)
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			if(window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleLightContent();
			}
			$ionicPlatform.on('pause', function() {
				console.warn('CruiseMonkey paused:', arguments);
			});
			$ionicPlatform.on('resign', function() {
				console.warn('CruiseMonkey locked while in foreground:', arguments);
			});
			$ionicPlatform.on('resume', function() {
				console.warn('CruiseMonkey resumed:', arguments);
			});

			if (window.plugins && window.plugins.backgroundFetch) {
				window.plugins.backgroundFetch.configure(function() {
					console.warn('Background Fetch Initiated');
					$cordovaDialogs.alert('Background fetch happened!', function() {
						console.warn('Alert callback was called!  Hellz yeah!');
					}, 'Alert', 'Awesome!');
					$timeout(function() {
						window.plugins.backgroundFetch.finish();
					});
				});
			}
		}

		$rootScope.$broadcast('cm.main.database-initialized');
		if (navigator.splashscreen) {
			$cordovaSplashscreen.hide();
		}
	}])
	;
}());
