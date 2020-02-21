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

	const toNumberInterval = (intValue) => {
		return parseInt(intValue, 10);
	};

	// just until we're initialized
	let existingSettings = SettingsService.getDefaultSettings();

	const preconfigured = [
		'https://twitarr.com/',
		'http://joco.hollandamerica.com/',
		'http://10.114.238.135/',
		'https://twitarr.wookieefive.net/',
	];

	const getTwitarrRoot = () => {
		if ($scope.settings) {
			if (preconfigured.indexOf($scope.settings.twitarrRootSelector) >= 0) {
				return $scope.settings.twitarrRootSelector;
			}
			return $scope.settings.twitarrRoot;
		}
		return undefined;
	};

	const init = () => {
		const deferred = $q.defer();
		$scope.$evalAsync(() => {
			$scope.user = UserService.get();
			SettingsService.getSettings().then((settings) => {
				$scope.settings = angular.copy(settings);
				existingSettings = angular.copy(settings);
				if (preconfigured.indexOf(settings.twitarrRoot) < 0) {
					$scope.settings.twitarrRootSelector = 'custom';
				} else {
					$scope.settings.twitarrRootSelector = settings.twitarrRoot;
				}
			}).then(() => {
				deferred.resolve($scope.settings);
			}).catch((err) => {
				deferred.reject(err);
			});
		});
		return deferred.promise;
	}

	$scope.$watch('settings.twitarrRootSelector', () => {
		$scope.$evalAsync(() => {
			const newRoot = getTwitarrRoot();
			if (newRoot === undefined) {
				return;
			}
			SettingsService.setTwitarrRoot(newRoot).then(() => {
				if (existingSettings.twitarrRoot !== newRoot) {
					existingSettings.twitarrRoot = newRoot;
				}
				if ($scope.settings.twitarrRoot !== newRoot) {
					$scope.settings.twitarrRoot = newRoot;
				}
			});
		});
	});

	$scope.isUnchanged = () => {
		if ($scope.settings) {
			const existing = angular.copy(existingSettings);

			const updatedInterval = toNumberInterval($scope.settings.backgroundInterval);
			const existingInterval = toNumberInterval(existing.backgroundInterval);

			const updatedAdvancedSync = Boolean($scope.settings.enableAdvancedSync);
			const existingAdvancedSync = Boolean(existing.enableAdvancedSync);

			return existingInterval === updatedInterval && existingAdvancedSync === updatedAdvancedSync;
		}
		return false;
	};

	$scope.resetSettings = (ev) => {
		ev.stopPropagation();
		ev.preventDefault();

		const defaults = SettingsService.getDefaultSettings();
		defaults.twitarrRoot = $scope.settings.twitarrRoot;
		defaults.twitarrRootSelector = $scope.settings.twitarrRootSelector;
		$log.debug('CMSettingsCtrl.resetSettings(): resetting to: ' + angular.toJson(defaults));
		$scope.settings = angular.copy(defaults);
	};

	$scope.saveSettings = () => {
		$log.debug('CMSettingsCtrl.saveSettings(): ' + angular.toJson($scope.settings));
		return $q.all([
			SettingsService.setBackgroundInterval($scope.settings.backgroundInterval),
			SettingsService.setEnableAdvancedSync(Boolean($scope.settings.enableAdvancedSync)),
		]).then(() => {
			return init();
		});
	};

	init();

	$scope.$on('cruisemonkey.user.updated', (ev, newUser) => {
		$scope.user = newUser;
	});

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
