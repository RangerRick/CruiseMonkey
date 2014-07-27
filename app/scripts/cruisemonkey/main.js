(function () {
	'use strict';

	/*global Connection: true*/
	/*global isMobile: true*/
	/*global ionic: true*/
	/*global Offline: true*/

	angular.module('cruisemonkey',
	[
		'ionic',
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
		'cruisemonkey.DB',
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
	}])
	.directive('closeMenu', ['$ionicGesture', '$rootScope', function($ionicGesture, $rootScope) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attrs) {
				var handleTap = function (e) {
					e.preventDefault();
					if ($rootScope.sideMenuController) {
						$rootScope.sideMenuController.close();
					}
				};
				var tapGesture = $ionicGesture.on('tap', handleTap, $element);
				$scope.$on('$destroy', function () {
					// Clean up - unbind drag gesture handler
					$ionicGesture.off(tapGesture, 'tap', handleTap);
				});
			}
		};
	}])
	.directive('openMenu', ['$ionicGesture', '$rootScope', function($ionicGesture, $rootScope) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attrs) {
				var handleTap = function (e) {
					e.preventDefault();
					if ($rootScope.sideMenuController) {
						$rootScope.sideMenuController.toggleLeft();
					}
				};
				var tapGesture = $ionicGesture.on('tap', handleTap, $element);
				$scope.$on('$destroy', function () {
					// Clean up - unbind drag gesture handler
					$ionicGesture.off(tapGesture, 'tap', handleTap);
				});
			}
		};
	}])
	.directive('goTo', ['$ionicGesture', '$location', function($ionicGesture, $location) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attrs) {
				var handleTap = function (e) {
					$location.path($attrs.goTo);
					e.preventDefault();
				};
				var tapGesture = $ionicGesture.on('tap', handleTap, $element);
				$scope.$on('$destroy', function () {
					// Clean up - unbind drag gesture handler
					$ionicGesture.off(tapGesture, 'tap', handleTap);
				});
			}
		};
	}])
	.run(['$q', '$rootScope', '$window', '$location', '$interval', '$urlRouter', '$log', 'UserService', 'storage', 'CordovaService', 'UpgradeService', '_db', 'NotificationService', 'SettingsService', 'SeamailService', function($q, $rootScope, $window, $location, $interval, $urlRouter, log, UserService, storage, cor, upgrades, _db, notifications, SettingsService, SeamailService) {
		log.debug('CruiseMonkey run() called.');

		/*global moment: true*/
		$rootScope.lastModified = moment();

		upgrades.register('3.9.3', 'Old Cookies Cleaned Up', function() {
			// remove old cm.db.sync cookie
			storage.remove('cm.db.sync');

			// update deck to be a number, if it isn't
			var deck = storage.get('cm.deck');
			if (deck !== undefined && (typeof deck === 'string' || deck instanceof String)) {
				storage.set('cm.deck', parseInt(deck, 10));
			}
		});

		storage.bind($rootScope, 'firstInitialization', {
			'defaultValue': true,
			'storeName': 'cm.firstInitialization'
		});

		$window.handleOpenURL = function(url) {
			var translated = url.replace('cruisemonkey://','/');
			$rootScope.safeApply(function() {
				$location.path(translated);
			});
		};

		$rootScope.openLeft = function(evt) {
			log.info('Opening Sidebar.');
			if ($rootScope.sideMenuController) {
				$rootScope.sideMenuController.toggleLeft();
			} else {
				log.warn('Side menu controller not initialized yet!');
			}
			return false;
		};

		$rootScope.closeLeft = function(evt) {
			log.info('Closing Sidebar.');
			if ($rootScope.sideMenuController) {
				$rootScope.sideMenuController.close();
			} else {
				log.warn('Side menu controller not initialized yet!');
			}
			return false;
		};

		$rootScope.getLeftButtons = function() {
			return [{
				type: 'button-clear',
				content: '<i class="icon active ion-navicon"></i>',
				tap: $rootScope.openLeft
			}];
		};

		$rootScope.openUrl = function(url, target) {
			var oic = SettingsService.getOpenInChrome();
			if (oic) {
				if (url.startsWith('http')) {
					url = url.replace(/^http/, 'googlechrome');
				}
			}
			$window.open(url, target);
		};

		$rootScope.openSeamail = function() {
			$rootScope.openUrl(SettingsService.getTwitarrRoot() + '#/seamail/inbox', '_system');
		};

		$rootScope.$on('$locationChangeSuccess', function(evt, newUrl, oldUrl) {
			$rootScope.user = UserService.get();

			evt.preventDefault();

			if (UserService.loggedIn()) {
				$urlRouter.sync();
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				$rootScope.closeLeft();
				return;
			}

			if (newUrl.endsWith('/events') || newUrl.endsWith('/events/')) {
				$location.path('/events/official');
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				$rootScope.closeLeft();
				return;
			}

			if (newUrl.endsWith('/events/my')) {
				$location.path('/login');
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				$rootScope.closeLeft();
				return;
			}

			$urlRouter.sync();
			storage.set('cm.lasturl', newUrl);
			angular.noop();
			$rootScope.closeLeft();

			return;
		});


		$rootScope.$on('$viewContentLoaded', function(evt, toState, toParams, fromState, fromParams) {
			$rootScope.closeLeft();
		});

		$rootScope.$on('cm.foreground', function(evt, isForeground) {
			if (isForeground) {
				$rootScope.closeLeft();
			}
		});

		var savedUrl = storage.get('cm.lasturl');
		if (savedUrl) {
			log.info('main: lasturl = ' + savedUrl);
			var index = savedUrl.indexOf('#');
			if (index > -1) {
				savedUrl = decodeURIComponent(savedUrl.substring(savedUrl.indexOf('#') + 1));

				// remove the goToHash hash from event URLs
				if (savedUrl.contains('/events/') || savedUrl.indexOf('#') > -1) {
					savedUrl = savedUrl.substring(0,savedUrl.indexOf('#'));
				}
				log.info('main: setting path to: ' + savedUrl);
				$location.url(savedUrl);
			}
		}

		var databaseInitialized = $q.defer();
		$rootScope.foreground = true;
		$rootScope.online     = undefined;

		$rootScope.$watch('foreground', function(newValue, oldValue) {
			if (newValue === undefined) {return;}
			if (newValue === oldValue) {
				log.warn('foreground status unchanged: ' + newValue);
				return;
			}
			log.debug('foreground status is now ' + $rootScope.foreground);
			$rootScope.$broadcast('cm.foreground', $rootScope.foreground);
		});
		$rootScope.$watch('online', function(newValue, oldValue) {
			if (newValue === undefined) {return;}
			if (newValue === oldValue) {
				log.warn('online status unchanged: ' + newValue);
				return;
			}
			log.debug('online status is now ' + $rootScope.online);
			$rootScope.$broadcast('cm.online', newValue);
		});

		var onOnline = function() {
			$rootScope.safeApply(function() {
				$rootScope.online = true;
			});
		};
		var onOffline = function() {
			$rootScope.safeApply(function() {
				$rootScope.online = false;
			});
		};

		document.addEventListener('pause', function() {
			$rootScope.safeApply(function() {
				$rootScope.foreground = false;
			});
		}, false);
		document.addEventListener('resume', function() {
			$rootScope.safeApply(function() {
				$rootScope.foreground = true;
				cor.ifCordova(function() {
					navigator.splashscreen.hide();
				});
			});
		}, false);
		
		var initializeOffline = function() {
			Offline.options.checks = {
				xhr: {
					url: SettingsService.getRemoteDatabaseUrl()
				}
			};

			if (Offline.options.reconnect) {
				log.debug('initializeOffline() called, but options already initialized.');
				return;
			}

			Offline.options.reconnect = {
				initialDelay: 3,
				delay: 10
			};
			Offline.on('up', onOnline, $rootScope);
			Offline.on('confirmed-up', onOnline, $rootScope);
			Offline.on('down', onOffline, $rootScope);
			Offline.on('confirmed-down', onOffline, $rootScope);
			Offline.check();
		};

		var doDbInit = function() {
			_db.setUserDatabase(SettingsService.getLocalDatabaseUrl());
			_db.setRemoteDatabase(SettingsService.getRemoteDatabaseUrl());
			_db.onChange(function(change) {
				$rootScope.$broadcast('cm.database.change', change);
			});
			_db.init().then(function() {
				databaseInitialized.resolve();
				cor.ifCordova(function() {
					navigator.splashscreen.hide();
				});
				$rootScope.$broadcast('cm.main.database-initialized');
				initializeOffline();
			}, function(err) {
				log.error('Failed to initialize database!');
				databaseInitialized.reject(err);
			});
		};

		$q.when(upgrades.upgrade()).then(function() {
			doDbInit();
		});

		$rootScope.$on('cm.loggedIn', function(event) {
			log.info('User "' + UserService.getUsername() + '" logged in.');
		});
		$rootScope.$on('cm.loggedOut', function(event) {
			log.info('User logged out.');
		});
		$rootScope.$on('cm.settings-changed', function() {
			doDbInit();
		});
	}])
	;
}());
