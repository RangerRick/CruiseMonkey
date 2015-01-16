(function () {
	'use strict';

	/* global isMobile: true */
	/* global ionic: true */
	/* global cordova: true */
	/* global StatusBar: true */
	/* global moment: true */

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
		//'cruisemonkey.controllers.Photos',
		'cruisemonkey.controllers.Seamail',
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
				cache: false,
				url: '/deck-plans',
				views: {
					'menuContent': {
						templateUrl: 'template/deck-plans.html',
						controller: 'CMDeckListCtrl'
					}
				}
			})
			/*
			.state('app.photos', {
				url: '/photos',
				views: {
					'menuContent': {
						templateUrl: 'template/photos.html',
						controller: 'CMPhotoCtrl'
					}
				}
			})
*/
			.state('app.seamail', {
				url: '/seamail',
				views: {
					'menuContent': {
						templateUrl: 'template/seamail.html',
						controller: 'CMSeamailCtrl'
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
	.run(['$rootScope', '$window', '$cordovaSplashscreen', '$ionicModal', '$ionicPopover', '$ionicPopup', 'EventService', 'Notifications', 'SettingsService', 'Twitarr', 'UpgradeService', 'UserService', function($rootScope, $window, $cordovaSplashscreen, $ionicModal, $ionicPopover, $ionicPopup, EventService, Notifications, SettingsService, Twitarr, UpgradeService, UserService) {
		console.log('CruiseMonkey run() called.');

		$rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
			console.log('ERROR: ' + fromState + ' -> ' + toState, event, fromState, fromParams, toState, toParams, error);
		});

		moment.locale('en', {
			relativeTime: {
				future : 'in %s',
				past : '%s ago',
				s : 'a few seconds',
				m : '1 minute',
				mm : '%d minutes',
				h : '1 hour',
				hh : '%d hours',
				d : '1 day',
				dd : '%d days',
				M : '1 month',
				MM : '%d months',
				y : '1 year',
				yy : '%d years'
			}
		});

		$rootScope.isCordova = function() {
			if ($window.cordova) {
				return true;
			} else {
				return false;
			}
		};

		var newSeamailModal;
		$ionicModal.fromTemplateUrl('template/new-seamail.html', {
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			modal.scope.closeModal = function() {
				modal.hide();
			};
			modal.scope.postSeamail = function(seamail, sendTo) {
				if (sendTo) {
					seamail.users.push(sendTo);
				}
				Twitarr.postSeamail(seamail).then(function() {
					modal.hide();
					$rootScope.$broadcast('cruisemonkey.notify.newSeamail', 1);
				}, function(err) {
					$ionicPopup.alert({
						title: 'Failed',
						template: 'Failed to post Seamail: ' + err[0]
					});
				});
			};
			newSeamailModal = modal;
		});

		$rootScope.newSeamail = function(sendTo) {
			userPopover.hide();
			newSeamailModal.scope.sendTo = sendTo;
			newSeamailModal.show();
		};

		var userPopover;
		$ionicPopover.fromTemplateUrl('template/user-detail.html', {
			/* animation: 'slide-in-up' */
		}).then(function(popup) {
			popup.scope.closePopover = function() {
				popup.hide();
			};
			popup.scope.sendSeamail = function(sendTo) {
				console.log('Opening a seamail dialog to ' + sendTo);
				$rootScope.newSeamail(sendTo);
			};
			userPopover = popup;
		});

		$rootScope.openUser = function(username, evt) {
			console.log('Opening User: ' + username);
			if (evt) {
				evt.preventDefault();
				evt.stopPropagation();
			} else {
				console.log('WARNING: click $event was not passed.');
			}

			userPopover.scope.twitarrRoot = SettingsService.getTwitarrRoot();
			Twitarr.getUserInfo(username).then(function(user) {
				userPopover.scope.user = user;
				userPopover.scope.me = UserService.get();
				console.log('openUser: user=',user);
				userPopover.show(evt);
			});
		};

		$rootScope.$on('$destroy', function() {
			newSeamailModal.remove();
			userPopover.remove();
		});

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
