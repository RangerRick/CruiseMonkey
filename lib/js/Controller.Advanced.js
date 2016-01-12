(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic'),
		moment = require('moment');

	angular.module('cruisemonkey.controllers.Advanced', [
		'cruisemonkey.Config',
		'cruisemonkey.Events',
		'cruisemonkey.Settings'
	])
	.controller('CMAdvancedCtrl', function($q, $scope, SettingsService, EventService, UserService) {
		console.log('Initializing CMAdvancedCtrl');

		$scope.user = UserService.get();
		UserService.onUserChanged(function(newUser) {
			$scope.user = newUser;
		});

		var toStringInterval = function(intValue) {
			return ("" + intValue);
		};
		var toNumberInterval = function(intValue) {
			return parseInt(intValue, 10);
		};

		var defaultSettings = SettingsService.getDefaultSettings();
		defaultSettings.backgroundInterval = "" + defaultSettings.backgroundInterval;
		var existingSettings = angular.copy(defaultSettings);
		$scope.settings = angular.copy(existingSettings);

		SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
			$scope.settings.twitarrRoot = existingSettings.twitarrRoot = twitarrRoot;
		});
		SettingsService.getBackgroundInterval().then(function(backgroundInterval) {
			$scope.settings.backgroundInterval = existingSettings.backgroundInterval = toStringInterval(backgroundInterval);
		});

		$scope.lastModified = function() {
			var lm = EventService.getLastModified();
			return moment(lm);
		};

		$scope.isUnchanged = function() {
			var existing = existingSettings;
			var updated  = $scope.settings;

			var updatedInterval = toStringInterval($scope.settings.backgroundInterval);
			var existingInterval = toStringInterval(existing.backgroundInterval);

			return (
				existing.twitarrRoot  === updated.twitarrRoot  &&
				existingInterval      === updatedInterval
			);
		};

		$scope.resetSettings = function() {
			console.log('resetting to', defaultSettings);
			$scope.settings = angular.copy(defaultSettings);
			existingSettings = angular.copy(defaultSettings);
			$scope.settings.backgroundInterval = toStringInterval(existingSettings.backgroundInterval);
			$scope.saveSettings();
		};

		$scope.saveSettings = function() {
			var bgi = toNumberInterval($scope.settings.backgroundInterval);
			console.log('saving=', $scope.settings);
			return $q.all([
				SettingsService.setTwitarrRoot($scope.settings.twitarrRoot),
				SettingsService.setBackgroundInterval(bgi)
			]).then(function() {
				existingSettings = angular.copy($scope.settings);
			});
		};

		$scope.resetDatabase = function() {
			EventService.recreateDatabase();
		};

		$scope.forceSync = function() {
			EventService.forceSync();
		};
	});
}());
