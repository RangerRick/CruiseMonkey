(function() {
	'use strict';

	/*global isMobile: true*/

	angular.module('cruisemonkey.Cordova', [
		'ng',
		'ngAnimate'
	])
	.factory('CordovaService', ['$rootScope', '$document', '$window', '$q', '$timeout', '$animate', '$log', function($rootScope, $document, $window, $q, $timeout, $animate, log) {
		var isCordova = $q.defer();
		var initWait = 5000;

		var ua = navigator.userAgent;
		var androidVersion = ua.indexOf('Android') >= 0? parseFloat(ua.slice(ua.indexOf("Android")+8)) : 0;

		var onDeviceReady = function() {
			log.info('CruiseMonkey Cordova Initialized.');

			if ($window.device) {
				log.info('Found Cordova Device Information.');
				log.info('Model:    ' + $window.device.model);
				log.info('Cordova:  ' + $window.device.cordova);
				log.info('Platform: ' + $window.device.platform);
				log.info('UUID:     ' + $window.device.uuid);
				log.info('Version:  ' + $window.device.version);
				
				// if we're on older Android, disable animations
				if (androidVersion < 4.3) {
					$animate.enabled(false);
				}
			} else {
				log.warn('Deviceready event fired, but window.device not found!');
			}
			isCordova.resolve(true);
		};

		document.addEventListener("deviceready", onDeviceReady, false);

		if (isMobile) {
			log.info('CordovaService: "isMobile" set.  Assuming Cordova.');
		} else {
			log.info('CordovaService: "isMobile" not set.  Waiting for Cordova initialization.');
			$timeout(function() {
				log.warn("Cordova initialization didn't happen within " + initWait + "ms.  Assuming it never will.");
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
