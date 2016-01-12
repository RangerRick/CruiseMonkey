(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic'),
		cordova = require('cordova');

	angular.module('cruisemonkey.Initializer', [
		'ionic',
		'ngCordova'
	])
	.factory('Cordova', function($q, $rootScope, $log, $window, $ionicPlatform) {
		var deferred = $q.defer();
		$ionicPlatform.ready(function() {
			if (ionic.Platform.isWebView()) {
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
	.factory('Initializer', function($rootScope, $timeout, $cordovaKeyboard, $cordovaStatusbar, $ionicHistory, $ionicPlatform, $ionicSideMenuDelegate, Cordova) {
		console.log('CruiseMonkey Initializing.');

		Cordova.inCordova().then(function(inCordova) {
			console.log('We are inside Cordova: initializing ionic platform plugins and events.');

			$ionicPlatform.registerBackButtonAction(function(ev) {
				var backView = $ionicHistory.backView();
				if (backView) {
					// this is OK, go ahead and let Ionic do back
				} else {
					console.log('No back view, preventing exit.');
					if ($ionicSideMenuDelegate.isOpenLeft()) {
						console.log('Side menu is open.  Leaving it open.');
					} else {
						console.log('Side menu is not open.  Opening it.');
						$ionicSideMenuDelegate.toggleLeft();
					}
					ev.preventDefault();
					ev.stopPropagation();
				}
			}, 151);

			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard or form inputs)
			$cordovaKeyboard.hideAccessoryBar(true);
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
				console.log('CruiseMonkey paused:', args);
				$rootScope.$broadcast('cruisemonkey.app.paused', args);
			});
			$ionicPlatform.on('resign', function() {
				var args = Array.prototype.slice.call(arguments);
				console.log('CruiseMonkey locked while in foreground:', args);
				$rootScope.$broadcast('cruisemonkey.app.locked', args);
			});
			$ionicPlatform.on('resume', function() {
				var args = Array.prototype.slice.call(arguments);
				console.log('CruiseMonkey resumed:', args);
				$rootScope.$broadcast('cruisemonkey.app.resumed', args);
			});
		}, function() {
			console.log('We are not inside Cordova.');
		});

		var _expected = ['cruisemonkey.notifications.ready', 'cruisemonkey.upgrade.complete'];
		var _seen = [];

		var expectedHandler = function(ev) {
			console.log('Initializer: ' + ev.name);
			_seen.push(ev.name);

			var ready = true;
			for (var i=0; i < _expected.length; i++) {
				if (_seen.indexOf(_expected[i]) === -1) {
					ready = false;
					break;
				}
			}

			if (ready) {
				console.log('CruiseMonkey is ready!');
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
