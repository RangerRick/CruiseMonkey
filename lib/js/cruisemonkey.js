(function () {
	'use strict';

	/* global isMobile: true */
	/* global cordova: true */
	/* global Camera: true */
	/* global StatusBar: true */

	require('./string-monkeypatch');
	require('./array-monkeypatch');
	require('es5-shim');
	require('classlist');

	require('winstore-jscompat/winstore-jscompat');

	// css
	require('../css/normalize.css');
	require('../../scss/cruisemonkey.scss');
	require('ionicons/scss/ionicons.scss');

	require('ionic');

	var angular = require('angular');
	require('angular-animate');
	require('angular-sanitize');
	require('angular-ui-router');
	require('ionic-angular');

	require('./3rdparty/imgcache.js/js/imgcache.js');
	require('imports?ImgCache=imgcache.js!angular-imgcache');

	require('ngCordova');

	require('./Config');

	var templates = {
		'about': require('ngtemplate!html!../../www/template/about.html'),
		'advanced': require('ngtemplate!html!../../www/template/advanced.html'),
		'amenities': require('ngtemplate!html!../../www/template/amenities.html'),
		'deckPlans': require('ngtemplate!html!../../www/template/deck-plans.html'),
		'emoji': require('ngtemplate!html!../../www/template/emoji.html'),
		'events': require('ngtemplate!html!../../www/template/events.html'),
		'forumsList': require('ngtemplate!html!./forums/list.html'),
		'forumsView': require('ngtemplate!html!./forums/view.html'),
		'info': require('ngtemplate!html!../../www/template/info.html'),
		'karaokeSearch': require('ngtemplate!html!../../www/template/karaoke.search.html'),
		'newTweet': require('ngtemplate!html!../../www/template/new-tweet.html'),
		'seamailSeamails': require('ngtemplate!html!./seamail/seamails.html'),
		'search': require('ngtemplate!html!../../www/template/search.html'),
		'tabs': require('ngtemplate!html!../../www/template/tabs.html'),
		'twitarrStream': require('ngtemplate!html!../../www/template/twitarr-stream.html'),
	};

	// controllers
	require('./Controller.About');
	require('./Controller.Advanced');
	require('./Controller.Amenities');
	require('./Controller.DeckList');
	require('./Controller.Events');
	require('./Controller.Karaoke');
	require('./Controller.Login');
	require('./Controller.Twitarr.Stream');
	require('./data/DB');
	require('./data/Twitarr');
	require('./Events');
	require('./Initializer');
	require('./Notifications');
	require('./Upgrades');
	require('./Util');
	require('./emoji/Emoji');
	require('./forums/Controller');
	require('./forums/Service');
	require('./seamail/Controller');
	require('./seamail/New');
	require('./seamail/Service');
	require('./user/Detail');
	require('./user/User');

	angular.module('cruisemonkey',
	[
		'ionic',
		'ngCordova',
		'ngFileUpload',
		'ui.router',
		'ImgCache',
		'cruisemonkey.Config',
		'cruisemonkey.controllers.About',
		'cruisemonkey.controllers.Advanced',
		'cruisemonkey.controllers.Amenities',
		'cruisemonkey.controllers.DeckList',
		'cruisemonkey.controllers.Events',
		'cruisemonkey.controllers.Karaoke',
		'cruisemonkey.controllers.Login',
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
		'cruisemonkey.user.User',
		'cruisemonkey.Util',
	])
	.directive('cmSearchBar', function($timeout, $cordovaKeyboard) {
		var nullSafeLowerCase = function(s) {
			if (s) {
				return s.trim().toLowerCase();
			} else {
				return s;
			}
		};

		return {
			restrict: 'AE',
			templateUrl: templates['search'],
			transclude: false,
			scope: {
				searchString: '=ngModel',
				onSearchChanged: '&'
			},
			replace: true,
			link: function(scope, elem, attrs, ctrl) {
				scope.placeholder = attrs.placeholder || 'Search';
				scope.searchStringInternal = nullSafeLowerCase(scope.searchString);
				scope.onSearchChanged('blah');

				var callChangeFunction = function() {
					var s = scope;
					console.log('scope=' + angular.toJson(s));
					if (angular.isDefined(s) && angular.isFunction(s.onSearchChanged)) {
						scope.$evalAsync(function() {
							s.onSearchChanged(s.searchString);
						});
					} else {
						console.log('warning: no scope (' + angular.toJson(s) + ')');
					}
				};

				var timeout = null;
				scope.updateSearchString = function() {
					if (timeout) {
						return;
					} else {
						timeout = $timeout(function() {
							timeout = null;
							scope.searchString = nullSafeLowerCase(scope.searchStringInternal);
							callChangeFunction();
						}, 500);
					}
				};
				scope.clearSearchString = function() {
					scope.searchStringInternal = scope.searchString = '';
					angular.element(elem).find('input').blur();
					callChangeFunction();
				};
			}
		};
	})
	.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider, ImgCacheProvider) {
		console.log('cruisemonkey.config');

		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		ImgCacheProvider.setOption('debug', true);
		ImgCacheProvider.setOption('usePersistentCache', true);
		ImgCacheProvider.manualInit = true;

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|file|filesystem|blob|cdvfile|data):/);

		$ionicConfigProvider.views.maxCache(20);
		$ionicConfigProvider.views.transition('none');
		$ionicConfigProvider.views.forwardCache(true);

		//$ionicConfigProvider.navBar.positionPrimaryButtons('left');
		//$ionicConfigProvider.navBar.positionSecondaryButtons('right');

		//$ionicConfigProvider.tabs.position('bottom');

		$urlRouterProvider.otherwise('/tab/twitarr');

		$stateProvider
			.state('tab', {
				url: '/tab',
				abstract: true,
				templateUrl: templates['tabs'],
			})
			.state('tab.twitarr', {
				url: '/twitarr',
				views: {
					'tab-twitarr': {
						templateUrl: templates['twitarrStream'],
						controller: 'CMTwitarrStreamCtrl',
					},
				},
			})
			.state('tab.seamail', {
				url: '/seamail',
				views: {
					'tab-seamail': {
						templateUrl: templates['seamailSeamails'],
						controller: 'CMSeamailCtrl',
						resolve: {
							seamails: function(SeamailService) {
								return SeamailService.list().then(function(seamails) {
									return seamails;
								}, function(err) {
									return [];
								});
							}
						}
					},
				},
			})
			.state('tab.events', {
				url: '/events',
				views: {
					'tab-events': {
						templateUrl: templates['events'],
						controller: 'CMEventsCtrl',
					},
				},
			})
			.state('tab.info', {
				url: '/info',
				views: {
					'tab-info': {
						templateUrl: templates['info'],
					}
				}
			})
			.state('tab.info-amenities', {
				url: '/info/amenities',
				views: {
					'tab-info': {
						templateUrl: templates['amenities'],
						controller: 'CMAmenitiesCtrl',
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
						templateUrl: templates['karaokeSearch'],
						controller: 'CMKaraokeSearchCtrl',
					}
				}
			})
			.state('tab.settings', {
				url: '/settings',
				views: {
					'tab-settings': {
						templateUrl: templates['advanced'],
						controller: 'CMAdvancedCtrl',
					},
				},
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
						templateUrl: templates['deckPlans'],
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
	.run(function($q, $rootScope, $http, $log, $templateCache, $injector, $sce, $state, $timeout, $window, $cordovaCamera, $cordovaKeyboard, $cordovaSplashscreen, $ionicModal, $ionicPlatform, $ionicPopover, $ionicPopup, ImgCache, util, Cordova, kv, EmojiService, EventService, LocalNotifications, Notifications, SettingsService, Twitarr, UpgradeService, UserService) {
		console.log('CruiseMonkey run() called.');

		ImgCache.$init();
		SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
			$rootScope.twitarrRoot = twitarrRoot;
		});

		var inCordova = Cordova.inCordova();

		var moment = require('moment');
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
					saveToPhotoAlbum: true,
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
					console.log('NewTweet.doPhoto: ERROR: ' + angular.toJson(err));
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
						console.log('progress=' + angular.toJson(progress));
						modal.scope.photoUploading = progress;
					});
					*/
					$window.resolveLocalFileSystemURL(results, function(path) {
						$rootScope.$evalAsync(function() {
							console.log('matched path: ' + path.toURL());
							Twitarr.postPhoto(path.toURL()).then(function(res) {
								var response = angular.fromJson(res.response);
								modal.scope.tweet.photo = response.files[0].photo;
								delete modal.scope.photoUploading;
							},
							onError,
							function(progress) {
								console.log('progress=' + angular.toJson(progress));
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
				Twitarr.postTweet(tweet).then(function() {
					modal.hide();
					$rootScope.$broadcast('cruisemonkey.notify.tweetPosted', tweet);
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
				console.log('Upload Picture: ' + angular.toJson(pic));
				Twitarr.postPhoto(pic).then(function(res) {
					//console.log('res=' + angular.toJson(res));
					modal.scope.tweet.photo = res.data.files[0].photo;
					delete modal.scope.photoUploading;
				}, function(err) {
					$ionicPopup.alert({
						title: 'Failed',
						template: 'An error occurred while uploading your photo.'
					});
					delete modal.scope.photoUploading;
				}, function(progress) {
					//console.log('progress=' + angular.toJson(progress));
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
			console.log('Creating new tweet: ' + angular.toJson(newTweetModal.scope.tweet));
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

		/*
		var currentView;
		kv.get('cruisemonkey.navigation.current-view').then(function(cv) {
			currentView = cv;
			if (cv && cv !== '') {
				$timeout(function() {
					console.log('restoring view: ' + currentView);
					util.go(currentView);
				});
			}
		});
		*/

		var updateCurrentView = function(view) {
			return kv.set('cruisemonkey.navigation.current-view', view);
		};

		$rootScope.$on('$ionicView.enter', function(ev, info) {
			updateCurrentView(info.stateName);
		});


		inCordova.then(function() {
			console.log('In cordova.  Hiding splash screen.');
			$cordovaSplashscreen.hide();

			console.log('Making sure the user can do notifications.');
			var canNotify = LocalNotifications.canNotify();
			canNotify['finally'](function() {
				$rootScope.$broadcast('cruisemonkey.notifications.ready');
			});
			canNotify.then(function() {
				console.log('Local notifications: they can!');
			}, function() {
				console.log('Local notifications: they can\'t. :(');
			});
		}, function() {
			$rootScope.$broadcast('cruisemonkey.notifications.ready');
		});

		UpgradeService.upgrade();
	})
	;
}());
