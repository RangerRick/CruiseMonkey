(function() {
	'use strict';
	angular.module('cruisemonkey.controllers.Navigation', [])
	.controller('CMNavigationCtrl', ['$rootScope', '$scope', '$location', '$document', 'UserService', '$log', '$mobileFrame', function($rootScope, $scope, $location, $document, UserService, log, $mobileFrame) {
		log.info('Initializing CMNavigationCtrl');
		$scope.toggleDrawer = function() {
			if ($mobileFrame.navVisible()) {
				$mobileFrame.toggleNav();
			}
			return true;
		};
	}]);
}());