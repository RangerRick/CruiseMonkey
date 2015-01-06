(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Advanced', [
		'cruisemonkey.Config',
		'cruisemonkey.Database',
		'cruisemonkey.Settings'
	])
	.controller('CMAdvancedCtrl', ['$scope', '$rootScope', '$window', '_database', 'config.app.version', 'SettingsService', function($scope, $rootScope, $window, _database, version, SettingsService) {
		console.log('Initializing CMAdvancedCtrl');

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
			console.log('resetting to', updated);
			$scope.settings = updated;
			$scope.saveSettings();
		};

		$scope.saveSettings = function() {
			console.log('saving=', $scope.settings);
			SettingsService.saveSettings($scope.settings);
		};

		$scope.resetDatabase = function() {
			throw "reimplement database reset!";
		};

		$scope.forceSync = function() {
			throw "reimplement re-sync!";
		};
	}]);
}());
