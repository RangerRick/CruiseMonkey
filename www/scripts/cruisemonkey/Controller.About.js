(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.About', [
		'cruisemonkey.Config'
	])
	.controller('CMAboutCtrl', ['$scope', '$rootScope', 'EventService', 'config.app.version', 'config.app.build', function($scope, $rootScope, EventService, version, build) {
		console.log('Initializing CMAboutCtrl');
		$scope.version = version;
		$scope.build = build;

		$scope.goToSite = function(site) {
			$rootScope.openUrl(site, '_system');
		};

		/*global moment: true*/
		var newest = moment(0),
			currentEvent = null,
			currentFavorite = null;

		EventService.getAllEvents().then(function(events) {
			angular.forEach(events, function(ev) {
				currentEvent = ev.getLastUpdated();
				if (currentEvent.isAfter(newest)) {
					newest = currentEvent;
				}
			});

			$scope.lastUpdatedEvent = newest;
		});
	}]);
}());
