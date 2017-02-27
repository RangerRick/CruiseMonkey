(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Settings', [
		'cruisemonkey.Config',
		'cruisemonkey.Events',
		'cruisemonkey.Settings',
		'cruisemonkey.images.Cache'
	])
	.controller('CMSettingsCtrl', function($log, $q, $rootScope, $scope, $timeout, SettingsService, EventService, ImageCache, UserService) {
		$log.info('Initializing CMSettingsCtrl');

		UserService.onUserChanged(function(newUser) {
			$scope.user = newUser;
		});

		var toStringInterval = function(intValue) {
			return '' + intValue;
		};
		var toNumberInterval = function(intValue) {
			return parseInt(intValue, 10);
		};

		var existingSettings = {};

		var getDefaultSettings = function() {
			var defaultSettings = angular.copy(SettingsService.getDefaultSettings());
			defaultSettings.backgroundInterval = '' + defaultSettings.backgroundInterval;
			return defaultSettings;
		};

		var init = function() {
			$scope.user = UserService.get();
			var existingSettings = angular.copy(getDefaultSettings());
			$scope.settings = angular.copy(existingSettings);

			SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				$scope.settings.twitarrRoot = existingSettings.twitarrRoot = twitarrRoot;
			});
			SettingsService.getBackgroundInterval().then(function(backgroundInterval) {
				$scope.settings.backgroundInterval = existingSettings.backgroundInterval = toStringInterval(backgroundInterval);
			});
		}

		$scope.isUnchanged = function() {
			var existing = existingSettings;
			var updated  = $scope.settings;

			var updatedInterval = toStringInterval($scope.settings.backgroundInterval);
			var existingInterval = toStringInterval(existing.backgroundInterval);

			return existing.twitarrRoot === updated.twitarrRoot && existingInterval === updatedInterval;
		};

		$scope.resetSettings = function(ev) {
			ev.stopPropagation();
			ev.preventDefault();

			var defaults = getDefaultSettings();
			$log.debug('resetting to' + angular.toJson(defaults));
			$scope.settings = angular.copy(defaults);
			existingSettings = angular.copy(defaults);
			$scope.settings.backgroundInterval = toStringInterval(existingSettings.backgroundInterval);
			$scope.saveSettings();
		};

		$scope.saveSettings = function() {
			var bgi = toNumberInterval($scope.settings.backgroundInterval);
			$log.debug('saving=', $scope.settings);
			return $q.all([
				SettingsService.setTwitarrRoot($scope.settings.twitarrRoot),
				SettingsService.setBackgroundInterval(bgi)
			]).then(function() {
				existingSettings = angular.copy($scope.settings);
			});
		};

		init();

		$scope.$on('cruisemonkey.wipe-cache', function() {
			$timeout(init, 100);
		});

		$scope.clearCache = function() {
			$rootScope.$broadcast('cruisemonkey.wipe-cache');
		};
	});
}());
