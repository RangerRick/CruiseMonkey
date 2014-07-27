(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Advanced', [
		'cruisemonkey.Config',
		'cruisemonkey.Cordova',
		'cruisemonkey.DB',
		'cruisemonkey.Settings'
	])
	.controller('CMAdvancedCtrl', ['$log', '$scope', '$rootScope', '$window', '_db', 'CordovaService', 'config.app.version', 'SettingsService', function(log, $scope, $rootScope, $window, _db, cor, version, SettingsService) {
		log.info('Initializing CMAdvancedCtrl');
		$rootScope.headerTitle = 'Advanced Options';
		$rootScope.leftButtons = $rootScope.getLeftButtons();
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
				existing.openInChrome    === updated.openInChrome &&
				existing.twitarrRoot     === updated.twitarrRoot
			);
		};

		$scope.resetSettings = function() {
			var updated = SettingsService.getDefaults();
			log.info('resetting to', updated);
			$scope.settings = updated;
			$scope.saveSettings();
		};
		
		$scope.saveSettings = function() {
			log.info('saving=', $scope.settings);
			var before = angular.copy(SettingsService.getSettings());
			var after = angular.copy($scope.settings);
			SettingsService.setDatabaseHost($scope.settings.databaseHost);
			SettingsService.setDatabaseName($scope.settings.databaseName);
			SettingsService.setOpenInChrome($scope.settings.openInChrome);
			SettingsService.setTwitarrRoot($scope.settings.twitarrRoot);
			$rootScope.$broadcast('cm.settings-changed', {
				'before': before,
				'after': after
			});
		};

		$scope.resetDatabase = function() {
			_db.reset();
		};

		$scope.forceSync = function() {
			_db.restartSync();
		};

		cor.ifCordova(function() {
			$scope.isIos = true;
		}).otherwise(function() {
			$scope.isIos = false;
		});
	}]);
}());
