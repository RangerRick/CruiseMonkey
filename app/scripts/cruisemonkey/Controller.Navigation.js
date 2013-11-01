(function() {
	'use strict';

	angular.module('cruisemonkey.Navigation', ['cruisemonkey.Logging'])
	.controller('CMNavigationCtrl', ['$rootScope', '$scope', '$location', '$document', 'UserService', 'LoggingService', '$mobileFrame', function($rootScope, $scope, $location, $document, UserService, log, $mobileFrame) {
		log.info('Initializing CMNavigationCtrl');

		$scope.toggleDrawer = function() {
			if ($mobileFrame.navVisible()) {
				$mobileFrame.toggleNav();
			}
			return true;
		};
	}]);
}());