(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic');

	angular.module('cruisemonkey.controllers.Navigation', [])
	.controller('CMNavigationCtrl', ['$rootScope', '$scope', '$location', '$document', 'UserService', '$mobileFrame', function($rootScope, $scope, $location, $document, UserService, $mobileFrame) {
		console.log('Initializing CMNavigationCtrl');

		$scope.toggleDrawer = function() {
			if ($mobileFrame.navVisible()) {
				$mobileFrame.toggleNav();
			}
			return true;
		};
	}]);
}());
