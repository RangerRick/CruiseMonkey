(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Advanced', ['cruisemonkey.Logging', 'cruisemonkey.Config', 'cruisemonkey.Settings'])
	.controller('CMAdvancedCtrl', ['$scope', '$rootScope', 'Database', 'LoggingService', 'config.app.version', 'SettingsService', function($scope, $rootScope, Database, log, version, SettingsService) {
		log.info('Initializing CMAdvancedCtrl');
		$rootScope.title = 'Advanced Options';
		$rootScope.rightButtons = [];

		$scope.settings = SettingsService.getSettings();

		$scope.openCertificate = function() {
			window.open('http://ranger.befunk.com/misc/twitarr.rylath.net.cer', '_system');
		};

		$scope.isUnchanged = function() {
			var existing = SettingsService.getSettings();
			var updated  = $scope.settings;

			return (
				existing.databaseHost === updated.databaseHost &&
				existing.databaseName === updated.databaseName &&
				existing.twitarrRoot  === updated.twitarrRoot
			);
		};

		$scope.resetSettings = function() {
			var updated = SettingsService.getSettings();
			console.log('resetting to', updated);
			$scope.settings = updated;
		};
		
		$scope.saveSettings = function() {
			console.log('saving=', $scope.settings);
			SettingsService.setDatabaseHost($scope.settings.databaseHost);
			SettingsService.setDatabaseName($scope.settings.databaseName);
			SettingsService.setTwitarrRoot($scope.settings.twitarrRoot);
		};

		$scope.resetDatabase = function() {
			Database.reset();
		};
	}]);
}());