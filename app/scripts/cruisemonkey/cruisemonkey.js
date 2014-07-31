(function () {
	'use strict';

	angular.module('cruisemonkey',
	[
		'ionic',
		'ngCordova',
		'ui.router',
		'angularLocalStorage',
		'pasvaz.bindonce',
		'chieffancypants.loadingBar',
		'cruisemonkey.Config',
		'cruisemonkey.Cordova',
		'cruisemonkey.controllers.About',
		'cruisemonkey.controllers.Advanced',
		'cruisemonkey.controllers.Amenities',
		'cruisemonkey.controllers.DeckList',
		'cruisemonkey.controllers.Events',
		'cruisemonkey.controllers.Help',
		'cruisemonkey.controllers.Karaoke',
		'cruisemonkey.controllers.Login',
		'cruisemonkey.controllers.Logout',
		'cruisemonkey.controllers.Navigation',
		'cruisemonkey.controllers.Photos',
		'cruisemonkey.Database',
		'cruisemonkey.Notifications',
		'cruisemonkey.Seamail',
		'cruisemonkey.Settings',
		'cruisemonkey.Upgrades',
		'cruisemonkey.User'
	])
	.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', 'cfpLoadingBarProvider', function($stateProvider, $urlRouterProvider, $compileProvider, cfpLoadingBarProvider) {
		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file):/);

		cfpLoadingBarProvider.includeSpinner = false;

		$urlRouterProvider.otherwise('/app/events/official');

		$stateProvider
			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'template/menu.html'
			})
			.state('app.events', {
				url: '/events/:eventType',
				views: {
					'menuContent': {
						templateUrl: 'template/event-list.html',
						controller: 'CMEventCtrl'
					}
				}
			})
		;
		/*

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
				controller: 'CMEventCtrl'
			})
			.state('deck-plans', {
				url: '/deck-plans/:deck',
				templateUrl: 'template/deck-plans.html',
				controller: 'CMDeckListCtrl'
			})
			.state('photos', {
				url: '/photos',
				templateUrl: 'template/photos.html',
				controller: 'CMPhotoCtrl'
			})
			.state('help', {
				url: '/help',
				templateUrl: 'template/help.html',
				controller: 'CMHelpCtrl'
			})
			.state('karaoke', {
				url: '/karaoke',
				templateUrl: 'template/karaoke.html',
				controller: ['$rootScope', function($rootScope) {
					$rootScope.headerTitle = 'Karaoke';
					$rootScope.leftButtons = $rootScope.getLeftButtons();
					$rootScope.rightButtons = [];
				}]
			})
			.state('karaoke-search', {
				url: '/karaoke/search',
				templateUrl: 'template/karaoke.search.html',
				controller: 'CMKaraokeSearchCtrl'
			})
			.state('karaoke-list', {
				url: '/karaoke/list',
				templateUrl: 'template/karaoke.list.html',
				controller: 'CMKaraokePrefixListCtrl'
			})
			.state('karaoke-by-prefix', {
				url: '/karaoke/by-prefix/:prefix',
				templateUrl: 'template/karaoke.by-prefix.html',
				controller: 'CMKaraokeArtistListCtrl'
			})
			.state('karaoke-by-artist', {
				url: '/karaoke/by-artist/:artist',
				templateUrl: 'template/karaoke.by-artist.html',
				controller: 'CMKaraokeArtistCtrl'
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
			*/
	}])
	.run(['$rootScope', '$ionicPlatform', 'UserService', 'SettingsService', 'EventService', '_database', function($rootScope, $ionicPlatform, UserService, SettingsService, EventService, database) {
		console.debug('CruiseMonkey run() called.');

		$ionicPlatform.ready(function() {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard or form inputs)
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			if(window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});

		$rootScope.getLeftButtons = function() {
			return [{
				type: 'button-clear',
				content: '<i class="icon active ion-navicon"></i>',
				tap: $rootScope.openLeft
			}];
		};

		$rootScope.$on('cm.loggedIn', function(event) {
			console.info('User "' + UserService.getUsername() + '" logged in.');
		});
		$rootScope.$on('cm.loggedOut', function(event) {
			console.info('User logged out.');
		});
		
		var remoteUrl = SettingsService.getRemoteDatabaseUrl();
		console.debug('remoteUrl=',remoteUrl);
		var remotedb = database.get(remoteUrl);
		EventService.syncFrom(remotedb).then(function() {
			console.debug('Finished loading events.');
			$rootScope.$broadcast('cm.main.database-initialized');
		});
	}])
	;
}());
