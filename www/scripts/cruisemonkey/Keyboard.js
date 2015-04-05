(function() {
	'use strict';
	/*global isMobile: true*/
	/*global ionic: true*/
	/*global device: true*/
	
	angular.module('cruisemonkey.Keyboard', [
		'ionic',
		'ngCordova',
	]).factory('KeyboardService', ['$cordovaKeyboard', function($cordovaKeyboard) {
		var info = {
			isIOS: ionic.Platform.isIOS(),
			isIPad: ionic.Platform.isIPad(),
			isAndroid: ionic.Platform.isAndroid(),
			isWindowsPhone: ionic.Platform.isWindowsPhone(),
			isWebView: ionic.Platform.isWebView(),
			device: ionic.Platform.device()
		};
		console.log("platform: ", info);
		var keyboardSupported = function() {
			return ($cordovaKeyboard !== undefined && device.platform === 'iOS');
		};
		var closeKeyboard = function() {
			if (keyboardSupported()) {
   				  $cordovaKeyboard.close();
    		}
		};
		var hideAccessoryBar = function(boolVal) {
			if (keyboardSupported()) {
				$cordovaKeyboard.hideAccessoryBar(boolVal);
			}
		};
		var disableScroll = function(boolVal) {
			if (keyboardSupported()) {
				$cordovaKeyboard.disableScroll(boolVal);
			}
		};
		return {
			keyboardSupported: keyboardSupported,
			close: closeKeyboard,
			hideAccessoryBar: hideAccessoryBar,
			disableScroll: disableScroll
		};
	}]);
}());