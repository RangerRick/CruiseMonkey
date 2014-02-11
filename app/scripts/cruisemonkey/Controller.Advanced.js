(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Advanced', [
		'cruisemonkey.Logging',
		'cruisemonkey.Config',
		'cruisemonkey.Cordova',
		'cruisemonkey.Settings'
	])
	.controller('CMAdvancedCtrl', ['$scope', '$rootScope', '$window', 'Database', 'LoggingService', 'CordovaService', 'config.app.version', 'SettingsService', function($scope, $rootScope, $window, Database, log, cor, version, SettingsService) {
		log.info('Initializing CMAdvancedCtrl');
		$rootScope.title = 'Advanced Options';
		$rootScope.leftButtons = [];
		$rootScope.rightButtons = [];

		$scope.settings = SettingsService.getSettings();

		$scope.openCertificate = function() {
			$rootScope.openUrl('http://ranger.befunk.com/misc/twitarr.rylath.net.cer', '_system');
		};

		$scope.isUnchanged = function() {
			var existing = SettingsService.getSettings();
			var updated  = $scope.settings;

			return (
				existing.databaseHost    === updated.databaseHost &&
				existing.databaseName    === updated.databaseName &&
				existing.databaseRefresh === updated.databaseRefresh &&
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
			var before = angular.copy(SettingsService.getSettings());
			var after = angular.copy($scope.settings);
			SettingsService.setDatabaseHost($scope.settings.databaseHost);
			SettingsService.setDatabaseName($scope.settings.databaseName);
			SettingsService.setDatabaseRefresh($scope.settings.databaseRefresh);
			SettingsService.setOpenInChrome($scope.settings.openInChrome);
			SettingsService.setTwitarrRoot($scope.settings.twitarrRoot);
			$rootScope.$broadcast('cm.settingsChanged', {
				'before': before,
				'after': after
			});
		};

		$scope.resetDatabase = function() {
			Database.reset();
		};

		$scope.forceSync = function() {
			Database.restartReplication();
		};

		cor.ifCordova(function() {
			$scope.isIos = true;
		}).otherwise(function() {
			$scope.isIos = false;
		});
	}]);
}());
