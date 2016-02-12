(function() {
	'use strict';

	var image = require('./btn_donate_SM.gif');

	angular.module('cruisemonkey.controllers.About', [
		'ng',
		'cruisemonkey.Config'
	])
	.controller('CMAboutCtrl', ['$scope', '$window', 'config.app.version', 'config.app.build', function($scope, $window, version, build) {
		$scope.version = version;
		$scope.build = build;
		$scope.url = image;

		$scope.openPaypal = function() {
			$window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4GNPSE8RNFGME', '_blank', 'closebuttoncaption=Close,transitionstyle=fliphorizontal');
		};
	}]);
}());
