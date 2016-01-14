(function() {
	'use strict';

	var angular = require('angular');

	angular.module('cruisemonkey.controllers.About', [
		'cruisemonkey.Config'
	])
	.controller('CMAboutCtrl', ['$scope', 'config.app.version', 'config.app.build', function($scope, version, build) {
		$scope.version = version;
		$scope.build = build;
	}]);
}());
