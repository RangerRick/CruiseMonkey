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
			.state('app.login', {
				url: '/login',
				views: {
					'menuContent': {
						templateUrl: 'template/login.html',
						controller: 'CMLoginCtrl'
					}
				}
			})
			.state('app.logout', {
				url: '/logout',
				views: {
					'menuContent': {
						templateUrl: 'template/logout.html',
						controller: 'CMLogoutCtrl'
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
						templateUrl: 'template/karaoke.html',
						controller: ['$rootScope', function($rootScope) {
							$rootScope.headerTitle = 'Karaoke';
							$rootScope.leftButtons = $rootScope.getLeftButtons();
							$rootScope.rightButtons = [];
						}]
					}
				}
			})
			.state('app.karaoke-search', {
				url: '/karaoke/search',
				views: {
					'menuContent': {
						templateUrl: 'template/karaoke.search.html',
						controller: 'CMKaraokeSearchCtrl'
					}
				}
			})
			.state('app.karaoke-list', {
				url: '/karaoke/list',
				views: {
					'menuContent': {
						templateUrl: 'template/karaoke.list.html',
						controller: 'CMKaraokePrefixListCtrl'
					}
				}
			})
			.state('app.karaoke-by-prefix', {
				url: '/karaoke/by-prefix/:prefix',
				views: {
					'menuContent': {
						templateUrl: 'template/karaoke.by-prefix.html',
						controller: 'CMKaraokeArtistListCtrl'
					}
				}
			})
			.state('app.karaoke-by-artist', {
				url: '/karaoke/by-artist/:artist',
				views: {
					'menuContent': {
						templateUrl: 'template/karaoke.by-artist.html',
						controller: 'CMKaraokeArtistCtrl'
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
	.run(['$rootScope', '$timeout', '$ionicPlatform', '$cordovaDialogs', 'UserService', 'SettingsService', 'EventService', '_database', function($rootScope, $timeout, $ionicPlatform, $cordovaDialogs, UserService, SettingsService, EventService, database) {
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
			document.addEventListener("pause", function() {
				console.warn('CruiseMonkey paused:', Array.prototype.slice.call(arguments));
			}, false);
			document.addEventListener("resign", function() {
				console.warn('CruiseMonkey locked while in foreground:', Array.prototype.slice.call(arguments));
			}, false);
			document.addEventListener("resume", function() {
				console.warn('CruiseMonkey resumed:', Array.prototype.slice.call(arguments));
			}, false);

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
