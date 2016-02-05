(function() {
	'use strict';

	var datetime = require('../util/datetime');

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.request.timeout', 10)
	.value('config.background.interval', 60)
	.value('config.twitarr.root', 'https://cm.raccoonfink.com/')
	.value('config.twitarr.enable-cachebusting', true)
	.value('config.app.version', __VERSION__)
	.value('config.app.build', __BUILD__)
	.value('config.upgrade', true);

	angular.module('cruisemonkey.Settings', [
		'cruisemonkey.Config',
		'cruisemonkey.DB',
		'cruisemonkey.Upgrades'
	])
	.factory('SettingsService', function($injector, $location, $log, $q, $rootScope, $window, kv, UpgradeService) {

		var defaultValue = {
			'twitarr.root': $injector.get('config.twitarr.root'),
			'background.interval': $injector.get('config.background.interval')
		};
		var startCruise = datetime.create('2016-02-21 00:00');
		var endCruise   = datetime.create('2016-02-28 00:00');
		var now = datetime.create();
		if (now.isAfter(startCruise) && now.isBefore(endCruise)) {
			defaultValue['twitarr.root'] = 'http://jcc6.rccl.com/';
		}

		kv.get('twitarr.root').then(function(twRoot) {
			$rootScope.twitarrRoot = twRoot;
		});

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
					twRoot = defaultValue['twitarr.root'];
				}
				if (!twRoot.endsWith('/')) {
					twRoot += '/';
				}
				$rootScope.twitarrRoot = twRoot;
				return twRoot;
			});
		};

		var setTwitarrRoot = function(root) {
			if (root && !root.endsWith('/')) {
				root += '/';
			}
			return setProperty('twitarr.root', root).then(function(ret) {
				$rootScope.twitarrRoot = root;
				return ret;
			});
		};

		var getBackgroundInterval = function() {
			return kv.get('background.interval').then(function(backgroundInterval) {
				if (!backgroundInterval || backgroundInterval < defaultValue['background.interval']) {
					backgroundInterval = defaultValue['background.interval'];
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
				twitarrRoot: defaultValue['twitarr.root'],
				backgroundInterval: defaultValue['background.interval']
			});
		};

		kv.get('cruisemonkey.settings.onaboat').then(function(onaboat) {
			var startCruise = datetime.create('2016-02-21 00:00');
			var endCruise   = datetime.create('2016-02-28 00:00');
			var now = datetime.create();

			kv.get('cruisemonkey.settings.onaboat').then(function(oab) {
				now = datetime.create();
				if (now.isAfter(startCruise) && now.isBefore(endCruise) && !oab) {
					$log.debug('We\'re on a boat!  Setting to production twit-arr URL.');

					kv.set('cruisemonkey.settings.onaboat', true);
					kv.set('twitarr.root', defaultValue['twitarr.root']);
				}
			});
		});

		getTwitarrRoot().then(function(twitarrRoot) {
			$rootScope.twitarrRoot = twitarrRoot;
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
