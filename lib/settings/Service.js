(function() {
	'use strict';

	var datetime = require('../util/datetime');

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.request.timeout', 10)
	.value('config.background.interval', 60)
	.value('config.twitarr.root', 'http://joco.hollandamerica.com/')
	.value('config.twitarr.enable-cachebusting', true)
	.value('config.app.version', __VERSION__)
	.value('config.app.build', __BUILD__)
	.value('config.upgrade', true);

	angular.module('cruisemonkey.Settings', [
		'cruisemonkey.Config',
		'cruisemonkey.DB',
		'cruisemonkey.Upgrades'
	])
	.factory('SettingsService', function($injector, $ionicPopup, $location, $log, $q, $rootScope, $window, kv, UpgradeService) {

		var wipe = function() {
			return getTwitarrRoot().then(function(root) {
				return getBackgroundInterval().then(function(i) {
					var update = {
						old: {
							'twitarr.root': root,
							'background.interval': i
						},
						new: {}
					};
					return kv.wipe().then(function() {
						$rootScope.$broadcast('cruisemonkey.user.settings-changed', update);
					});
				});
			});
		}
		var setProperty = function(key, newValue) {
			return kv.get(key).then(function(oldValue) {
				return kv.set(key, newValue).then(function() {
					if (oldValue !== newValue) {
						var update = {
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

		var getTwitarrRoot = function() {
			if ($rootScope.twitarrRoot) {
				return $q.when($rootScope.twitarrRoot);
			}
			return kv.get('twitarr.root').then(function(twRoot) {
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

		var init = function() {
			delete $rootScope.twitarrRoot;
			return getTwitarrRoot();
		};

		var setTwitarrRoot = function(root) {
			if (root && !root.endsWith('/')) {
				root += '/';
			}

			if ($rootScope.twitarrRoot !== root) {
				return setProperty('twitarr.root', root).then(function() {
					return init();
				});
			} else {
				return $q.resolve(root);
			}
		};

		var getBackgroundInterval = function() {
			var defaultInterval = $injector.get('config.background.interval');
			return kv.get('background.interval').then(function(backgroundInterval) {
				if (!backgroundInterval || backgroundInterval < defaultInterval) {
					backgroundInterval = defaultInterval;
				}
				return backgroundInterval;
			});
		};
		var setBackgroundInterval = function(ival) {
			ival = parseInt(ival);
			if (ival < 10) { // 10 second minimum
				ival = 10;
			}
			if (ival > 300) { // 5 minute maxiumum
				ival = 300;
			}
			return setProperty('background.interval', ival);
		};

		var getDefaultSettings = function() {
			return angular.copy({
				twitarrRoot: $injector.get('config.twitarr.root'),
				backgroundInterval: $injector.get('config.background.interval')
			});
		};

		init();

		$rootScope.$on('cruisemonkey.wipe-cache', function(event, data) {
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
}());
