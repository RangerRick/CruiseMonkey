angular.module('cruisemonkey.Config', [])
.value('config.logging.useStringAppender', false)
.value('config.requestTimeout', 10)
.value('config.backgroundInterval', 300) // 5 minutes
.value('config.enableAdvancedSync', true)
//	.value('config.twitarrRoot', 'https://twitarr.com/')
.value('config.twitarrRoot', 'https://twitarr.wookieefive.net/')
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

	const defaultSettings = {
		twitarrRoot: $injector.get('config.twitarrRoot'),
		backgroundInterval: parseInt($injector.get('config.backgroundInterval'), 10),
		enableAdvancedSync: Boolean($injector.get('config.enableAdvancedSync')),
	};

	const getTwitarrRoot = () => {
		if ($rootScope.twitarrRoot) {
			return $q.when($rootScope.twitarrRoot);
		}
		return kv.get('twitarrRoot').catch(() => {
			return defaultSettings.twitarrRoot;
		}).then((twRoot) => {
			if (!twRoot) {
				twRoot = defaultSettings.twitarrRoot;
			}
			if (!twRoot.endsWith('/')) {
				twRoot += '/';
			}
			$rootScope.twitarrRoot = twRoot;
			return twRoot;
		});
	};

	const getBackgroundInterval = () => {
		return kv.get('backgroundInterval').catch(() => {
			return defaultSettings.backgroundInterval;
		}).then((backgroundInterval) => {
			if (!backgroundInterval || backgroundInterval < defaultSettings.backgroundInterval) {
				backgroundInterval = defaultSettings.backgroundInterval;
			}
			return parseInt(backgroundInterval, 10);
		});
	};

	const getEnableAdvancedSync = () => {
		return kv.get('enableAdvancedSync').catch(() => {
			return defaultSettings.enableAdvancedSync;
		}).then((advancedSyncEnabled) => {
			if (advancedSyncEnabled === null || advancedSyncEnabled === undefined) {
				advancedSyncEnabled = defaultSettings.enable;
			}
			return Boolean(advancedSyncEnabled);
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
						$rootScope.$broadcast('cruisemonkey.user.settings-changed', update);
					});
				});
			});
		});
	}
	const setProperty = (key, newValue) => {
		$log.debug(`SettingsService.setProperty(${key}, ${newValue})`);
		return kv.get(key).then((oldValue) => {
			return kv.set(key, newValue).then(() => {
				if (oldValue !== newValue) {
					const update = {
						old: {},
						new: {}
					};
					update.old[key] = oldValue;
					update['new'][key] = newValue;
					if (key === 'backgroundInterval') {
						update.old[key] = parseInt(update.old[key], 10);
						update.new[key] = parseInt(update.new[key], 10);
					} else if (key === 'enableAdvancedSync') {
						update.old[key] = Boolean(update.old[key]);
						update.new[key] = Boolean(update.new[key]);
					}
					$rootScope.$broadcast('cruisemonkey.user.settings-changed', update);
					return newValue;
				}
			});
		}).catch((err) => {
			$log.error(`SettingsService.setProperty(${key}, ${newValue}): ${err.message}`);
		});
	};

	const init = () => {
		delete $rootScope.twitarrRoot;
		return getTwitarrRoot();
	};

	const setTwitarrRoot = (root) => {
		if (root && !root.endsWith('/')) {
			root += '/';
		}

		if ($rootScope.twitarrRoot !== root) {
			return setProperty('twitarrRoot', root).then(() => {
				return init();
			});
		} else {
			return $q.resolve(root);
		}
	};

	const setBackgroundInterval = (ival) => {
		ival = parseInt(ival, 10);
		if (ival < 10) { // 10 second minimum
			ival = 10;
		}
		if (ival > 300) { // 5 minute maxiumum
			ival = 300;
		}
		return setProperty('backgroundInterval', ival);
	};

	const setEnableAdvancedSync = (enable) => {
		return setProperty('enableAdvancedSync', Boolean(enable));
	};

	const getDefaultSettings = () => {
		return angular.copy(defaultSettings);
	};

	init();

	$rootScope.$on('cruisemonkey.wipe-cache', (/* event, data */) => {
		return wipe().then(init);
	});

	return {
		getDefaultSettings: getDefaultSettings,
		getTwitarrRoot: getTwitarrRoot,
		setTwitarrRoot: setTwitarrRoot,
		getBackgroundInterval: getBackgroundInterval,
		setBackgroundInterval: setBackgroundInterval,
		getEnableAdvancedSync: getEnableAdvancedSync,
		setEnableAdvancedSync: setEnableAdvancedSync,
	};
});
