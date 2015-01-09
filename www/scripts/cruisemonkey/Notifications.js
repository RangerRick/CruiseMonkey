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
	.factory('Notifications', ['$q', '$rootScope', '$timeout', '$window', '$ionicLoading', '$ionicPopup', '$cordovaDialogs', '$cordovaLocalNotification', '$cordovaSpinnerDialog', '$cordovaToast', function($q, $rootScope, $timeout, $window, $ionicLoading, $ionicPopup, $cordovaDialogs, $cordovaLocalNotification, $cordovaSpinnerDialog, $cordovaToast) {
		console.log('Initializing notification service.');
		var newEvents = [];
		var newSeamails = [];

		toastr.options.preventDuplicates = true;
		/*
		toastr.options.closeButton = true;
		toastr.options.closeHtml = '<button><i class="icon ion-close-circled"></i></button>';
		*/

		$rootScope.$on('cruisemonkey.notify.newEvent', function(ev, newEvent) {
			console.log('Notifications: A new event was added to the database:',newEvent);
			newEvents.push(newEvent);
		});

		$rootScope.$on('cruisemonkey.notify.newSeamail', function(ev, newSeamail) {
			console.log('Notifications: A new seamail message was received:',newSeamail);
		});

		$rootScope.$on('cruisemonkey.notify.alert', function(ev, alert) {
			console.log('Notifications: Alert: ' + alert.message);
			ionic.Platform.ready(function() {
				if (navigator.notification && navigator.notification.alert) {
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
		});

		$rootScope.$on('cruisemonkey.notify.spinner', function(ev, spinner) {
			var timeout = spinner.timeout || 3000;
			ionic.Platform.ready(function() {
				if ($window.plugins && $window.plugins.spinnerDialog) {
					$cordovaSpinnerDialog.show(spinner.message);
					$timeout(function() {
						$cordovaSpinnerDialog.hide();
					}, timeout);
				} else {
					var template = '<i class="icon ion-spin ion-load-a"></i>'; 
					if (spinner.message) {
						template += '<br/>' + spinner.message;
					}
					$ionicLoading.show({
						template: template,
						noBackdrop: true,
						duration: timeout
					});
				}
			});
		});

		$rootScope.$on('cruisemonkey.notify.toast', function(ev, toast) {
			var timeout = toast.timeout || 3000;
			console.log('Notifications: Toast(' + timeout + '): ' + toast.message);
			ionicPlatform.ready(function() {
				if ($window.plugins && $window.plugins.toast) {
					var duration = 'short';
					if (timeout >= 5000) {
						duration = 'long';
					}
					$cordovaToast.show(toast.message, duration, 'top');
				} else {
					toastr.info(toast.message);
				}
			});
		});

		return {};
	}]);
}());
