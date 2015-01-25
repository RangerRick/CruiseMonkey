(function() {
	'use strict';

	/*global ionic: true*/
	/*global moment: true*/

	angular.module('cruisemonkey.controllers.Advanced', [
		'cruisemonkey.Config',
		'cruisemonkey.Database',
		'cruisemonkey.Events',
		'cruisemonkey.Settings'
	])
	.controller('CMAdvancedCtrl', ['$scope', '$rootScope', '$window', '_database', 'config.app.version', 'SettingsService', 'EventService', 'Images', function($scope, $rootScope, $window, _database, version, SettingsService, EventService, Images) {
		console.log('Initializing CMAdvancedCtrl');

		var toStringInterval = function(intValue) {
			return ("" + Math.round(intValue / 1000));
		};
		var toNumberInterval = function(intValue) {
			return (parseInt(intValue, 10) * 1000);
		};

		$scope.settings = SettingsService.getSettings();
		$scope.backgroundInterval = toStringInterval($scope.settings.backgroundInterval);

		$scope.lastModified = function() {
			var lm = EventService.getLastModified();
			return moment(lm);
		};

		$scope.isUnchanged = function() {
			var existing = SettingsService.getSettings();
			var updated  = $scope.settings;

			var updatedInterval = $scope.backgroundInterval;
			var existingInterval = toStringInterval(existing.backgroundInterval);

			return (
				existing.databaseRoot === updated.databaseRoot &&
				existing.databaseName === updated.databaseName &&
				existing.twitarrRoot  === updated.twitarrRoot  &&
				existingInterval      === updatedInterval
			);
		};

		$scope.resetSettings = function() {
			var updated = SettingsService.getDefaultSettings();
			console.log('resetting to', updated);
			$scope.settings = updated;
			$scope.backgroundInterval = toStringInterval(updated.backgroundInterval);
			$scope.saveSettings();
		};

		$scope.saveSettings = function() {
			$scope.settings.backgroundInterval = toNumberInterval($scope.backgroundInterval);
			console.log('saving=', $scope.settings);
			SettingsService.saveSettings($scope.settings);
		};

		$scope.resetDatabase = function() {
			EventService.recreateDatabase();
			Images.resetCache(0);
		};

		$scope.forceSync = function() {
			EventService.forceSync();
		};
	}]);
}());
