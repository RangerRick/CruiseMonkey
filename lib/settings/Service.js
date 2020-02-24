angular.module('cruisemonkey.Config', [])
.value('config.logging.useStringAppender', false)
.value('config.requestTimeout', 10)
.value('config.backgroundInterval', 300) // 5 minutes
.value('config.enableAdvancedSync', true)
.value('config.twitarrRoot', 'https://twitarr.com/')
// .value('config.twitarrRoot', 'https://twitarr.wookieefive.net/')
.value('config.twitarr.enable-cachebusting', true)
.value('config.app.version', __VERSION__)
.value('config.app.build', __BUILD__)
.value('config.upgrade', true);

angular.module('cruisemonkey.Settings', [
	'cruisemonkey.Config',
	'cruisemonkey.DB',
	'cruisemonkey.Upgrades'
])
.factory('SettingsService', ($injector, $log, $q, $rootScope, kv) => {
	const deferred = $q.defer();
	const ready = deferred.promise;

	const defaultSettings = {
		twitarrRoot: $injector.get('config.twitarrRoot'),
		backgroundInterval: parseInt($injector.get('config.backgroundInterval'), 10),
		enableAdvancedSync: Boolean.of($injector.get('config.enableAdvancedSync')),
	};

	let settings = angular.copy(defaultSettings);
	kv.get('cruisemonkey.config').then((config) => {
		if (config) {
			settings = config;
		}
		deferred.resolve(true);
	}).catch(() => {
		deferred.resolve(true);
	});

	const getProperty = (key) => {
		return ready.then(() => {
			// $log.debug(`SettingsService.getProperty(${key})=${settings[key]}`);
			return settings[key];
		});
	};

	const setProperty = (key, newValue) => {
		return ready.then(() => {
			// $log.debug(`SettingsService.setProperty(${key}, ${newValue})`);
			const oldSettings = angular.copy(settings);
			const newSettings = angular.copy(settings);
			newSettings[key] = newValue;
			settings[key] = newValue;

			return kv.set('cruisemonkey.config', newSettings).then(() => {
				const oldValue = oldSettings[key];
				if (oldValue !== newValue) {
					const update = {
						old: {},
						new: {}
					};
					update.old[key] = oldSettings[key];
					update.new[key] = newSettings[key];
					$rootScope.$broadcast('cruisemonkey.user.settings-changed', update);
				}
				return newValue;
			}).catch((err) => {
				$log.error(`SettingsService.setProperty(${key}, ${newValue}) failed: ` + angular.toJson(err));
				return $q.reject(err);
			});
		});
	};

	const getTwitarrRoot = () => {
		if ($rootScope.twitarrRoot) {
			return $q.when($rootScope.twitarrRoot);
		}
		return getProperty('twitarrRoot').then((twitarrRoot) => {
			if (!twitarrRoot.endsWith('/')) {
				twitarrRoot += '/';
			}
			if ($rootScope.twitarrRoot !== twitarrRoot) {
				$rootScope.twitarrRoot = twitarrRoot;
			}
			return twitarrRoot;
		});
	};

	const getBackgroundInterval = () => {
		return getProperty('backgroundInterval').then((backgroundInterval) => {
			if (backgroundInterval < defaultSettings.backgroundInterval) {
				backgroundInterval = defaultSettings.backgroundInterval;
			}
			return backgroundInterval;
		}).then((backgroundInterval) => {
			return parseInt(backgroundInterval, 10);
		});
	};

	const getEnableAdvancedSync = () => {
		return getProperty('enableAdvancedSync').then((enableAdvancedSync) => {
			return Boolean.of(enableAdvancedSync);
		});
	};

	const wipe = () => {
		return getTwitarrRoot().then((root) => {
			return getBackgroundInterval().then((i) => {
				return getEnableAdvancedSync().then((a) => {
					const update = {
						old: {
							'twitarrRoot': root,
							'backgroundInterval': i,
							'enableAdvancedSync': a,
						},
						new: angular.copy(defaultSettings),
					};
					return kv.wipe().then(() => {
						settings = angular.copy(defaultSettings);
						$rootScope.$broadcast('cruisemonkey.user.settings-changed', update);
						return settings;
					});
				});
			});
		});
	}

	const setTwitarrRoot = (root) => {
		if (root && !root.endsWith('/')) {
			root += '/';
		}

		if ($rootScope.twitarrRoot !== root) {
			return setProperty('twitarrRoot', root).then(() => {
				$rootScope.twitarrRoot = root;
				return root;
			});
		} else {
			return $q.resolve(root);
		}
	};

	const setBackgroundInterval = (ival) => {
		ival = parseInt(ival, 10);
		if (ival < 60) { // 60 second minimum
			ival = 10;
		}
		if (ival > 600) { // 10 minute maxiumum
			ival = 600;
		}
		return setProperty('backgroundInterval', ival);
	};

	const setEnableAdvancedSync = (enable) => {
		return setProperty('enableAdvancedSync', Boolean.of(enable));
	};

	const getDefaultSettings = () => {
		return angular.copy(defaultSettings);
	};

	const getSettings = () => {
		return ready.then(() => {
			return angular.copy(settings);
		});
	};

	$rootScope.$on('cruisemonkey.wipe-cache', (/* event, data */) => {
		return wipe();
	});

	return {
		getDefaultSettings: getDefaultSettings,
		getSettings: getSettings,
		getTwitarrRoot: getTwitarrRoot,
		setTwitarrRoot: setTwitarrRoot,
		getBackgroundInterval: getBackgroundInterval,
		setBackgroundInterval: setBackgroundInterval,
		getEnableAdvancedSync: getEnableAdvancedSync,
		setEnableAdvancedSync: setEnableAdvancedSync,
	};
});
