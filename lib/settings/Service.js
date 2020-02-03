angular.module('cruisemonkey.Config', [])
.value('config.logging.useStringAppender', false)
.value('config.request.timeout', 10)
.value('config.background.interval', 60)
//	.value('config.twitarr.root', 'https://twitarr.com/')
.value('config.twitarr.root', 'https://twitarr.wookieefive.net/')
.value('config.twitarr.enable-cachebusting', true)
.value('config.app.version', __VERSION__)
.value('config.app.build', __BUILD__)
.value('config.upgrade', true);

angular.module('cruisemonkey.Settings', [
	'cruisemonkey.Config',
	'cruisemonkey.DB',
	'cruisemonkey.Upgrades'
])
.factory('SettingsService', ($injector, $q, $rootScope, kv) => {

	const getTwitarrRoot = () => {
		if ($rootScope.twitarrRoot) {
			return $q.when($rootScope.twitarrRoot);
		}
		return kv.get('twitarr.root').then((twRoot) => {
			if (!twRoot) {
				twRoot = $injector.get('config.twitarr.root');
			}
			if (!twRoot.endsWith('/')) {
				twRoot += '/';
			}
			$rootScope.twitarrRoot = twRoot;
			return twRoot;
		});
	};

	const getBackgroundInterval = () => {
		const defaultInterval = $injector.get('config.background.interval');
		return kv.get('background.interval').then((backgroundInterval) => {
			if (!backgroundInterval || backgroundInterval < defaultInterval) {
				backgroundInterval = defaultInterval;
			}
			return backgroundInterval;
		});
	};

	const wipe = () => {
		return getTwitarrRoot().then((root) => {
			return getBackgroundInterval().then((i) => {
				const update = {
					old: {
						'twitarr.root': root,
						'background.interval': i
					},
					new: {}
				};
				return kv.wipe().then(() => {
					$rootScope.$broadcast('cruisemonkey.user.settings-changed', update);
				});
			});
		});
	}
	const setProperty = (key, newValue) => {
		return kv.get(key).then((oldValue) => {
			return kv.set(key, newValue).then(() => {
				if (oldValue !== newValue) {
					const update = {
						old: {},
						new: {}
					};
					update.old[key] = oldValue;
					update['new'][key] = newValue;
					$rootScope.$broadcast('cruisemonkey.user.settings-changed', update);
					return newValue;
				}
			});
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
			return setProperty('twitarr.root', root).then(() => {
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
		return setProperty('background.interval', ival);
	};

	const getDefaultSettings = () => {
		return angular.copy({
			twitarrRoot: $injector.get('config.twitarr.root'),
			backgroundInterval: $injector.get('config.background.interval')
		});
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
		setBackgroundInterval: setBackgroundInterval
	};
});
