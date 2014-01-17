(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Help', ['cruisemonkey.Database', 'cruisemonkey.Logging'])
	.controller('CMHelpCtrl', ['$scope', '$rootScope', 'LoggingService', function($scope, $rootScope, log) {
		log.info('Initializing CMHelpCtrl');
		$rootScope.title = 'Help';
		$rootScope.rightButtons = [];
	}]);
}());