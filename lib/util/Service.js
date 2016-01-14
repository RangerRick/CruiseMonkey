(function() {
	'use strict';

	var angular = require('angular');

	angular.module('cruisemonkey.Util', [
		'ionic'
	])
	.factory('util', function($log, $state, $ionicHistory, $ionicViewSwitcher) {
		$log.info('Util: Initializing.');

		var goToView = function(view) {
			$log.debug('Util.goToView: ' + view);
			$ionicHistory.nextViewOptions({
				disableBack: true,
				historyRoot: true
			});
			$state.go(view);
		};
		return {
			go: goToView
		};
	});

}());

