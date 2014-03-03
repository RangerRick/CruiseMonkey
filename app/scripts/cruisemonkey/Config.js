(function() {
	'use strict';

	/*global moment: true*/

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.database.host', 'https://twitarr.rylath.net/db/')
	.value('config.database.name', 'cmtest')
	.value('config.database.replicate', true)
	.value('config.urls.openinchrome', false)
	.value('config.notifications.timeout', 5000)
	.value('config.twitarr.root', 'https://twitarr.rylath.net/')
	.value('config.app.version', '4.0.6')
	.value('config.upgrade', true);
	
	angular.module('cruisemonkey.Settings', [
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Upgrades'
	])
	.factory('SettingsService', ['storage', '$rootScope', 'config.database.host', 'config.database.name', 'config.urls.openinchrome', 'config.twitarr.root', 'UpgradeService', function(storage, $rootScope, databaseHost, databaseName, openInChrome, twitarrRoot, upgrades) {
		var defaultValue = {
			'database.host': databaseHost,
			'database.name': databaseName,
			'urls.openinchrome': openInChrome,
			'twitarr.root': twitarrRoot
		};

		storage.bind($rootScope, 'onaboat', {
			'defaultValue': false,
			'storeName': 'cm.settings.onaboat'
		});

		var startCruise = moment('2014-02-23 00:00');
		var endCruise   = moment('2014-03-02 00:00');
		var now = moment();
		if (now.isAfter(startCruise) && now.isBefore(endCruise)) {
			defaultValue['database.host'] = 'http://jccc4.rccl.com/db/';
			defaultValue['database.name'] = 'cruisemonkey-jccc4';
			defaultValue['twitarr.root']  = 'http://jccc4.rccl.com/';
		}

		$rootScope.safeApply = function(fn) {
			var phase = this.$root.$$phase;
			if(phase === '$apply' || phase === '$digest') {
				if(fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};

		storage.bind($rootScope, '_settings', {
			'defaultValue': defaultValue,
			'storeName': 'cm.settings'
		});

		upgrades.register('4.0.2', 'Database and Twit-Arr Settings Reset', function() {
			$rootScope._settings = getDefaults();
		});

		var getDefaults = function() {
			return angular.copy(defaultValue);
		};

		if (now.isAfter(startCruise) && now.isBefore(endCruise) && !$rootScope.onaboat) {
			$rootScope.onaboat = true;
			var defaults = getDefaults();
			$rootScope._settings['database.host'] = defaults['database.host'];
			$rootScope._settings['database.name'] = defaults['database.name'];
			$rootScope._settings['twitarr.root']  = defaults['twitarr.root'];
		}

		var getSettings = function() {
			var dbHost       = $rootScope._settings['database.host']     || databaseHost;
			var dbName       = $rootScope._settings['database.name']     || databaseName;
			var openInChrome = $rootScope._settings['urls.openinchrome'] || openInChrome;
			var twRoot       = $rootScope._settings['twitarr.root']      || twitarrRoot;

			if (dbHost === dbName) {
				console.log('Database host invalid!');
				dbHost = databaseHost;
			}

			if (!twRoot.endsWith('/')) {
				twRoot += '/';
			}

			if (!openInChrome) {
				openInChrome = false;
			}

			return angular.copy({
				databaseHost: dbHost,
				databaseName: dbName,
				openInChrome: openInChrome,
				twitarrRoot: twRoot
			});
		};

		return {
			'getSettings': getSettings,
			'getDefaults': getDefaults,
			'getDatabaseHost': function() {
				return getSettings().databaseHost;
			},
			'setDatabaseHost': function(host) {
				$rootScope._settings['database.host'] = angular.copy(host);
			},
			'getDatabaseName': function() {
				return getSettings().databaseName;
			},
			'setDatabaseName': function(name) {
				$rootScope._settings['database.name'] = angular.copy(name);
			},
			'getOpenInChrome': function() {
				return getSettings().openInChrome;
			},
			'setOpenInChrome': function(oic) {
				if (!oic) {
					oic = false;
				}
				$rootScope._settings['urls.openinchrome'] = oic;
			},
			'getTwitarrRoot': function() {
				return getSettings().twitarrRoot;
			},
			'setTwitarrRoot': function(root) {
				$rootScope._settings['twitarr.root'] = angular.copy(root);
			}
		};
	}]);
}());
