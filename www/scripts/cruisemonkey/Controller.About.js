(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.About', [
		'cruisemonkey.Config'
	])
	.controller('CMAboutCtrl', ['$scope', '$rootScope', 'EventService', 'config.app.version', 'config.app.build', function($scope, $rootScope, EventService, version, build) {
		$scope.version = version;
		$scope.build = build;
	}]);
}());
