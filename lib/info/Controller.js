import { Plugins } from '@capacitor/core';
const { Browser } = Plugins;

(function() {
	'use strict';

	require('../user/User');

	angular.module('cruisemonkey.info.Controller', [
		'ionic',
		'cruisemonkey.Settings',
		'cruisemonkey.user.User'
	])
	.controller('CMInfoCtrl', function($log, $scope, $window, SettingsService, UserService) {
		$log.info('Initializing CMInfoCtrl');
		$scope.u = UserService;

		$scope.openForums = function() {
			SettingsService.getTwitarrRoot().then(function(tr) {
				Browser.open({
					url: tr + '#/forums',
					windowName: '_system', 
				});
			});
		};
	})
	;
}());
