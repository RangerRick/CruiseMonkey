(function() {
	'use strict';

	/*global isMobile: true*/

	angular.module('cruisemonkey.Cordova', [
		'ng'
	])
	.factory('CordovaService', ['$rootScope', '$document', '$window', '$q', '$timeout', function($rootScope, $document, $window, $q, $timeout) {
		var isCordova = $q.defer();

		var onDeviceReady = function() {
			console.log('CruiseMonkey Cordova Initialized.');

			if ($window.device) {
				console.log('Found Cordova Device Information.');
				console.log('Model:    ' + $window.device.model);
				console.log('Cordova:  ' + $window.device.cordova);
				console.log('Platform: ' + $window.device.platform);
				console.log('UUID:     ' + $window.device.uuid);
				console.log('Version:  ' + $window.device.version);
			} else {
				console.log('WARNING: deviceready event fired, but window.device not found!');
			}
			isCordova.resolve(true);
		};

		if (isMobile) {
			console.log('"isMobile" set.  Assuming Cordova.');
			onDeviceReady();
			document.addEventListener("deviceready", function() {
				console.log('Initialization has already happened, but deviceready fired again. WTF?');
			}, false);
		} else {
			document.addEventListener("deviceready", onDeviceReady, false);
			$timeout(function() {
				console.log('Cordova initialization never happened.  Assuming it never will.');
				document.removeEventListener("deviceready", onDeviceReady);
				isCordova.resolve(false);
			}, 5000);
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