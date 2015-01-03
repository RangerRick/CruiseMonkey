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
		'chieffancypants.loadingBar',
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
		'cruisemonkey.Notifications',
		'cruisemonkey.Seamail',
		'cruisemonkey.Settings',
		'cruisemonkey.State',
		'cruisemonkey.Upgrades',
		'cruisemonkey.User'
	])
	.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', '$ionicConfigProvider', 'cfpLoadingBarProvider', function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider, cfpLoadingBarProvider) {
		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file):/);

		$ionicConfigProvider.views.maxCache(20);
		$ionicConfigProvider.views.transition('none');

		cfpLoadingBarProvider.includeSpinner = true;
		cfpLoadingBarProvider.includeBar = false;

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
	.run(['$rootScope', '$timeout', '$ionicPlatform', '$cordovaDialogs', '$cordovaSplashscreen', 'NotificationService', 'UserService', 'SettingsService', 'EventService', '_database', function($rootScope, $timeout, $ionicPlatform, $cordovaDialogs, $cordovaSplashscreen, NotificationService, UserService, SettingsService, EventService, database) {
		console.debug('CruiseMonkey run() called.');

		$rootScope.$on('cm.persist.connect', function(ev, db) {
			console.debug('persistence connected: ' + db.name);
		});
		$rootScope.$on('cm.persist.disconnect', function(ev, db) {
			console.debug('persistence disconnected: ' + db.name);
		});
		/*
		$rootScope.$on('cm.database.uptodate', function(ev, db) {
			console.debug('persistence up to date: ' + db.name);
		});
		$rootScope.$on('cm.database.change', function(ev, db, doc) {
			console.debug('persistence changed: ' + db.name + ': ' + doc.id);
		});
		$rootScope.$on('cm.database.complete', function(ev, db) {
			console.debug('persistence complete: ', db.name);
		});
		$rootScope.$on('cm.database.create', function(ev, db, doc) {
			console.debug('persistence created an object: ' + db.name + ': ' + doc.id);
		});
		$rootScope.$on('cm.database.update', function(ev, db, doc) {
			console.debug('persistence updated an object: ' + db.name + ': ' + doc.id);
		});
		$rootScope.$on('cm.database.delete', function(ev, db, doc) {
			console.debug('persistence deleted an object: ' + db.name + ': ' + doc.id);
		});
		*/

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

		/*
		if (SettingsService.getDatabaseReplicate()) {
			console.debug('Replication enabled.  Starting sync.');
			var remoteUrl = SettingsService.getRemoteDatabaseUrl();
			console.debug('remoteUrl=',remoteUrl);
			var remotedb = database.get(remoteUrl);
			EventService.syncFrom(remotedb).then(function() {
				console.debug('Finished loading events.');
				$rootScope.$broadcast('cm.main.database-initialized');
				if (navigator.splashscreen) {
					$cordovaSplashscreen.hide();
				}
			}, function() {
				console.debug('Failed to load events.');
				if (navigator.splashscreen) {
					$cordovaSplashscreen.hide();
				}
			});
		} else {
			console.debug('Replication disabled.');
			$rootScope.$broadcast('cm.main.database-initialized');
			if (navigator.splashscreen) {
				$cordovaSplashscreen.hide();
			}
		}
		*/
		$rootScope.$broadcast('cm.main.database-initialized');
		if (navigator.splashscreen) {
			$cordovaSplashscreen.hide();
		}
	}])
	;
}());
