(function() {
	'use strict';

	/* global ionic: true */

	angular.module('cruisemonkey.Util', [
		'ionic',
	])
	.factory('util', ['$state', '$ionicHistory', '$ionicViewSwitcher', function($state, $ionicHistory, $ionicViewSwitcher) {
		console.log('Util: Initializing.');

		var goToView = function(view) {
			console.log('Util.goToView: ' + view);
			$ionicHistory.nextViewOptions({
				disableBack: true,
				historyRoot: true,
			});
			$state.go(view);
		}
		return {
			go: goToView
		};
	}]);

}());

