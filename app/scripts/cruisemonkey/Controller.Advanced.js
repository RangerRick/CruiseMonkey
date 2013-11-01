(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Advanced', ['cruisemonkey.Logging', 'cruisemonkey.Config'])
	.controller('CMAdvancedCtrl', ['$scope', '$rootScope', 'Database', 'LoggingService', 'config.app.version', function($scope, $rootScope, Database, log, version) {
		log.info('Initializing CMAdvancedCtrl');
		$rootScope.title = 'Break CruiseMonkey!';

		$scope.resetDatabase = function() {
			Database.reset();
		};
	}]);
}());