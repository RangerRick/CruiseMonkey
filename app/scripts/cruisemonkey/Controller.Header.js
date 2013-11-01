(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Header', ['cruisemonkey.Logging'])
	.controller('CMHeaderCtrl', ['$scope', '$rootScope', '$location', 'LoggingService', function($scope, $rootScope, $location, LoggingService) {
		LoggingService.info('Initializing CMHeaderCtrl');
	}]);
}());