(function() {
	'use strict';

	/*global isMobile: true*/

	angular.module('cruisemonkey.Cordova', [
		'ng',
		'ngAnimate'
	])
	.factory('CordovaService', ['$rootScope', '$document', '$window', '$q', '$timeout', '$animate', function($rootScope, $document, $window, $q, $timeout, $animate) {
		var isCordova = $q.defer();
		var initWait = 5000;

		var ua = navigator.userAgent;
		var androidVersion = ua.indexOf('Android') >= 0? parseFloat(ua.slice(ua.indexOf("Android")+8)) : 0;

		var onDeviceReady = function() {
			console.info('CruiseMonkey Cordova Initialized.');

			if ($window.device) {
				console.info('Found Cordova Device Information.');
				console.info('Model:    ' + $window.device.model);
				console.info('Cordova:  ' + $window.device.cordova);
				console.info('Platform: ' + $window.device.platform);
				console.info('UUID:     ' + $window.device.uuid);
				console.info('Version:  ' + $window.device.version);

				// if we're on older Android, disable animations
				if (androidVersion < 4.3) {
					$animate.enabled(false);
				}
			} else {
				console.warn('Deviceready event fired, but window.device not found!');
			}
			isCordova.resolve(true);
		};

		document.addEventListener("deviceready", onDeviceReady, false);

		if (isMobile) {
			console.info('CordovaService: "isMobile" set.  Assuming Cordova.');
		} else {
			console.info('CordovaService: "isMobile" not set.  Waiting for Cordova initialization.');
			$timeout(function() {
				console.warn("Cordova initialization didn't happen within " + initWait + "ms.  Assuming it never will.");
				document.removeEventListener("deviceready", onDeviceReady);
				isCordova.resolve(false);
			}, initWait);
		}

		var ifNotCordova = {
			'otherwise': function(callback) {
				$q.when(isCordova.promise).then(function(cordova) {
					if (!cordova) {
						callback();
					}
				});
			}
		};

		var ifCordova = function(callback) {
			$q.when(isCordova.promise).then(function(cordova) {
				if (cordova) {
					callback();
				}
			});
			return ifNotCordova;
		};

		return {
			'isCordova': function() {
				return isCordova.promise;
			},
			'ifCordova': ifCordova
		};
	}]);
}());
