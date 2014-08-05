(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Navigation', [])
	.controller('CMNavigationCtrl', ['$rootScope', '$scope', '$location', '$document', 'UserService', '$mobileFrame', function($rootScope, $scope, $location, $document, UserService, $mobileFrame) {
		console.info('Initializing CMNavigationCtrl');

		$scope.toggleDrawer = function() {
			if ($mobileFrame.navVisible()) {
				$mobileFrame.toggleNav();
			}
			return true;
		};
	}]);
}());
