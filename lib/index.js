(function () {
	'use strict';

	/* global isMobile: true */
	/* global cordova: true */
	/* global Camera: true */
	/* global StatusBar: true */

	require('./polyfills/Array');
	require('./polyfills/Object');
	require('./polyfills/String');

	// css
	require('./css/normalize.css');
	require('../scss/cruisemonkey.scss');
	require('ionicons/scss/ionicons.scss');

	require('ionic/js/ionic.bundle');

	var angular = require('angular');
	require('angular-cache');

	var templates = {
		about: require('ngtemplate!html!./about/about.html'),
		amenities: require('ngtemplate!html!./amenities/amenities.html'),
		announcements: require('ngtemplate!html!./announcements/list.html'),
		decksList: require('ngtemplate!html!./decks/list.html'),
		editProfile: require('ngtemplate!html!./profile/edit.html'),
		eventsList: require('ngtemplate!html!./events/list.html'),
		forumsList: require('ngtemplate!html!./forums/list.html'),
		forumsView: require('ngtemplate!html!./forums/view.html'),
		info: require('ngtemplate!html!./info/info.html'),
		karaokeList: require('ngtemplate!html!./karaoke/list.html'),
		seamailSeamail: require('ngtemplate!html!./seamail/seamail.html'),
		seamailSeamails: require('ngtemplate!html!./seamail/seamails.html'),
		settings: require('ngtemplate!html!./settings/settings.html'),
		tabs: require('ngtemplate!html!./tabs/tabs.html'),
		twitarrStream: require('ngtemplate!html!./twitarr/stream.html'),
		tweetDetail: require('ngtemplate!html!./twitarr/tweet-detail.html')
	};

	require('./about/Controller');

	require('./amenities/Controller');

	require('./announcements/Controller');

	require('./cordova/Initializer');
	require('./cordova/Notifications');

	require('./data/DB');
	require('./data/Upgrades');

	require('./decks/Controller');

	require('./directives/all');

	require('./emoji/Service');

	require('./events/Controller');
	require('./events/Service');

	require('./forums/Controller');
	require('./forums/Service');

	require('./info/Controller');

	require('./karaoke/Controller');

	require('./login/Controller');

	require('./profile/Controller');

	require('./seamail/Controller');
	require('./seamail/New');
	require('./seamail/Service');

	require('./settings/Controller');
	require('./settings/Service');

	require('./tabs/Controller');

	require('./twitarr/Controller');
	require('./twitarr/Editor');
	require('./twitarr/Service');

	require('./user/Cache');
	require('./user/Detail');
	require('./user/User');

	require('./util/Photo');

	angular.module('cruisemonkey',
	[
		'ionic',
		'jett.ionic.filter.bar',
		'ngCordova',
		'ngFileUpload',
		'ui.router',
		'cruisemonkey.Config',
		'cruisemonkey.announcements.Controller',
		'cruisemonkey.controllers.About',
		'cruisemonkey.controllers.Amenities',
		'cruisemonkey.controllers.DeckList',
		'cruisemonkey.controllers.Events',
		'cruisemonkey.controllers.Karaoke',
		'cruisemonkey.controllers.Login',
		'cruisemonkey.controllers.Settings',
		'cruisemonkey.controllers.Twitarr.Stream',
		'cruisemonkey.emoji.Emoji',
		'cruisemonkey.forums.Controller',
		'cruisemonkey.forums.Service',
		'cruisemonkey.info.Controller',
		'cruisemonkey.profile.Controller',
		'cruisemonkey.seamail.Controller',
		'cruisemonkey.seamail.Service',
		'cruisemonkey.tabs.Controller',
		'cruisemonkey.DB',
		'cruisemonkey.Events',
		'cruisemonkey.Initializer',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.Upgrades',
		'cruisemonkey.user.User'
	])
	.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider, $logProvider) {
		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		/* eslint-disable no-console */
		if (__DEVELOPMENT__) {
			console.log('Debug mode is enabled.');
			$compileProvider.debugInfoEnabled(true);
			$logProvider.debugEnabled(true);
		} else {
			console.log('Debug mode is disabled.');
			$compileProvider.debugInfoEnabled(false);
			$logProvider.debugEnabled(false);
		}
		/* eslint-enable no-console */

		$compileProvider.preAssignBindingsEnabled(true);
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|ms-appx|ms-appx-web):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|file|filesystem|blob|cdvfile|data|ms-appx|ms-appx-web):/);

		if (ionic.Platform.isAndroid()) {
			$ionicConfigProvider.tabs.style('striped');
		} else {
			$ionicConfigProvider.tabs.style('standard');
		}
		$ionicConfigProvider.views.transition('none');
		$ionicConfigProvider.views.forwardCache(true);
		//$ionicConfigProvider.views.maxCache(5);
		//$ionicConfigProvider.tabs.position('bottom');

		$ionicFilterBarConfigProvider.theme('dark');

		$urlRouterProvider.otherwise('/tab/twitarr');

		$stateProvider
			.state('tab', {
				url: '/tab',
				abstract: true,
				templateUrl: templates['tabs'],
				controller: 'CMTabsCtrl'
			})
			.state('tab.twitarr', {
				url: '/twitarr',
				views: {
					'tab-twitarr': {
						templateUrl: templates['twitarrStream'],
						controller: 'CMTwitarrStreamCtrl'
					}
				}
			})
			.state('tab.twitarr-tweet', {
				url: '/twitarr/:id',
				views: {
					'tab-twitarr': {
						templateUrl: templates['tweetDetail'],
						controller: 'CMTweetCtrl'
					}
				}
			})
			.state('tab.seamail', {
				url: '/seamail',
				views: {
					'tab-seamail': {
						templateUrl: templates['seamailSeamails'],
						controller: 'CMSeamailsCtrl'
					}
				}
			})
			.state('tab.seamail-view', {
				url: '/seamail/:id',
				views: {
					'tab-seamail': {
						templateUrl: templates['seamailSeamail'],
						controller: 'CMSeamailCtrl'
					}
				}
			})
			.state('tab.events', {
				url: '/events',
				views: {
					'tab-events': {
						templateUrl: templates['eventsList'],
						controller: 'CMEventsCtrl'
					}
				}
			})
			.state('tab.info', {
				url: '/info',
				views: {
					'tab-info': {
						templateUrl: templates['info'],
						controller: 'CMInfoCtrl'
					}
				}
			})
			.state('tab.info-settings', {
				url: '/info/settings',
				views: {
					'tab-info': {
						templateUrl: templates['settings'],
						controller: 'CMSettingsCtrl'
					}
				}
			})
			.state('tab.info-profile', {
				url: '/info/profile',
				views: {
					'tab-info': {
						templateUrl: templates['editProfile'],
						controller: 'CMProfileCtrl'
					}
				}
			})
			.state('tab.info-announcements', {
				url: '/info/announcements',
				views: {
					'tab-info': {
						templateUrl: templates['announcements'],
						controller: 'CMAnnouncementsCtrl'
					}
				}
			})
			.state('tab.info-about', {
				url: '/info/about',
				views: {
					'tab-info': {
						templateUrl: templates['about'],
						controller: 'CMAboutCtrl'
					}
				}
			})
			.state('tab.info-deck', {
				cache: false,
				url: '/info/decks',
				views: {
					'tab-info': {
						templateUrl: templates['decksList'],
						controller: 'CMDeckListCtrl'
					}
				}
			})
			.state('tab.info-forums', {
				url: '/info/forums',
				views: {
					'tab-info': {
						templateUrl: templates['forumsList'],
						controller: 'CMForumsCtrl'
					}
				}
			})
			.state('tab.info-forum', {
				url: '/info/forums/:id',
				views: {
					'tab-info': {
						templateUrl: templates['forumsView'],
						controller: 'CMForumCtrl'
					}
				}
			})
			.state('tab.info-karaoke', {
				url: '/info/karaoke',
				views: {
					'tab-info': {
						templateUrl: templates['karaokeList'],
						controller: 'CMKaraokeSearchCtrl'
					}
				}
			})
		;
	})
	/* EventService & Notifications are here just to make sure they initializes early */
	.run(function($cordovaCamera, $cordovaKeyboard, $cordovaSplashscreen, $injector, $ionicHistory, $ionicModal, $ionicPlatform, $ionicPopover, $ionicPopup, $log, $q, $rootScope, $sce, $state, $templateCache, $timeout, $window, Cordova, kv, EmojiService, EventService, LocalNotifications, Notifications, SettingsService, Twitarr, UpgradeService, UserService) {
		$log.info('CruiseMonkey run() called.');

		$rootScope.UserService = UserService;

		SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
			$rootScope.twitarrRoot = twitarrRoot;
		});

		var inCordova = Cordova.inCordova();

		var regexpEscape = function(s) {
			return s.replace(/[-\/\\^$*+?.()|[\]{}]/gm, '\\$&');
		};

		var highlightReplace = function(match) {
			return '<span class="highlight">' + match + '</span>';
		};
		$rootScope.highlight = function(text, searchString) {
			if (searchString) {
				var re = new RegExp('('+regexpEscape(searchString)+')', 'gim');
				var replaced = text.replace(re, highlightReplace);
				return $sce.trustAsHtml(replaced);
			} else {
				return text;
			}
		};

		$rootScope.openUrl = function(url, target) {
			$window.open(url, target);
		};

		$rootScope.closeKeyboard = function() {
			inCordova.then(function() {
				$cordovaKeyboard.close();
			});
		};

		var navigateTo = function(view) {
			$log.info('Main.navigateTo: ' + view.stateName);

			$rootScope.$evalAsync(function() {
				var currentView = $ionicHistory.currentView();

				if (view.stateName === currentView.stateName && angular.toJson(view.stateParams) === angular.toJson(currentView.stateParams)) {
					$log.debug('Main.navigateTo: we are already on the current view');
					return;
				}

				var stateSections = view.stateName.split('-');
				if (stateSections.length > 1) {
					var baseView = stateSections[0];
					$log.debug('Main.navigateTo: base view is ' + baseView);
					if (currentView.stateName === baseView) {
						$log.debug('Main.navigateTo: navigating to ' + view.stateName);
						$state.go(view.stateName, view.stateParams);
					} else {
						if (view.stateName === 'tab.info-settings') {
							var deregister = $rootScope.$on('$ionicView.enter', function(ev, entered) {
								if (entered.stateName === baseView) {
									$log.debug('Main.navigateTo: navigating to: ' + view.stateName);
									$state.go(view.stateName, view.stateParams);
									deregister();
								}
							});
						}

						$log.debug('Main.navigateTo: navigating to base view: ' + baseView);
						$state.go(baseView, {});
					}
				} else {
					$log.debug('Navigating to: ' + view.stateName);
					$state.go(view.stateName, view.stateParams);
				}
			});
		};

		kv.get('cruisemonkey.navigation.current-view').then(function(cv) {
			var view = angular.copy(cv);
			if (view && view.stateName) {
				navigateTo(view);
			} else {
				navigateTo({
					stateName: 'tab.events',
					stateParams: {}
				});
			}
		});

		var updateCurrentView = function(view) {
			var params = {
				stateName: view.stateName,
				stateParams: view.stateParams
			};
			return kv.set('cruisemonkey.navigation.current-view', params);
		};

		$rootScope.$on('$ionicView.enter', function(ev, view) {
			updateCurrentView(view);
		});


		inCordova.then(function() {
			$log.info('In cordova.  Hiding splash screen.');
			$cordovaSplashscreen.hide();

			$log.info('Making sure the user can do notifications.');
			var canNotify = LocalNotifications.canNotify();
			canNotify['finally'](function() {
				$rootScope.$broadcast('cruisemonkey.notifications.ready');
			});
			canNotify.then(function() {
				$log.info('Local notifications: they can!');
			}, function() {
				$log.info('Local notifications: they can\'t. :(');
			});
		}, function() {
			$rootScope.$broadcast('cruisemonkey.notifications.ready');
		});

		UpgradeService.upgrade();
	})
	;
}());
