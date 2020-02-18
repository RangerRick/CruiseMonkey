import { Plugins, StatusBarStyle } from '@capacitor/core';
const {
	Browser,
	Keyboard,
	SplashScreen,
	StatusBar,
} = Plugins;

import '@ionic/pwa-elements';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

/* global isMobile: true */

require('jquery');

require('./polyfills/Array');
require('./polyfills/String');

// css
require('./css/normalize.css');
require('../scss/cruisemonkey.scss');
require('ionicons/scss/ionicons.scss');

const angular = require('angular');
require('angular-animate');
require('angular-cache');
require('angular-sanitize');
require('angular-ui-router');
require('ng-cordova');

require('ionic/js/ionic');
require('ionic/js/ionic-angular');

console.log('Using AngularJS version ' + angular.version.full);

const templates = {
	about: require('./about/about.html'),
	amenities: require('./amenities/amenities.html'),
	announcements: require('./announcements/list.html'),
	conduct: require('./conduct/conduct.html'),
	decksList: require('./decks/list.html'),
	editProfile: require('./profile/edit.html'),
	eventsList: require('./events/list.html'),
	forumsList: require('./forums/list.html'),
	forumsView: require('./forums/view.html'),
	info: require('./info/info.html'),
	karaokeList: require('./karaoke/list.html'),
	seamailSeamail: require('./seamail/seamail.html'),
	seamailSeamails: require('./seamail/seamails.html'),
	settings: require('./settings/settings.html'),
	tabs: require('./tabs/tabs.html'),
	today: require('./today/today.html'),
	twitarrStream: require('./twitarr/stream.html'),
	tweetDetail: require('./twitarr/tweet-detail.html')
};

require('./about/Controller');

require('./amenities/Controller');

require('./announcements/Controller');

require('./conduct/Controller');
require('./conduct/Service');

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

require('./today/Controller');
require('./today/Service');

require('./twitarr/Controller');
require('./twitarr/Editor');
require('./twitarr/Service');

require('./user/Cache');
require('./user/Detail');
require('./user/User');

require('./util/BackgroundManager');
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
	'cruisemonkey.conduct.Controller',
	'cruisemonkey.conduct.Service',
	'cruisemonkey.controllers.About',
	'cruisemonkey.controllers.Amenities',
	'cruisemonkey.controllers.DeckList',
	'cruisemonkey.controllers.Events',
	'cruisemonkey.controllers.Karaoke',
	'cruisemonkey.controllers.Login',
	'cruisemonkey.controllers.Settings',
	'cruisemonkey.controllers.Today',
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
	'cruisemonkey.user.User',
	'cruisemonkey.util.BackgroundManager',
])
.config(($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider, $logProvider) => {
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

	$urlRouterProvider.otherwise('/tab/today');

	$stateProvider
		.state('tab', {
			url: '/tab',
			abstract: true,
			templateUrl: templates['tabs'],
			controller: 'CMTabsCtrl'
		})
		.state('tab.today', {
			url: '/today',
			views: {
				'tab-today': {
					templateUrl: templates['today'],
					controller: 'CMTodayCtrl'
				}
			}
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
		.state('tab.info-conduct', {
			url: '/info/conduct',
			views: {
				'tab-info': {
					templateUrl: templates['conduct'],
					controller: 'CMConductCtrl'
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
		.state('tab.info-decks', {
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
/* $cordovaCamera, Conduct, EmojiService, EventService, & Notifications are here just to make sure they initialize early */
.run(($cordovaCamera, BackgroundManager, Conduct, EmojiService, EventService, Notifications, $ionicHistory, $log, $q, $rootScope, $sce, $state, $timeout, Cordova, kv, LocalNotifications, SettingsService, Twitarr, UpgradeService, UserService) => {
	$log.info('CruiseMonkey run() called.');

	defineCustomElements(window);

	$rootScope.UserService = UserService;
	$rootScope.sections = {};

	SettingsService.getTwitarrRoot().then((twitarrRoot) => {
		$rootScope.twitarrRoot = twitarrRoot;
	});

	const inCordova = Cordova.inCordova();

	const regexpEscape = (s) => {
		return s.replace(/[-/\\^$*+?.()|[\]{}]/gm, '\\$&');
	};

	const highlightReplace = (match) => {
		return '<span class="highlight">' + match + '</span>';
	};
	$rootScope.highlight = (text, searchString) => {
		if (searchString) {
			const re = new RegExp('('+regexpEscape(searchString)+')', 'gim');
			const replaced = text.replace(re, highlightReplace);
			return $sce.trustAsHtml(replaced);
		} else {
			return text;
		}
	};

	$rootScope.openUrl = (url, target) => {
		Browser.open({
			url: url,
			windowName: target,
		});
	};

	$rootScope.closeKeyboard = () => {
		try {
			Keyboard.hide();
		} catch (err) {
			// do nothing, keyboard stuff not supported
		}
	};

	const updateCurrentView = (view) => {
		const params = { stateName: view.stateName };
		if (view.stateParams) {
			params.stateParams = view.stateParams;
		}
		return kv.set('cruisemonkey.navigation.current-view', params);
	};

	$rootScope.$on('$ionicView.enter', (ev, view) => {
		updateCurrentView(view);
	});

	$rootScope.isSectionEnabled = (section) => {
		const cmSectionValue = $rootScope.sections[`cruise_monkey_${section}`];
		if (cmSectionValue !== undefined) {
			return Boolean(cmSectionValue);
		}
		return Boolean($rootScope.sections[section]);
	};

	const navigateTo = (view) => {
		$rootScope.$evalAsync(() => {
			const currentView = $ionicHistory.currentView();
			$log.debug('Main.navigateTo: newView=' + angular.toJson(view));
			$log.debug('Main.navigateTo: currentView=' + angular.toJson(currentView));
			if (view.stateName === currentView.stateName && angular.toJson(view.stateParams) === angular.toJson(currentView.stateParams)) {
				$log.debug('Main.navigateTo: we are already on the current view');
				return;
			}

			const stateSections = view.stateName.split('-');
			console.log('Main.navigateTo: stateSections=' + angular.toJson(stateSections));
			if (stateSections.length > 1) {
				const baseView = stateSections[0];
				$log.debug('Main.navigateTo: base view is ' + baseView);
				if (currentView.stateName === baseView) {
					$log.debug('Main.navigateTo: navigating to ' + view.stateName);
					return $state.go(view.stateName, view.stateParams);
				} else {
					$log.debug(`Main.navigateTo: navigating to ${baseView} first.`);
					return $state.go(baseView, view.stateParams).then((transitionView) => {
						$log.debug(`Main.navigateTo: now navigating to ${view.stateName} from ` + angular.toJson(transitionView));
						const deferred = $q.defer();
						$timeout(() => {
							deferred.resolve($state.go(view.stateName, Object.assign({
								relative: transitionView,
							}, view.stateParams)));
						}, 10);
						return deferred.promise;
					});
					/*
					if (view.stateName === 'tab.info.settings') {
						const deregister = $rootScope.$on('$ionicView.enter', function(ev, entered) {
							if (entered.stateName === baseView) {
								$log.debug('Main.navigateTo: navigating to: ' + view.stateName);
								$state.go(view.stateName, view.stateParams);
								deregister();
							}
						});
					}
					*/
				}
			} else {
				$state.go(view.stateName, view.stateParams);
			}
		});
	};

	kv.get('cruisemonkey.navigation.current-view').then((view) => {
		console.debug('current view: ' + angular.toJson(view));
		if (view && view.stateName) {
			navigateTo(view);
		}
	});

	inCordova.then((inCordova) => {
		if (inCordova) {
			$log.info('In cordova.  Hiding splash screen.');
			SplashScreen.hide();

			$log.info('Setting status bar style to dark.');
			StatusBar.setStyle({
				style: StatusBarStyle.Dark,
			});

			/*
			$log.info('Setting keyboard resize mode to Ionic.');
			Keyboard.setResizeMode({
				mode: KeyboardResize.Ionic,
			});
			*/
			Keyboard.setAccessoryBarVisible({ isVisible: true });
			Keyboard.setScroll({ isDisabled: false });

			$log.info('Making sure the user can do notifications.');
			const canNotify = LocalNotifications.canNotify();
			canNotify['finally'](() => {
				$rootScope.$broadcast('cruisemonkey.notifications.ready');
			});
			canNotify.then(() => {
				$log.info('Local notifications: they can!');
			}, () => {
				$log.info('Local notifications: they can\'t. :(');
			});
		} else {
			$rootScope.$broadcast('cruisemonkey.notifications.ready');
		}
	}, () => {
		$rootScope.$broadcast('cruisemonkey.notifications.ready');
	});

//		UpgradeService.upgrade();
})
;
