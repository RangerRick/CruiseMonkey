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
		'ui.router',
		'angularFileUpload',
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
		'cruisemonkey.controllers.Seamail',
		'cruisemonkey.controllers.Twitarr.Stream',
		'cruisemonkey.Database',
		'cruisemonkey.Events',
		'cruisemonkey.Images',
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
	.factory('Cordova', ['$q', '$rootScope', '$window', function($q, $rootScope, $window) {
		var deferred;

		return {
			inCordova: function() {
				if (deferred) {
					return deferred.promise;
				}

				deferred = $q.defer();
				ionic.Platform.ready(function() {
					$rootScope.$evalAsync(function() {
						if ($window.cordova) {
							deferred.resolve(true);
						} else {
							deferred.reject(false);
						}
					});
				});
				return deferred.promise;
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
						templateUrl: 'template/event-list-official.html',
						controller: 'CMEventCtrl'
					}
				}
			})
			.state('app.events.unofficial', {
				url: '/unofficial',
				views: {
					'events-unofficial': {
						templateUrl: 'template/event-list-unofficial.html',
						controller: 'CMEventCtrl'
					}
				}
			})
			.state('app.events.my', {
				url: '/my',
				views: {
					'events-my': {
						templateUrl: 'template/event-list-my.html',
						controller: 'CMEventCtrl'
					}
				}
			})
			.state('app.events.all', {
				url: '/all',
				views: {
					'events-all': {
						templateUrl: 'template/event-list-all.html',
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
	.run(['$q', '$rootScope', '$timeout', '$window', '$state', '$cordovaCamera', '$cordovaKeyboard', '$cordovaSplashscreen', '$ionicModal', '$ionicPopover', '$ionicPopup', '$upload', 'storage', 'Cordova', 'EventService', 'Images', 'Notifications', 'SettingsService', 'Twitarr', 'UpgradeService', 'UserService', function($q, $rootScope, $timeout, $window, $state, $cordovaCamera, $cordovaKeyboard, $cordovaSplashscreen, $ionicModal, $ionicPopover, $ionicPopup, $upload, storage, Cordova, EventService, Images, Notifications, SettingsService, Twitarr, UpgradeService, UserService) {
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

		var newSeamailScope = $rootScope.$new();
		var newSeamailModal;
		$ionicModal.fromTemplateUrl('template/new-seamail.html', {
			animation: 'slide-in-up',
			focusFirstInput: true,
			scope: newSeamailScope
		}).then(function(modal) {
			newSeamailScope.closeModal = function() {
				modal.hide();
			};
			newSeamailScope.postSeamail = function(seamail, sendTo) {
				var message = angular.copy(seamail);
				if (sendTo) {
					message.users.push(sendTo);
				}
				console.log('postSeamail: seamail=' + angular.toJson(message));
				Twitarr.postSeamail(message).then(function() {
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
			newSeamailScope.newSeamail = { users: [] };
			newSeamailScope.sendTo = sendTo;
			newSeamailModal.show();
		};

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

			var doPhoto = function(type) {
				var options = angular.copy(cameraOptions);
				options.sourceType = type;
				if (type === Camera.PictureSourceType.PHOTOLIBRARY) {
					options.saveToPhotoAlbum = false;
				}
				$cordovaCamera.getPicture(options).then(function(results) {
					$window.resolveLocalFileSystemURL(results, function(path) {
						console.log('matched path: ' + path.toURL());
						//modal.scope.photo = path.toURL();
						Twitarr.postPhoto(path.toURL()).then(function(res) {
							//console.log('res=' + angular.toJson(res));
							var response = angular.fromJson(res.response);
							modal.scope.tweet.photo = response.files[0].photo;
							delete modal.scope.photoUploading;
						}, function(err) {
							$ionicPopup.alert({
								title: 'Failed',
								template: 'An error occurred while uploading your photo.'
							});
							delete modal.scope.photoUploading;
						}, function(progress) {
							console.log('progress=' + angular.toJson(progress));
							modal.scope.photoUploading = progress;
						});
					}, function(err) {
						console.log('err='+err);
						$ionicPopup.alert({
							title: 'Failed',
							template: 'An error occurred while processing your photo.'
						});
					});
				}, function(err) {
					$ionicPopup.alert({
						title: 'Failed',
						template: 'An error occurred while processing your photo: ' + err
					});
				});
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

			modal.scope.twitarrRoot = SettingsService.getTwitarrRoot();

			modal.scope.uploadPic = function(pic) {
				console.log('Upload Picture:',pic);
				Twitarr.postPhoto(pic[0]).then(function(res) {
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

			newTweetModal = modal;
		});

		$rootScope.newTweet = function(replyTo) {
			newTweetModal.scope.canCamera = (navigator.camera? true:false);
			if (replyTo) {
				var text = '';
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
			Cordova.inCordova().then(function() {
				if (ionic.Platform.isIOS()) {
					var oic = SettingsService.shouldOpenInChrome();
					if (oic) {
						if (url.startsWith('http')) {
							url = url.replace(/^http/, 'googlechrome');
						}
					}
				}
				$window.open(url, target);
			}, function() {
				$window.open(url, target);
			});
		};

		$rootScope.closeKeyboard = function() {
			Cordova.inCordova().then(function() {
				$cordovaKeyboard.close();
			});
		};

		storage.bind($rootScope, 'currentView', {
			'storeName': 'cruisemonkey.navigation.current-view'
		});

		/* restore previous view */
		var lastView = $rootScope.currentView;
		$rootScope.$on('$ionicView.enter', function(ev, info) {
			$rootScope.currentView = info.stateName;
		});

		if (lastView && lastView !== '') {
			$timeout(function() {
				console.log('restoring view: ' + lastView);
				$state.go(lastView);
			});
		}

		Cordova.inCordova().then(function() {
			$cordovaSplashscreen.hide();
		});

		UpgradeService.upgrade();
	}])
	;
}());
