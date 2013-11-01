(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.About', ['cruisemonkey.Database', 'cruisemonkey.Logging', 'cruisemonkey.Config'])
	.controller('CMAboutCtrl', ['$scope', '$rootScope', 'LoggingService', 'config.app.version', function($scope, $rootScope, log, version) {
		log.info('Initializing CMAboutCtrl');
		$rootScope.title = 'About CruiseMonkey ' + version;
	}]);
}());