(function() {
	'use strict';

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.database.host', 'cm.raccoonfink.com')
	.value('config.database.name', 'cmtest')
	.value('config.database.replicate', true)
	.value('config.database.refresh', 20000)
	.value('config.notifications.timeout', 5000)
	.value('config.twitarr.root', 'https://twitarr.rylath.net/')
	.value('config.app.version', '3.9.5')
	.value('config.upgrade', true);
	
	angular.module('cruisemonkey.Settings', [
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Upgrades'
	])
	.factory('SettingsService', ['storage', '$rootScope', 'config.database.host', 'config.database.name', 'config.database.refresh', 'config.twitarr.root', 'UpgradeService', function(storage, $rootScope, databaseHost, databaseName, databaseRefresh, twitarrRoot, upgrades) {
		var defaultValue = {
			'database.host': databaseHost,
			'database.name': databaseName,
			'database.refresh': databaseRefresh,
			'twitarr.root': twitarrRoot
		};

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

		upgrades.register('3.9.3', 'Database and Twit-Arr Settings Reset', function() {
			$rootScope._settings = getDefaults();
		});

		var getDefaults = function() {
			return angular.copy({
				databaseHost: databaseHost,
				databaseName: databaseName,
				databaseRefresh: databaseRefresh,
				twitarrRoot: twitarrRoot
			});
		};

		var getSettings = function() {
			var dbHost    = $rootScope._settings['database.host']    || databaseHost;
			var dbName    = $rootScope._settings['database.name']    || databaseName;
			var dbRefresh = $rootScope._settings['database.refresh'] || databaseRefresh;
			var twRoot    = $rootScope._settings['twitarr.root']     || twitarrRoot;

			if (dbHost === dbName) {
				console.log('Database host invalid!');
				dbHost = databaseHost;
			}

			if (typeof dbRefresh === 'string' || dbRefresh instanceof String) {
				dbRefresh = parseInt(dbRefresh, 10);
			}
			if (dbRefresh < 10000) {
				dbRefresh = 10000;
			}

			if (!twRoot.endsWith('/')) {
				twRoot += '/';
			}

			return angular.copy({
				databaseHost: dbHost,
				databaseName: dbName,
				databaseRefresh: dbRefresh,
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
			'getDatabaseRefresh': function() {
				return getSettings().databaseRefresh;
			},
			'setDatabaseRefresh': function(refresh) {
				if (refresh >= 10000) {
					$rootScope._settings['database.refresh'] = angular.copy(refresh);
				} else {
					console.log('setDatabaseRefresh failed, refresh is less than 10000.');
				}
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
