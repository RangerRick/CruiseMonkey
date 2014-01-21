(function() {
	'use strict';

	/*global isMobile: true*/

	angular.module('cruisemonkey.Cordova', [
		'ng',
		'cruisemonkey.Logging'
	])
	.factory('CordovaService', ['$rootScope', '$document', '$window', '$q', '$timeout', 'LoggingService', function($rootScope, $document, $window, $q, $timeout, log) {
		var isCordova = $q.defer();

		var onDeviceReady = function() {
			log.info('CruiseMonkey Cordova Initialized.');

			if ($window.device) {
				log.info('Found Cordova Device Information.');
				log.info('Model:    ' + $window.device.model);
				log.info('Cordova:  ' + $window.device.cordova);
				log.info('Platform: ' + $window.device.platform);
				log.info('UUID:     ' + $window.device.uuid);
				log.info('Version:  ' + $window.device.version);
			} else {
				log.warn('Deviceready event fired, but window.device not found!');
			}
			isCordova.resolve(true);
		};

		if (isMobile) {
			log.info('CordovaService: "isMobile" set.  Assuming Cordova.');
			onDeviceReady();
			document.addEventListener("deviceready", function() {
				log.warn('Initialization has already happened, but deviceready fired again. WTF?');
			}, false);
		} else {
			log.info('CordovaService: "isMobile" not set.  Waiting for Cordova initialization.');
			document.addEventListener("deviceready", onDeviceReady, false);
			$timeout(function() {
				log.warn('Cordova initialization never happened.  Assuming it never will.');
				document.removeEventListener("deviceready", onDeviceReady);
				isCordova.resolve(false);
			}, 1000);
		}

		return {
			'isCordova': function() {
				return isCordova.promise;
			},
			'ifCordova': function(yesCallback, noCallback) {
				$q.when(isCordova.promise).then(function(cordova) {
					if (cordova && yesCallback) {
						yesCallback();
					} else {
						if (noCallback) {
							noCallback();
						}
					}
				});
			}
		};
	}]);
}());