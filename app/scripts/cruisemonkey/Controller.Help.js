(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Help', ['cruisemonkey.Logging'])
	.controller('CMHelpCtrl', ['$rootScope', 'LoggingService', function($rootScope, log) {
		log.info('Initializing CMHelpCtrl');
		$rootScope.headerTitle = 'Help';
		$rootScope.leftButtons = [];
		$rootScope.rightButtons = [];
	}]);
}());
