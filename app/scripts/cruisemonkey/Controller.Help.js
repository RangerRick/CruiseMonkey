(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Help', [])
	.controller('CMHelpCtrl', ['$rootScope', '$log', function($rootScope, log) {
		log.info('Initializing CMHelpCtrl');
		$rootScope.headerTitle = 'Help';
		$rootScope.leftButtons = [];
		$rootScope.rightButtons = [];
	}]);
}());
