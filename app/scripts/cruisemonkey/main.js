(function () {
	'use strict';

	/*global Connection: true*/
	/*global isMobile: true*/

	angular.module('cruisemonkey',
	[
		'ionic',
		'ui.router',
		'angularLocalStorage',
		'pasvaz.bindonce',
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
					$rootScope.title = 'Karaoke';
					$rootScope.leftButtons = [];
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
					//console.log('closeMenu');
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
					//console.log('openMenu');
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
					//console.log('goTo: ' + $attrs.goTo);
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
	.run(['$q', '$rootScope', '$window', '$location', '$timeout', '$interval', '$urlRouter', '$http', 'UserService', 'storage', 'CordovaService', 'UpgradeService', 'Database', 'LoggingService', 'NotificationService', 'SettingsService', 'SeamailService', function($q, $rootScope, $window, $location, $timeout, $interval, $urlRouter, $http, UserService, storage, cor, upgrades, Database, log, notifications, SettingsService, SeamailService) {
		log.debug('CruiseMonkey run() called.');

		$rootScope.lastModified = moment();

		upgrades.register('3.9.3', 'Old Cookies Cleaned Up', function() {
			// remove old cm.db.sync cookie
			storage.remove('cm.db.sync');

			// update deck to be a number, if it isn't
			var deck = storage.get('cm.deck');
			if (deck !== undefined && (typeof deck === 'string' || deck instanceof String)) {
				storage.put('cm.deck', parseInt(deck, 10));
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
			console.log('evt=',evt);
			$rootScope.sideMenuController.toggleLeft();
			return false;
		};

		$rootScope.closeLeft = function(evt) {
			log.info('Closing Sidebar.');
			console.log('evt=',evt);
			$rootScope.sideMenuController.close();
			return false;
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
				//console.log('new url = ' + newUrl);
				storage.set('cm.lasturl', newUrl);
				$rootScope.sideMenuController.close();
				return;
			}

			if (newUrl.endsWith('/events') || newUrl.endsWith('/events/')) {
				$location.path('/events/official');
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				$rootScope.sideMenuController.close();
				return;
			}

			if (newUrl.endsWith('/events/my')) {
				$location.path('/login');
				angular.noop();
				storage.set('cm.lasturl', newUrl);
				$rootScope.sideMenuController.close();
				return;
			}

			$urlRouter.sync();
			storage.set('cm.lasturl', newUrl);
			angular.noop();
			if ($rootScope.sideMenuController) {
				$rootScope.sideMenuController.close();
			}

			return;
		});


		$rootScope.$on('$viewContentLoaded', function(evt, toState, toParams, fromState, fromParams) {
			$rootScope.sideMenuController.close();
		});

		var savedUrl = storage.get('cm.lasturl');
		if (savedUrl) {
			log.info('main: lasturl = ' + savedUrl);
			var index = savedUrl.indexOf('#');
			if (index > -1) {
				savedUrl = decodeURIComponent(savedUrl.substring(savedUrl.indexOf('#') + 1));
				log.info('main: setting path to: ' + savedUrl);
				$location.url(savedUrl);
			}
		}

		var databaseInitialized = $q.defer();
		$rootScope.foreground = true;
		// if we're not mobile, we don't know if we're online or not, so set it online
		$rootScope.online = true;
		/* I'm really afraid this is gonna go bad on the ship.  Let's just pretend we're always online.
		$rootScope.online = !isMobile;
		if (navigator && navigator.network && navigator.network.connection) {
			$rootScope.online = navigator.network.connection.type !== Connection.NONE;
			log.info('navigator support found, setting to online');
		}
		*/

		var handleStateChange = function() {
			databaseInitialized.promise.then(function() {
				if ($rootScope.foreground && $rootScope.online) {
					log.debug('handleStateChange: setting online');
					if ($rootScope.firstInitialization) {
						var message = 'Synchronizing events from CruiseMonkey database...';
						//notifications.status(message);
						Database.syncRemote()['finally'](function() {
							$rootScope.firstInitialization = false;
							Database.online();
							SeamailService.online();
							//notifications.removeStatus(message);
							$rootScope.$broadcast('cm.main.refreshEvents');
						});
					} else {
						Database.online();
						SeamailService.online();
						$rootScope.$broadcast('cm.main.refreshEvents');
					}
				} else {
					log.debug('handleStateChange: setting offline');
					// notifications.status('Offline.  Unable to sync events.', 5000);
					Database.offline();
					SeamailService.offline();
				}
			});
		};
		handleStateChange();

		$timeout(function() {
			databaseInitialized.promise.then(function() {
				if ($rootScope.foreground && $rootScope.online) {
					Database.restartReplication();
				}
			});
		}, 10 * 60 * 1000); // do it manually every 10 minutes, just to be sure

		$rootScope.$watch('foreground', function(newValue, oldValue) {
			if (newValue === oldValue) {
				log.warn('foreground: ' + oldValue + ' -> ' + newValue);
				return;
			}
			log.debug('foreground status is now ' + $rootScope.foreground);

			// just came back, close the drawer if it's open
			if (newValue && $rootScope.sideMenuController) {
				$rootScope.sideMenuController.close();
			}

			handleStateChange();
		});
		$rootScope.$watch('online', function(newValue, oldValue) {
			if (newValue === oldValue) {
				log.warn('online: ' + oldValue + ' -> ' + newValue);
				return;
			}
			log.debug('online status is now ' + $rootScope.online);
			handleStateChange();
		});

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

		/*
		document.addEventListener('offline', function() {
			$rootScope.safeApply(function() {
				$rootScope.online = false;
			});
		}, false);
		document.addEventListener('online', function() {
			$rootScope.safeApply(function() {
				$rootScope.online = true;
			});
		}, false);
		*/

		$q.when(upgrades.upgrade()).then(function() {
			Database.initialize().then(function(db) {
				databaseInitialized.resolve(db);
				cor.ifCordova(function() {
					navigator.splashscreen.hide();
				});
				$rootScope.$broadcast('cm.main.databaseInitialized');
			}, function(err) {
				cor.ifCordova(function() {
					navigator.splashscreen.hide();
				});
				log.error('Failed to initialize database!');
				databaseInitialized.reject(err);
			});
		});

		$rootScope.$on('cm.loggedIn', function(event) {
			log.info('User "' + UserService.getUsername() + '" logged in.');
		});
		$rootScope.$on('cm.loggedOut', function(event) {
			log.info('User logged out.');
		});
	}])
	;
}());
