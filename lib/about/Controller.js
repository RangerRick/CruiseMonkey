(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.About', [
		'ng',
		'cruisemonkey.Config'
	])
	.controller('CMAboutCtrl', ['$scope', '$window', 'config.app.version', 'config.app.build', function($scope, $window, version, build) {
		$scope.version = version;
		$scope.build = build;
	}]);
}());
