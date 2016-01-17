(function () {
	'use strict';

	/* global isMobile: true */
	/* global cordova: true */
	/* global Camera: true */
	/* global StatusBar: true */

	require('./util/string-monkeypatch');
	require('./util/array-monkeypatch');

	// css
	require('./css/normalize.css');
	require('../scss/cruisemonkey.scss');
	require('ionicons/scss/ionicons.scss');

	var angular = require('angular');

	require('./3rdparty/imgcache.js/js/imgcache.js');
	require('imports?ImgCache=imgcache.js!angular-imgcache');

	var templates = {
		'about': require('ngtemplate!html!./about/about.html'),
		'amenities': require('ngtemplate!html!./amenities/amenities.html'),
		'decksList': require('ngtemplate!html!./decks/list.html'),
		'emoji': require('ngtemplate!html!./emoji/emoji.html'),
		'eventsList': require('ngtemplate!html!./events/list.html'),
		'forumsList': require('ngtemplate!html!./forums/list.html'),
		'forumsView': require('ngtemplate!html!./forums/view.html'),
		'info': require('ngtemplate!html!./info/info.html'),
		'karaokeList': require('ngtemplate!html!./karaoke/list.html'),
		'newTweet': require('ngtemplate!html!./twitarr/new.html'),
		'seamailSeamail': require('ngtemplate!html!./seamail/seamail.html'),
		'seamailSeamails': require('ngtemplate!html!./seamail/seamails.html'),
		'settings': require('ngtemplate!html!./settings/settings.html'),
		'tabs': require('ngtemplate!html!./tabs.html'),
		'twitarrStream': require('ngtemplate!html!./twitarr/stream.html'),
		'twitarrTweet': require('ngtemplate!html!./twitarr/tweet.html')
	};

	require('./about/Controller');

	require('./amenities/Controller');

	require('./cordova/Initializer');
	require('./cordova/Notifications');

	require('./data/DB');
	require('./data/Upgrades');

	require('./decks/Controller');

	require('./emoji/Emoji');

	require('./events/Controller');
	require('./events/Service');

	require('./forums/Controller');
	require('./forums/Service');

	require('./karaoke/Controller');

	require('./login/Controller');

	require('./seamail/Controller');
	require('./seamail/New');
	require('./seamail/Service');

	require('./settings/Controller');
	require('./settings/Service');

	require('./twitarr/Controller');
	require('./twitarr/Service');

	require('./user/Detail');
	require('./user/User');

	angular.module('cruisemonkey',
	[
		'ionic',
		'jett.ionic.filter.bar',
		'ngCordova',
		'ngFileUpload',
		'ui.router',
		'ImgCache',
		'cruisemonkey.Config',
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
		'cruisemonkey.seamail.Controller',
		'cruisemonkey.seamail.Service',
		'cruisemonkey.DB',
		'cruisemonkey.Events',
		'cruisemonkey.Initializer',
		'cruisemonkey.Notifications',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.Upgrades',
		'cruisemonkey.user.User'
	])
	.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider, ImgCacheProvider) {
		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		ImgCacheProvider.setOption('debug', true);
		ImgCacheProvider.setOption('usePersistentCache', true);
		ImgCacheProvider.manualInit = true;

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|file|filesystem|blob|cdvfile|data):/);

		// $ionicConfigProvider.views.maxCache(5);
		// $ionicConfigProvider.views.transition('none');
		$ionicConfigProvider.views.forwardCache(true);

		$ionicFilterBarConfigProvider.theme('dark');

		$urlRouterProvider.otherwise('/tab/twitarr');

		$stateProvider
			.state('tab', {
				url: '/tab',
				abstract: true,
				templateUrl: templates['tabs']
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
						templateUrl: templates['twitarrTweet'],
						controller: 'CMTweetCtrl',
						resolve: {
							tweet: function($stateParams, Twitarr) {
								return Twitarr.getTweet($stateParams.id).then(function(tweet) {
									return Twitarr.getUserInfo(tweet.author).then(function(user) {
										tweet.authorUser = user;
										return tweet;
									}, function(err) {
										return tweet;
									});
								});
							},
							twitarrRoot: function(SettingsService) {
								return SettingsService.getTwitarrRoot();
							}
						}
					}
				}
			})
			.state('tab.seamail', {
				url: '/seamail',
				views: {
					'tab-seamail': {
						templateUrl: templates['seamailSeamails'],
						controller: 'CMSeamailsCtrl',
						resolve: {
							seamails: function(SeamailService, UserService) {
								if (UserService.loggedIn()) {
									return SeamailService.list().then(function(seamails) {
										return seamails;
									}, function(err) {
										return [];
									});
								} else {
									return [];
								}
							}
						}
					}
				}
			})
			.state('tab.seamail-view', {
				url: '/seamail/:id',
				views: {
					'tab-seamail': {
						templateUrl: templates['seamailSeamail'],
						controller: 'CMSeamailCtrl',
						resolve: {
							seamail: function($stateParams, SeamailService, UserService) {
								if (UserService.loggedIn()) {
									return SeamailService.get($stateParams.id);
								} else {
									return {};
								}
							}
						}
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
						templateUrl: templates['info']
					}
				}
			})
			.state('tab.info-amenities', {
				url: '/info/amenities',
				views: {
					'tab-info': {
						templateUrl: templates['amenities'],
						controller: 'CMAmenitiesCtrl'
					}
				}
			})
			.state('tab.info-forums', {
				url: '/info/forums',
				views: {
					'tab-info': {
						templateUrl: templates['forumsList'],
						controller: 'CMForumsCtrl',
						resolve: {
							forums: function(ForumService) {
								return ForumService.list();
							}
						}
					}
				}
			})
			.state('tab.info-forum', {
				url: '/info/forums/:id',
				views: {
					'tab-info': {
						templateUrl: templates['forumsView'],
						controller: 'CMForumCtrl',
						resolve: {
							forum: function($stateParams, ForumService) {
								return ForumService.get($stateParams.id);
							}
						}
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
			.state('tab.settings', {
				url: '/settings',
				views: {
					'tab-settings': {
						templateUrl: templates['settings'],
						controller: 'CMSettingsCtrl'
					}
				}
			})
			/*
			.state('app.amenities', {
				url: '/amenities',
				views: {
					'menuContent': {
						templateUrl: templates['amenities'],
						controller: 'CMAmenitiesCtrl'
					}
				}
			})
			.state('app.deck-plans', {
				cache: false,
				url: '/deck-plans',
				views: {
					'menuContent': {
						templateUrl: templates['decksList'],
						controller: 'CMDeckListCtrl'
					}
				}
			})
			.state('app.about', {
				url: '/about',
				views: {
					'menuContent': {
						templateUrl: templates['about'],
						controller: 'CMAboutCtrl'
					}
				}
			})
			*/
		;
	})
	/* EventService & Notifications are here just to make sure they initializes early */
	.run(function($http, $cordovaCamera, $cordovaKeyboard, $cordovaSplashscreen, $injector, $ionicModal, $ionicPlatform, $ionicPopover, $ionicPopup, $log, $q, $rootScope, $sce, $state, $templateCache, $timeout, $window, ImgCache, Cordova, kv, EmojiService, EventService, LocalNotifications, Notifications, SettingsService, Twitarr, UpgradeService, UserService) {
		$log.info('CruiseMonkey run() called.');

		$rootScope.UserService = UserService;

		ImgCache.$init();
		SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
			$rootScope.twitarrRoot = twitarrRoot;
		});

		var inCordova = Cordova.inCordova();

		var moment = require('moment');
		require('moment-timezone');
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

		var newTweetModal;
		$ionicModal.fromTemplateUrl(templates['newTweet'], {
			animation: 'slide-in-up',
			focusFirstInput: false
		}).then(function(modal) {
			if (navigator.camera) {
				var cameraOptions = {
					correctOrientation: true,
					encodingType: Camera.EncodingType.JPEG,
					destinationType: Camera.DestinationType.FILE_URI,
					mediaType: Camera.MediaType.PICTURE,
					quality: 80,
					saveToPhotoAlbum: true
				};
			}

			var emojiPopover;
			$ionicPopover.fromTemplateUrl(templates['emoji'], {
			}).then(function(p) {
				p.scope.emojiTypes = EmojiService.types();
				p.scope.chooseEmoji = function(emoji) {
					if (modal.scope.tweet.text.length === 0) {
						modal.scope.tweet.text += ':' + emoji + ':';
					} else {
						modal.scope.tweet.text += ' :' + emoji + ':';
					}
					modal.scope.$evalAsync(function() {
						p.hide().then(function() {
							var el = document.getElementById('tweet-text');
							el.focus();
							el.setSelectionRange(modal.scope.tweet.text.length+1, modal.scope.tweet.text.length+1);
						});
					});
				}

				$log.debug('got emoji popover: ' + angular.toJson(p));
				emojiPopover = p;
			});

			modal.scope.showEmoji = function(ev) {
				emojiPopover.show(ev);
			};

			var onError = function(err) {
				$rootScope.$evalAsync(function() {
					$log.error('NewTweet.doPhoto: ERROR: ' + angular.toJson(err));
					if (err !== 'no image selected') {
						$ionicPopup.alert({
							title: 'Failed',
							template: 'An error occurred while uploading your photo.'
						});
					}
					delete modal.scope.photoUploading;
				});
			};

			var doPhoto = function(type) {
				SettingsService.getTwitarrRoot().then(function(tr) {
					modal.scope.twitarrRoot = tr;
				});
				var options = angular.copy(cameraOptions);
				options.sourceType = type;
				//options.destinationType = Camera.DestinationType.DATA_URL;
				if (type === Camera.PictureSourceType.PHOTOLIBRARY) {
					options.saveToPhotoAlbum = false;
				}
				$cordovaCamera.getPicture(options).then(function(results) {
					/*
					Twitarr.postPhoto(results).then(function(res) {
						var response = angular.fromJson(res.response);
						modal.scope.tweet.photo = response.files[0].photo;
						delete modal.scope.photoUploading;
					},
					onError,
					function(progress) {
						$log.debug('progress=' + angular.toJson(progress));
						modal.scope.photoUploading = progress;
					});
					*/
					$window.resolveLocalFileSystemURL(results, function(path) {
						$rootScope.$evalAsync(function() {
							$log.debug('matched path: ' + path.toURL());
							Twitarr.postPhoto(path.toURL()).then(function(res) {
								var response = angular.fromJson(res.response);
								modal.scope.tweet.photo = response.files[0].photo;
								delete modal.scope.photoUploading;
							},
							onError,
							function(progress) {
								$log.debug('progress=' + angular.toJson(progress));
								modal.scope.photoUploading = progress;
							});
						});
					}, onError);
				}, onError);
			};

			modal.scope.closeModal = function() {
				modal.hide();
			};
			modal.scope.addPhoto = function() {
				doPhoto(Camera.PictureSourceType.PHOTOLIBRARY);
			};
			modal.scope.takePhoto = function() {
				doPhoto(Camera.PictureSourceType.CAMERA);
			};
			modal.scope.postTweet = function(tweet) {
				Twitarr.postTweet(tweet).then(function(newTweet) {
					modal.hide();
					$rootScope.$broadcast('cruisemonkey.notify.tweetPosted', newTweet);
				}, function(err) {
					$ionicPopup.alert({
						title: 'Failed',
						template: 'Failed to post Tweet: ' + err[0]
					});
				});
			};

			modal.scope.uploadPic = function(pic) {
				if (pic instanceof Array) {
					pic = pic[0];
				}
				$log.info('Upload Picture: ' + angular.toJson(pic));
				Twitarr.postPhoto(pic).then(function(res) {
					//$log.debug('res=' + angular.toJson(res));
					modal.scope.tweet.photo = res.data.files[0].photo;
					delete modal.scope.photoUploading;
				}, function(err) {
					$ionicPopup.alert({
						title: 'Failed',
						template: 'An error occurred while uploading your photo.'
					});
					delete modal.scope.photoUploading;
				}, function(progress) {
					//$log.debug('progress=' + angular.toJson(progress));
					modal.scope.photoUploading = progress;
				});
			};

			modal.scope.selectFile = function() {
				angular.element('#file-upload').click();
			};

			modal.scope.fileSelected = function(file, files, errFiles, evt) {
				$log.debug('file=' + angular.toJson(file));
				/*
				$log.debug('files=' + angular.toJson(files));
				$log.debug('errFiles=' + angular.toJson(errFiles));
				$log.debug('evt=' + angular.toJson(evt));
				*/
				modal.scope.$evalAsync(function() {
					modal.scope.uploadPic(file[0]);
				});
			};

			newTweetModal = modal;
		});

		$rootScope.newTweet = function(replyTo) {
			SettingsService.getTwitarrRoot().then(function(tr) {
				newTweetModal.scope.twitarrRoot = tr;
			});
			newTweetModal.scope.canCamera = navigator.camera? true:false;
			if (replyTo) {
				var text = '';
				text += '@' + replyTo.author + ' ';
				if (replyTo.mentions) {
					for (var i=0; i < replyTo.mentions.length; i++) {
						text += '@' + replyTo.mentions[i] + ' ';
					}
				}
				newTweetModal.scope.tweet = {
					text: text,
					parent: replyTo.id
				};
			} else {
				newTweetModal.scope.tweet = { text: '' };
			}
			$log.info('Creating new tweet: ' + angular.toJson(newTweetModal.scope.tweet));
			newTweetModal.show();
		};

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

		var currentView;
		kv.get('cruisemonkey.navigation.current-view').then(function(cv) {
			if (cv && cv.stateName) {
				$rootScope.$evalAsync(function() {
					$log.debug('restoring view: ' + cv.stateName);
					var stateSections = cv.stateName.split('-');
					if (stateSections.length > 1) {
						$log.debug('Navigating to: ' + stateSections[0]);
						$state.go(stateSections[0]).then(function() {
							$timeout(function() {
								$log.debug('Navigating to: ' + cv.stateName);
								$state.go(cv.stateName, cv.stateParams);
							}, 50);
						});
					} else {
						$log.debug('Navigating to: ' + cv.stateName);
						$state.go(cv.stateName, cv.stateParams);
					}
				});
			}
		});

		var updateCurrentView = function(view) {
			return kv.set('cruisemonkey.navigation.current-view', view);
		};

		$rootScope.$on('$ionicView.enter', function(ev, info) {
			kv.set('cruisemonkey.navigation.current-view', info);
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
