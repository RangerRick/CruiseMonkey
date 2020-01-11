require('../data/DB');

angular.module('cruisemonkey.controllers.Settings', [
	'cruisemonkey.Config',
	'cruisemonkey.Events',
	'cruisemonkey.Settings',
	'cruisemonkey.images.Cache'
])
.controller('CMSettingsCtrl', ($log, $q, $rootScope, $scope, $timeout, SettingsService, EventService, ImageCache, UserService) => {
	$log.info('Initializing CMSettingsCtrl');

	UserService.onUserChanged((newUser) => {
		$scope.user = newUser;
	});

	const toNumberInterval = (intValue) => {
		return parseInt(intValue, 10);
	};

	let existingSettings = {};

	const getDefaultSettings = () => {
		const defaultSettings = angular.copy(SettingsService.getDefaultSettings());
		defaultSettings.backgroundInterval = toNumberInterval(defaultSettings.backgroundInterval);
		return defaultSettings;
	};

	const init = () => {
		$scope.user = UserService.get();
		const existingSettings = angular.copy(getDefaultSettings());
		$scope.settings = angular.copy(existingSettings);

		SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			$scope.settings.twitarrRoot = existingSettings.twitarrRoot = twitarrRoot;
		});
		SettingsService.getBackgroundInterval().then((backgroundInterval) => {
			$scope.settings.backgroundInterval = existingSettings.backgroundInterval = toNumberInterval(backgroundInterval);
		});
	}

	$scope.isUnchanged = () => {
		const existing = existingSettings;
		const updated  = $scope.settings;

		const updatedInterval = toNumberInterval($scope.settings.backgroundInterval);
		const existingInterval = toNumberInterval(existing.backgroundInterval);

		return existing.twitarrRoot === updated.twitarrRoot && existingInterval === updatedInterval;
	};

	$scope.resetSettings = (ev) => {
		ev.stopPropagation();
		ev.preventDefault();

		const defaults = getDefaultSettings();
		$log.debug('resetting to' + angular.toJson(defaults));
		$scope.settings = angular.copy(defaults);
		existingSettings = angular.copy(defaults);
		$scope.settings.backgroundInterval = toNumberInterval(existingSettings.backgroundInterval);
		$scope.saveSettings();
	};

	$scope.saveSettings = () => {
		const bgi = toNumberInterval($scope.settings.backgroundInterval);
		$log.debug('saving=', $scope.settings);
		return $q.all([
			SettingsService.setTwitarrRoot($scope.settings.twitarrRoot),
			SettingsService.setBackgroundInterval(bgi)
		]).then(() => {
			existingSettings = angular.copy($scope.settings);
		});
	};

	init();

	$scope.$on('cruisemonkey.wipe-cache', () => {
		$timeout(init, 100);
	});

	$scope.clearCache = () => {
		$rootScope.$broadcast('cruisemonkey.wipe-cache');
	};
});
