(function() {
	'use strict';

	var angular = require('angular');
	require('cordova');

	angular.module('cruisemonkey.Initializer', [
		'ionic',
		'ngCordova'
	])
	.factory('Cordova', function($ionicPlatform, $log, $q, $rootScope, $window) {
		var deferred = $q.defer();
		$ionicPlatform.ready(function() {
			if ($ionicPlatform.is('webview')) {
				deferred.resolve(true);
			} else {
				deferred.reject(false);
			}
		});

		return {
			inCordova: function() {
				return deferred.promise;
			}
		};
	})
	.factory('Initializer', function($cordovaKeyboard, $cordovaStatusbar, $ionicHistory, $ionicPlatform, $ionicSideMenuDelegate, $log, $rootScope, $timeout, Cordova) {
		$log.info('CruiseMonkey Initializing.');

		Cordova.inCordova().then(function(inCordova) {
			$log.info('We are inside Cordova: initializing ionic platform plugins and events.');

			$ionicPlatform.registerBackButtonAction(function(ev) {
				var backView = $ionicHistory.backView();
				if (backView) {
					// this is OK, go ahead and let Ionic do back
				} else {
					$log.debug('No back view, preventing exit.');
					if ($ionicSideMenuDelegate.isOpenLeft()) {
						$log.debug('Side menu is open.  Leaving it open.');
					} else {
						$log.debug('Side menu is not open.  Opening it.');
						$ionicSideMenuDelegate.toggleLeft();
					}
					ev.preventDefault();
					ev.stopPropagation();
				}
			}, 151);

			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard or form inputs)
			$cordovaKeyboard.hideAccessoryBar(false);
			$cordovaKeyboard.disableScroll(true);

			$timeout(function() {
				// config.xml says we have light content because of the splash screen, now the title bar is dark so switch
				$cordovaStatusbar.overlaysWebView(true);
				$cordovaStatusbar.style(3);
			}, 2000);

			if (cordova && cordova.plugins && cordova.plugins.certificates) {
				cordova.plugins.certificates.trustUnsecureCerts(true);
			}

			$ionicPlatform.on('pause', function() {
				var args = Array.prototype.slice.call(arguments);
				$log.debug('CruiseMonkey paused:' + angular.toJson(args));
				$rootScope.$broadcast('cruisemonkey.app.paused', args);
			});
			$ionicPlatform.on('resign', function() {
				var args = Array.prototype.slice.call(arguments);
				$log.debug('CruiseMonkey locked while in foreground:' + angular.toJson(args));
				$rootScope.$broadcast('cruisemonkey.app.locked', args);
			});
			$ionicPlatform.on('resume', function() {
				var args = Array.prototype.slice.call(arguments);
				$log.debug('CruiseMonkey resumed:' + angular.toJson(args));
				$rootScope.$broadcast('cruisemonkey.app.resumed', args);
			});
		}, function() {
			$log.debug('We are not inside Cordova.');
		});

		var _expected = ['cruisemonkey.notifications.ready', 'cruisemonkey.upgrade.complete'];
		var _seen = [];

		var expectedHandler = function(ev) {
			$log.debug('Initializer: ' + ev.name);
			_seen.push(ev.name);

			var ready = true;
			for (var i=0; i < _expected.length; i++) {
				if (_seen.indexOf(_expected[i]) === -1) {
					ready = false;
					break;
				}
			}

			if (ready) {
				$log.debug('CruiseMonkey is ready!');
				$rootScope.$broadcast('cruisemonkey.ready');
			}
		};

		for (var i=0; i < _expected.length; i++) {
			var expected = angular.copy(_expected[i]);
			$rootScope.$on(_expected[i], expectedHandler);
		}

		return {};
	});
}());
