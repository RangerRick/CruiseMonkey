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
		'cruisemonkey.controllers.Karaoke',
		'cruisemonkey.controllers.Login',
		'cruisemonkey.controllers.Menu',
		'cruisemonkey.controllers.Navigation',
		'cruisemonkey.controllers.Photos',
		'cruisemonkey.controllers.Twitarr.Stream',
		'cruisemonkey.Database',
		'cruisemonkey.Events',
		'cruisemonkey.Initializer',
		'cruisemonkey.Notifications',
		'cruisemonkey.Seamail',
		'cruisemonkey.Settings',
		'cruisemonkey.State',
		'cruisemonkey.Twitarr',
		'cruisemonkey.Upgrades',
		'cruisemonkey.User'
	])
	.directive('cmSearchBar', ['$timeout', '$cordovaKeyboard', function($timeout, $cordovaKeyboard) {
		return {
			restrict: 'AE',
			templateUrl: 'template/search.html',
			transclude: false,
			scope: {
				searchString: '=ngModel',
				onSearchChanged: '&'
			},
			replace: true,
			link: function(scope, elem, attrs, ctrl) {
				scope.placeholder = attrs.placeholder || 'Search';
				scope.searchStringInternal = scope.searchString;

				var callChangeFunction = function() {
					if (scope.onSearchChanged) {
						$timeout(function() {
							scope.onSearchChanged(scope.searchString);
						});
					}
				};

				var timeout = null;
				scope.updateSearchString = function() {
					if (timeout) {
						return;
					} else {
						timeout = $timeout(function() {
							timeout = null;
							scope.searchString = scope.searchStringInternal;
							callChangeFunction();
						}, 300);
					}
				};
				scope.clearSearchString = function() {
					scope.searchStringInternal = scope.searchString = '';
					angular.element(elem).find('input').blur();
					callChangeFunction();
				};
			}
		};
	}])
	.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', '$ionicConfigProvider', function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider) {
		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file):/);

		$ionicConfigProvider.views.maxCache(20);
		$ionicConfigProvider.views.transition('none');
		$ionicConfigProvider.views.forwardCache(true);

		$ionicConfigProvider.navBar.positionPrimaryButtons('left');
		$ionicConfigProvider.navBar.positionSecondaryButtons('right');

		$ionicConfigProvider.tabs.position('bottom');

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
			.state('app.settings', {
				url: '/settings',
				views: {
					'menuContent': {
						templateUrl: 'template/advanced.html',
						controller: 'CMAdvancedCtrl'
					}
				}
			})
			.state('app.twitarr-stream', {
				url: '/twitarr-stream',
				views: {
					'menuContent': {
						templateUrl: 'template/twitarr-stream.html',
						controller: 'CMTwitarrStreamCtrl'
					}
				}
			})
		;
	}])
	/* EventService & Notifications are here just to make sure they initializes early */
	.run(['$rootScope', '$window', '$cordovaSplashscreen', 'EventService', 'Notifications', 'SettingsService', 'UpgradeService', function($rootScope, $window, $cordovaSplashscreen, EventService, Notifications, SettingsService, UpgradeService) {
		console.log('CruiseMonkey run() called.');

		$rootScope.isCordova = function() {
			if ($window.cordova) {
				return true;
			} else {
				return false;
			}
		};

		$rootScope.openUrl = function(url, target) {
			if ($rootScope.isCordova() && ionic.Platform.isIOS()) {
				var oic = SettingsService.shouldOpenInChrome();
				if (oic) {
					if (url.startsWith('http')) {
						url = url.replace(/^http/, 'googlechrome');
					}
				}
			}
			$window.open(url, target);
		};

		if ($rootScope.isCordova()) {
			$cordovaSplashscreen.hide();
		}

		UpgradeService.upgrade();
	}])
	;
}());
