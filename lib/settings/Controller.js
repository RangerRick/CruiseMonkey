import { Plugins } from '@capacitor/core';
const { Keyboard } = Plugins;

require('../data/DB');

angular.module('cruisemonkey.controllers.Settings', [
	'cruisemonkey.Config',
	'cruisemonkey.Events',
	'cruisemonkey.Settings',
	'cruisemonkey.images.Cache'
])
.controller('CMSettingsCtrl', ($log, $q, $rootScope, $scope, $timeout, SettingsService, UserService) => {
	$log.info('Initializing CMSettingsCtrl');

	$scope.platform = ionic.Platform.platform();

	UserService.onUserChanged((newUser) => {
		$scope.user = newUser;
	});

	const toNumberInterval = (intValue) => {
		return parseInt(intValue, 10);
	};

	const getDefaultSettings = () => {
		const defaultSettings = angular.copy(SettingsService.getDefaultSettings());
		defaultSettings.backgroundInterval = toNumberInterval(defaultSettings.backgroundInterval);
		defaultSettings.enableAdvancedSync = Boolean(defaultSettings.enableAdvancedSync);
		return defaultSettings;
	};

	let existingSettings = getDefaultSettings();

	const init = () => {
		$scope.user = UserService.get();
		const defaults = angular.copy(getDefaultSettings());
		$scope.settings = angular.copy(defaults);

		SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			$scope.settings.twitarrRoot = defaults.twitarrRoot = twitarrRoot;
		});
		SettingsService.getBackgroundInterval().then((backgroundInterval) => {
			$scope.settings.backgroundInterval = defaults.backgroundInterval = toNumberInterval(backgroundInterval);
		});
		SettingsService.getEnableAdvancedSync().then((enableAdvancedSync) => {
			$scope.settings.enableAdvancedSync = enableAdvancedSync;
		});
	}

	$scope.isUnchanged = () => {
		const existing = existingSettings;
		const updated  = $scope.settings;

		const updatedInterval = toNumberInterval($scope.settings.backgroundInterval);
		const existingInterval = toNumberInterval(existing.backgroundInterval);

		const updatedAdvancedSync = Boolean($scope.settings.enableAdvancedSync);
		const existingAdvancedSync = Boolean(existing.enableAdvancedSync);

		return existing.twitarrRoot === updated.twitarrRoot && existingInterval === updatedInterval && existingAdvancedSync === updatedAdvancedSync;
	};

	$scope.resetSettings = (ev) => {
		ev.stopPropagation();
		ev.preventDefault();

		const defaults = getDefaultSettings();
		$log.debug('CMSettingsCtrl.resetSettings(): resetting to' + angular.toJson(defaults));
		$scope.settings = angular.copy(defaults);
		$scope.settings.backgroundInterval = toNumberInterval(existingSettings.backgroundInterval);
		$scope.settings.enableAdvancedSync = Boolean(existingSettings.enableAdvancedSync);
		$scope.saveSettings();
	};

	$scope.saveSettings = () => {
		const bgi = toNumberInterval($scope.settings.backgroundInterval);
		$log.debug('CMSettingsCtrl.saveSettings():', $scope.settings);
		return $q.all([
			SettingsService.setTwitarrRoot($scope.settings.twitarrRoot),
			SettingsService.setBackgroundInterval(bgi),
			SettingsService.setEnableAdvancedSync(Boolean($scope.settings.enableAdvancedSync)),
		]).then(() => {
			existingSettings = angular.copy($scope.settings);
		});
	};

	init();

	$scope.$on('$ionicView.beforeEnter', () => {
		/*
		Keyboard.hideFormAccessoryBar(true);
		Keyboard.setResizeMode(KeyboardResizeMode.None);
		*/
		Keyboard.setAccessoryBarVisible({ isVisible: false });
		Keyboard.setScroll({
			isDisabled: true,
		});
		// Keyboard.setResizeMode({ mode: KeyboardResize.None });
	});
	$scope.$on('$ionicView.afterLeave', () => {
		/*
		Keyboard.hideFormAccessoryBar(false);
		Keyboard.setResizeMode(KeyboardResizeMode.Native);
		*/
		Keyboard.setAccessoryBarVisible({ isVisible: true });
		Keyboard.setScroll({
			isDisabled: false,
		});
		// Keyboard.setResizeMode({ mode: KeyboardResize.Native });
	});

	$scope.$on('cruisemonkey.wipe-cache', () => {
		$timeout(init, 100);
	});

	$scope.clearCache = () => {
		$rootScope.$broadcast('cruisemonkey.wipe-cache');
	};
});
