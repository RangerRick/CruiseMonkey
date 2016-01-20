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

	var templates = {
		about: require('ngtemplate!html!./about/about.html'),
		amenities: require('ngtemplate!html!./amenities/amenities.html'),
		decksList: require('ngtemplate!html!./decks/list.html'),
		emoji: require('ngtemplate!html!./emoji/emoji.html'),
		eventsList: require('ngtemplate!html!./events/list.html'),
		forumsList: require('ngtemplate!html!./forums/list.html'),
		forumsView: require('ngtemplate!html!./forums/view.html'),
		info: require('ngtemplate!html!./info/info.html'),
		karaokeList: require('ngtemplate!html!./karaoke/list.html'),
		newTweet: require('ngtemplate!html!./twitarr/new.html'),
		seamailSeamail: require('ngtemplate!html!./seamail/seamail.html'),
		seamailSeamails: require('ngtemplate!html!./seamail/seamails.html'),
		settings: require('ngtemplate!html!./settings/settings.html'),
		tabs: require('ngtemplate!html!./tabs.html'),
		twitarrStream: require('ngtemplate!html!./twitarr/stream.html'),
		twitarrTweet: require('ngtemplate!html!./twitarr/tweet.html')
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
						templateUrl: templates['info']
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
	.run(function($http, $cordovaCamera, $cordovaKeyboard, $cordovaSplashscreen, $injector, $ionicModal, $ionicPlatform, $ionicPopover, $ionicPopup, $log, $q, $rootScope, $sce, $state, $templateCache, $timeout, $window, Cordova, kv, EmojiService, EventService, LocalNotifications, Notifications, SettingsService, Twitarr, UpgradeService, UserService) {
		$log.info('CruiseMonkey run() called.');

		$rootScope.UserService = UserService;

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
				if (type === Camera.PictureSourceType.PHOTOLIBRARY) {
					options.saveToPhotoAlbum = false;
				}
				$cordovaCamera.getPicture(options).then(function(results) {
					//$log.debug('getPicture results = ' + angular.toJson(results));
					var postPhoto = function(url) {
						$rootScope.$evalAsync(function() {
							$log.debug('postPhoto: ' + url);
							Twitarr.postPhoto(url).then(function(res) {
								var response = angular.fromJson(res.response);
								modal.scope.tweet.photo = response.files[0].photo;
								delete modal.scope.photoUploading;
							},
							onError,
							function(progress) {
								modal.scope.photoUploading = progress;
							});
						});
					};

					if (results.startsWith('content:') && $window.FilePath) {
						$window.FilePath.resolveNativePath(results, function(path) {
							$rootScope.$evalAsync(function() {
								var url;
								if (path.toURL) {
									url = path.toURL();
								} else {
									url = path;
								}
								if (url.startsWith('/')) {
									url = 'file://' + url;
								}
								$log.debug('resolveNativePath: ' + results + ' -> ' + url);
								$window.resolveLocalFileSystemURL(url, function(path) {
									postPhoto(path.toURL());
								}, onError);
							});
						}, onError);
					} else {
						$window.resolveLocalFileSystemURL(results, function(path) {
							postPhoto(path.toURL());
						}, onError);
					}
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
					if (newTweet && newTweet.stream_post) {
						$log.debug('new tweet posted: ' + newTweet.stream_post.text);
						modal.hide().then(function() {
							$rootScope.$broadcast('cruisemonkey.notify.tweetPosted', newTweet.stream_post);
						});
					} else {
						$log.error('unknown response: ' + angular.toJson(newTweet));
						$ionicPopup.alert({
							title: 'Failed',
							template: 'Failed to post Tweet.  An unknown error occurred.'
						});
					}
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
				//$log.info('Upload Picture: ' + angular.toJson(pic));
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

		kv.get('cruisemonkey.navigation.current-view').then(function(cv) {
			var view = angular.copy(cv);
			if (view && view.stateName) {
				$rootScope.$evalAsync(function() {
					$log.debug('restoring view: ' + view.stateName);
					var stateSections = view.stateName.split('-');
					if (stateSections.length > 1) {
						$log.debug('Navigating to: ' + stateSections[0]);
						$state.go(stateSections[0], {}, {reload:true}).then(function() {
							$timeout(function() {
								$log.debug('Navigating to: ' + view.stateName);
								$state.go(view.stateName, view.stateParams, {reload:true});
							}, 500);
						});
					} else {
						$log.debug('Navigating to: ' + view.stateName);
						$state.go(view.stateName, view.stateParams, {reload:true});
					}
				});
			} else {
				$rootScope.$evalAsync(function() {
					$log.debug('first launch, navigating to login screen');
					$state.go('tab.info-settings');
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
