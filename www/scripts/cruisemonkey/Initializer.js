(function() {
	'use strict';

	/*global ionic: true*/
	/*global cordova: true*/
	angular.module('cruisemonkey.Initializer', [
		'ionic',
		'ngCordova'
	])
	.factory('Initializer', ['$rootScope', '$timeout', '$cordovaKeyboard', '$cordovaStatusbar', '$ionicPlatform', 'Cordova', function($rootScope, $timeout, $cordovaKeyboard, $cordovaStatusbar, $ionicPlatform, Cordova) {
		console.log('CruiseMonkey Initializing.');

		Cordova.inCordova().then(function() {
			console.log('We are inside Cordova: initializing ionic platform plugins and events.');

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

		return {};
	}]);
}());
