(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Help', [])
	.controller('CMHelpCtrl', ['$rootScope', function($rootScope) {
		console.info('Initializing CMHelpCtrl');
		$rootScope.headerTitle = 'Help';
		$rootScope.leftButtons = $rootScope.getLeftButtons();
		$rootScope.rightButtons = [];
	}]);
}());
