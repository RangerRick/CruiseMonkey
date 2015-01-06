(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Advanced', [
		'cruisemonkey.Config',
		'cruisemonkey.Database',
		'cruisemonkey.Events',
		'cruisemonkey.Settings'
	])
	.controller('CMAdvancedCtrl', ['$scope', '$rootScope', '$window', '_database', 'config.app.version', 'SettingsService', 'EventService', function($scope, $rootScope, $window, _database, version, SettingsService, EventService) {
		console.log('Initializing CMAdvancedCtrl');

		$scope.settings = SettingsService.getSettings();

		$scope.lastModified = function() {
			var lm = EventService.getLastModified();
			return moment(lm);
		};

		$scope.isUnchanged = function() {
			var existing = SettingsService.getSettings();
			var updated  = $scope.settings;

			return (
				existing.databaseRoot    === updated.databaseRoot &&
				existing.databaseName    === updated.databaseName &&
				existing.openInChrome    === updated.openInChrome &&
				existing.twitarrRoot     === updated.twitarrRoot
			);
		};

		$scope.resetSettings = function() {
			var updated = SettingsService.getDefaults();
			console.log('resetting to', updated);
			$scope.settings = updated;
			$scope.saveSettings();
		};

		$scope.saveSettings = function() {
			console.log('saving=', $scope.settings);
			SettingsService.saveSettings($scope.settings);
		};

		$scope.resetDatabase = function() {
			EventService.recreateDatabase();
		};

		$scope.forceSync = function() {
			EventService.forceSync();
		};
	}]);
}());
