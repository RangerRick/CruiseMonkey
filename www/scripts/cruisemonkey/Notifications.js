(function() {
	'use strict';

	/*global isMobile: true*/
	/*global ionic: true*/
	/*global toastr: true*/

	function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	angular.module('cruisemonkey.Notifications', [
		'ngCordova'
	])
	.factory('Notifications', ['$q', '$rootScope', '$timeout', '$ionicPopup', '$cordovaDialogs', '$cordovaLocalNotification', '$cordovaToast', function($q, $rootScope, $timeout, $ionicPopup, $cordovaDialogs, $cordovaLocalNotification, $cordovaToast) {
		console.info('Initializing notification service.');
		var newEvents = [];
		var newSeamails = [];

		var isCordova = ionic.Platform.isWebView();
		toastr.options.preventDuplicates = true;
		/*
		toastr.options.closeButton = true;
		toastr.options.closeHtml = '<button><i class="icon ion-close-circled"></i></button>';
		*/

		$rootScope.$on('cruisemonkey.notify.newEvent', function(ev, newEvent) {
			console.debug('Notifications: A new event was added to the database:',newEvent);
			newEvents.push(newEvent);
		});

		$rootScope.$on('cruisemonkey.notify.newSeamail', function(ev, newSeamail) {
			console.debug('Notifications: A new seamail message was received:',newSeamail);
		});

		$rootScope.$on('cruisemonkey.notify.alert', function(ev, alert) {
			console.debug('Notifications: Alert: ' + alert.message);
			if (isCordova) {
				$cordovaDialogs.alert(alert.message, alert.title, alert.buttonName);
			} else {
				var opts = {};
				if (alert.title) {
					opts.title = alert.title;
					opts.message = alert.message;
				} else {
					opts.title = alert.message;
				}
				if (alert.buttonName) {
					opts.okText = alert.buttonName;
				}
				$ionicPopup.alert(opts);
			}
		});

		$rootScope.$on('cruisemonkey.notify.toast', function(ev, toast) {
			var timeout = toast.timeout || 3000;
			console.debug('Notifications: Toast(' + timeout + '): ' + toast.message);
			if (isCordova) {
				var duration = 'short';
				if (timeout >= 5000) {
					duration = 'long';
				}
				$cordovaToast.show(toast.message, duration, 'top');
			} else {
				toastr.info(toast.message);
			}
		});

		return {
		};
	}]);
}());
