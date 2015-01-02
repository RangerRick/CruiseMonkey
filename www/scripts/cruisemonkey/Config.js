(function() {
	'use strict';

	/*global moment: true*/

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.database.root', 'http://192.168.211.30:5984/')
	.value('config.database.adapter', undefined)
	.value('config.database.name', 'cruisemonkey')
	.value('config.database.replicate', true)
	.value('config.urls.openinchrome', false)
	.value('config.notifications.timeout', 5000)
	.value('config.twitarr.root', 'https://twitarr.rylath.net/')
	.value('config.app.version', '***VERSION***')
	.value('config.upgrade', true);

	angular.module('cruisemonkey.Settings', [
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Upgrades'
	])
	.factory('SettingsService', ['storage', '$rootScope', '$location', 'config.database.root', 'config.database.adapter', 'config.database.name', 'config.database.replicate', 'config.urls.openinchrome', 'config.twitarr.root', 'UpgradeService', function(storage, $rootScope, $location, databaseRoot, databaseAdapter, databaseName, databaseReplicate, openInChrome, twitarrRoot, upgrades) {
		var defaultValue = {
			'database.root': databaseRoot,
			'database.adapter': databaseAdapter,
			'database.name': databaseName,
			'database.replicate': databaseReplicate,
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
			defaultValue['database.root']      = 'http://jccc4.rccl.com/db/';
			defaultValue['database.name']      = 'cruisemonkey';
			defaultValue['twitarr.root']       = 'http://jccc4.rccl.com/';
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

		upgrades.register('***VERSION***', 'Database and Twit-Arr Settings Reset', function() {
			console.info('resetting config to defaults');
			$rootScope._settings = getDefaults();
		});

		var getDefaults = function() {
			return angular.copy(defaultValue);
		};

		if (now.isAfter(startCruise) && now.isBefore(endCruise) && !$rootScope.onaboat) {
			$rootScope.onaboat = true;
			var defaults = getDefaults();
			$rootScope._settings['database.root']      = defaults['database.root'];
			$rootScope._settings['database.name']      = defaults['database.name'];
			$rootScope._settings['twitarr.root']       = defaults['twitarr.root'];
		}

		var getSettings = function() {
			var dbRoot       = $rootScope._settings['database.root']      || databaseRoot;
			var dbAdapter    = $rootScope._settings['database.adapter']   || databaseAdapter;
			var dbName       = $rootScope._settings['database.name']      || databaseName;
			var dbReplicate  = $rootScope._settings['database.replicate'] || databaseReplicate;
			var openInChrome = $rootScope._settings['urls.openinchrome']  || openInChrome;
			var twRoot       = $rootScope._settings['twitarr.root']       || twitarrRoot;

			if (dbRoot.startsWith('http') && !dbRoot.endsWith('/')) {
				dbRoot += '/';
			}

			if (!twRoot.endsWith('/')) {
				twRoot += '/';
			}

			if (!openInChrome) {
				openInChrome = false;
			}

			return angular.copy({
				databaseRoot: dbRoot,
				databaseAdapter: dbAdapter,
				databaseName: dbName,
				databaseReplicate: dbReplicate,
				openInChrome: openInChrome,
				twitarrRoot: twRoot
			});
		};

		var getRemoteDatabaseRoot = function() {
			var root = getSettings().databaseRoot;
			if (!root) {
				root = 'http://' + $location.root();
			}

			if (!root.endsWith('/')) {
				root += '/';
			}
			if (!root.startsWith('http')) {
				root = 'http://' + root;
			}

			return root;
		};

		var broadcastChanges = function(callback) {
			var oldSettings = getSettings();
			callback();
			$rootScope.$broadcast('settings.changed', {
				'old': oldSettings,
				'new': getSettings()
			});
		};

		return {
			'getSettings': getSettings,
			'getDefaults': getDefaults,
			'getDatabaseRoot': function() {
				return getSettings().databaseRoot;
			},
			'setDatabaseRoot': function(root) {
				broadcastChanges(function() {
					$rootScope._settings['database.root'] = angular.copy(root);
				});
			},
			'getDatabaseAdapter': function() {
				return getSettings().databaseAdapter;
			},
			'getDatabaseName': function() {
				return getSettings().databaseName;
			},
			'setDatabaseName': function(name) {
				broadcastChanges(function() {
					$rootScope._settings['database.name'] = angular.copy(name);
				});
			},
			'getDatabaseReplicate': function() {
				return getSettings().databaseReplicate;
			},
			'getOpenInChrome': function() {
				return getSettings().openInChrome;
			},
			'setOpenInChrome': function(oic) {
				if (!oic) {
					oic = false;
				}
				broadcastChanges(function() {
					$rootScope._settings['urls.openinchrome'] = oic;
				});
			},
			'getTwitarrRoot': function() {
				return getSettings().twitarrRoot;
			},
			'setTwitarrRoot': function(root) {
				broadcastChanges(function() {
					$rootScope._settings['twitarr.root'] = angular.copy(root);
				});
			},
			'getRemoteDatabaseUrl': function() {
				return getRemoteDatabaseRoot() + getSettings().databaseName;
			},
			'getLocalDatabaseUrl': function() {
				return getSettings().databaseName;
			}
		};
	}]);
}());
