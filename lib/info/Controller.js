import { Plugins } from '@capacitor/core';
const { Browser } = Plugins;

require('../user/User');

angular.module('cruisemonkey.info.Controller', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.user.User'
])
.controller('CMInfoCtrl', ($log, $scope, SettingsService, UserService) => {
	$log.info('Initializing CMInfoCtrl');
	$scope.u = UserService;

	$scope.openForums = () => {
		SettingsService.getTwitarrRoot().then((tr) => {
			Browser.open({
				url: tr + '#/forums',
				windowName: '_system', 
			});
		});
	};
})
;
