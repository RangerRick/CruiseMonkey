(function () {
	'use strict';

	/* global isMobile: true */
	/* global ionic: true */
	/* global cordova: true */
	/* global Camera: true */
	/* global StatusBar: true */
	/* global moment: true */

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
		'cruisemonkey.controllers.Menu',
		'cruisemonkey.controllers.Navigation',
		'cruisemonkey.controllers.Seamail',
		'cruisemonkey.controllers.Twitarr.Stream',
		'cruisemonkey.emoji.Emoji',
		'cruisemonkey.DB',
		'cruisemonkey.Events',
		'cruisemonkey.Images',
		'cruisemonkey.Initializer',
		'cruisemonkey.Notifications',
		'cruisemonkey.Seamail',
		'cruisemonkey.Settings',
		'cruisemonkey.State',
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
			templateUrl: 'template/search.html',
			transclude: false,
			scope: {
				searchString: '=ngModel',
				onSearchChanged: '&'
			},
			replace: true,
			link: function(scope, elem, attrs, ctrl) {
				scope.placeholder = attrs.placeholder || 'Search';
				scope.searchStringInternal = nullSafeLowerCase(scope.searchString);
				scope.onSearchChanged("blah");

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
		if (isMobile) {
			ionic.Platform.fullScreen(false,true);
		}

		ImgCacheProvider.setOption('debug', true);
		ImgCacheProvider.setOption('usePersistentCache', true);
		ImgCacheProvider.manualInit = true;

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file):/);

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
				templateUrl: 'template/tabs.html'
			})
			.state('tab.twitarr', {
				url: '/twitarr',
				views: {
					'tab-twitarr': {
						templateUrl: 'template/twitarr-stream.html',
						controller: 'CMTwitarrStreamCtrl',
					},
				},
			})
			.state('tab.seamail', {
				url: '/seamail',
				views: {
					'tab-seamail': {
						templateUrl: 'template/seamail.html',
						controller: 'CMSeamailCtrl',
					},
				},
			})
			.state('tab.events', {
				url: '/events',
				views: {
					'tab-events': {
						templateUrl: 'template/events.html',
						controller: 'CMEventsCtrl',
					},
				},
			})
			.state('tab.info', {
				url: '/info',
				views: {
					'tab-info': {
					}
				}
			})
			.state('tab.settings', {
				url: '/settings',
				views: {
					'tab-settings': {
						templateUrl: 'template/advanced.html',
						controller: 'CMAdvancedCtrl',
					},
				},
			})
			/*
			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'template/menu.html',
				controller: 'CMMenuCtrl'
			})
			.state('app.events', {
				url: '/events',
				abstract: true,
				views: {
					'menuContent': {
						templateUrl: 'template/events-tabs.html',
						controller: 'CMEventsBarCtrl',
						resolve: {
							redirect: function($state) {
								var lastTab; // = storage.get('cruisemonkey.menu.last-tab');
								if (!lastTab) {
									lastTab = 'app.events.official';
								}
								$state.go(lastTab);
							},
						},
					}
				}
			})
			.state('app.events.official', {
				url: '/official',
				views: {
					'events-official': {
						templateUrl: 'template/event-list-official.html',
						controller: 'CMOfficialEventCtrl'
					}
				}
			})
			.state('app.events.unofficial', {
				url: '/unofficial',
				views: {
					'events-unofficial': {
						templateUrl: 'template/event-list-unofficial.html',
						controller: 'CMUnofficialEventCtrl'
					}
				}
			})
			.state('app.events.all', {
				url: '/all',
				views: {
					'events-all': {
						templateUrl: 'template/event-list-all.html',
						controller: 'CMAllEventCtrl'
					}
				}
			})
			.state('app.events.my', {
				url: '/my',
				views: {
					'events-my': {
						templateUrl: 'template/event-list-my.html',
						controller: 'CMMyEventCtrl'
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
			*/
		;
	})
	/* EventService & Notifications are here just to make sure they initializes early */
	.run(function($q, $rootScope, $log, $injector, $sce, $state, $timeout, $window, $cordovaCamera, $cordovaKeyboard, $cordovaSplashscreen, $ionicModal, $ionicPlatform, $ionicPopover, $ionicPopup, ImgCache, util, Cordova, kv, EmojiService, EventService, Images, LocalNotifications, Notifications, SettingsService, Twitarr, UpgradeService, UserService) {
		console.log('CruiseMonkey run() called.');

		ImgCache.$init();
		SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
			$rootScope.twitarrRoot = twitarrRoot;
		});

		var inCordova = Cordova.inCordova();

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
		$ionicModal.fromTemplateUrl('template/new-tweet.html', {
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
			$ionicPopover.fromTemplateUrl('template/emoji.html', {
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
			newTweetModal.scope.canCamera = (navigator.camera? true:false);
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
