require('ng-cordova');

import { Plugins } from '@capacitor/core';
const { MemoryInfoPlugin } = Plugins;

angular.module('cruisemonkey.Initializer', [
	'ionic',
	'ngCordova'
])
.factory('Cordova', ($ionicPlatform, $log, $q) => {
	const deferred = $q.defer();
	$ionicPlatform.ready(function() {
		if (ionic.Platform.isWebView()) {
			$log.debug('Cordova: is a webview.');
			deferred.resolve(true);
		} else {
			$log.warn('Cordova: is NOT a webview.');
			deferred.reject(false);
		}
	});

	const getMemoryInfo = () => {
		return deferred.promise.then(async (inCordova) => {
			if (inCordova) {
				const memoryInfo = await MemoryInfoPlugin.getMemoryInfo();
				memoryInfo.percentUsed = memoryInfo.used / memoryInfo.total * 100.0;
				console.log('getMemoryInfo:', memoryInfo);
				return memoryInfo;
			}
			return {};
		}).catch((/* err */) => {
			return {};
		});
	};

	const getSystemMemory = () => {
		return deferred.promise.then(async (inCordova) => {
			if (inCordova) {
				const memoryInfo = await MemoryInfoPlugin.getMemoryInfo();
				return $q.when(memoryInfo.total);
			}
			return 0;
		}).catch((/* err */) => {
			return 0;
		});
	};

	return {
		inCordova: () => {
			return deferred.promise;
		},
		memoryInfo: getMemoryInfo,
		systemMemory: getSystemMemory,
	};
})
.factory('Initializer', function($cordovaStatusbar, $ionicHistory, $ionicPlatform, $ionicSideMenuDelegate, $log, $rootScope, $timeout, Cordova) {
	$log.info('CruiseMonkey Initializing.');

	Cordova.inCordova().then(function(inCordova) {
		if (inCordova) {
			$log.info('We are inside Cordova: initializing ionic platform plugins and events.');

			$ionicPlatform.registerBackButtonAction((ev) => {
				const backView = $ionicHistory.backView();
				if (backView) {
					// this is OK, go ahead and let Ionic do back
				} else {
					$log.debug('No back view, preventing exit.');
					if ($ionicSideMenuDelegate.isOpenLeft()) {
						$log.debug('Side menu is open.  Leaving it open.');
					} else {
						$log.debug('Side menu is not open.  Opening it.');
						$ionicSideMenuDelegate.toggleLeft();
					}
					ev.preventDefault();
					ev.stopPropagation();
				}
			}, 151);

			$timeout(function() {
				// config.xml says we have light content because of the splash screen, now the title bar is dark so switch
				$cordovaStatusbar.overlaysWebView(true);
				$cordovaStatusbar.style(3);
			}, 2000);

			if (cordova && cordova.plugins && cordova.plugins.certificates) {
				cordova.plugins.certificates.trustUnsecureCerts(true);
			}

			$ionicPlatform.on('pause', (...args) => {
				$log.debug('CruiseMonkey paused:' + angular.toJson(args));
				$rootScope.$broadcast('cruisemonkey.app.paused', args);
			});
			$ionicPlatform.on('resign', (...args) => {
				$log.debug('CruiseMonkey locked while in foreground:' + angular.toJson(args));
				$rootScope.$broadcast('cruisemonkey.app.locked', args);
			});
			$ionicPlatform.on('resume', (...args) => {
				$log.debug('CruiseMonkey resumed:' + angular.toJson(args));
				$rootScope.$broadcast('cruisemonkey.app.resumed', args);
			});
		} else {
			$log.debug('We are not inside Cordova.');
		}
	});

	const _expected = ['cruisemonkey.notifications.ready' /*, 'cruisemonkey.upgrade.complete' */];
	const _seen = [];

	const expectedHandler = (ev) => {
		$log.debug('Initializer: ' + ev.name);
		_seen.push(ev.name);

		let ready = true;
		for (let i=0; i < _expected.length; i++) {
			if (_seen.indexOf(_expected[i]) === -1) {
				ready = false;
				break;
			}
		}

		if (ready) {
			$log.debug('CruiseMonkey is ready!');
			$rootScope.$broadcast('cruisemonkey.ready');
		}
	};

	for (let i=0; i < _expected.length; i++) {
		$rootScope.$on(_expected[i], expectedHandler);
	}

	return {};
});
