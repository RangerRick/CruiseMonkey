(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Advanced', [
		'cruisemonkey.Config',
		'cruisemonkey.Database',
		'cruisemonkey.Settings'
	])
	.controller('CMAdvancedCtrl', ['$scope', '$rootScope', '$window', '_database', 'config.app.version', 'SettingsService', function($scope, $rootScope, $window, _database, version, SettingsService) {
		console.info('Initializing CMAdvancedCtrl');

		$scope.settings = SettingsService.getSettings();

		$scope.openCertificate = function() {
			$rootScope.openUrl('http://ranger.befunk.com/misc/twitarr.rylath.net.cer', '_system');
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
			console.info('resetting to', updated);
			$scope.settings = updated;
			$scope.saveSettings();
		};

		$scope.saveSettings = function() {
			console.info('saving=', $scope.settings);
			var before = angular.copy(SettingsService.getSettings());
			var after = angular.copy($scope.settings);
			SettingsService.setDatabaseRoot($scope.settings.databaseRoot);
			SettingsService.setDatabaseName($scope.settings.databaseName);
			SettingsService.setOpenInChrome($scope.settings.openInChrome);
			SettingsService.setTwitarrRoot($scope.settings.twitarrRoot);
			$rootScope.$broadcast('cm.settings-changed', {
				'before': before,
				'after': after
			});
		};

		$scope.resetDatabase = function() {
			throw "reimplement database reset!";
		};

		$scope.forceSync = function() {
			throw "reimplement re-sync!";
		};
	}]);
}());
