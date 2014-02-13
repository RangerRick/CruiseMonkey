(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.About', [
		'cruisemonkey.Database',
		'cruisemonkey.Logging',
		'cruisemonkey.Config'
	])
	.controller('CMAboutCtrl', ['$scope', '$rootScope', 'LoggingService', 'EventService', 'config.app.version', function($scope, $rootScope, log, EventService, version) {
		log.info('Initializing CMAboutCtrl');
		$rootScope.title = 'About CM4';
		$rootScope.leftButtons = [];
		$rootScope.rightButtons = [];
		$scope.version = version;
		
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
