(function() {
	'use strict';

	/*global moment: true*/

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.database.root', 'https://jccc5.rylath.net/db/')
	.value('config.database.name', 'cruisemonkey-test')
	.value('config.database.replicate', true)
	.value('config.request.timeout', 10000)
	.value('config.background.interval', 30000)
	.value('config.twitarr.root', 'https://jccc5.rylath.net/')
	.value('config.twitarr.enable-cachebusting', true)
	.value('config.app.version', '***VERSION***')
	.value('config.app.build', '***BUILD***')
	.value('config.upgrade', true);

	angular.module('cruisemonkey.Settings', [
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Upgrades'
	])
	.factory('SettingsService', ['storage', '$rootScope', '$location', '$window', 'UpgradeService',
			'config.database.root', 'config.database.name', 'config.database.replicate', 'config.twitarr.root', 'config.background.interval',
			function(storage, $rootScope, $location, $window, upgrades,
			databaseRoot, databaseName, databaseReplicate, twitarrRoot, backgroundInterval) {

		var defaultValue = {
			'database.root': databaseRoot,
			'database.name': databaseName,
			'database.replicate': databaseReplicate,
			'twitarr.root': twitarrRoot,
			'background.interval': backgroundInterval,
		};

		var settings = storage.get('cruisemonkey.settings');
		if (!settings) {
			settings = defaultValue;
		}

		var updateStorage = function() {
			if (settings === undefined) {
				storage.remove('cruisemonkey.settings');
			} else {
				storage.set('cruisemonkey.settings', settings);
			}
		};

		var clearOldStorage = function() {
			var i, key, numItems = $window.localStorage.length;
			for (i=numItems; i <= 0; i--) {
				key = $window.localStorage.key(i);
				if (!key.startsWith('cruisemonkey.')) {
					console.log('Local Storage: removing key ' + key);
					$window.localStorage.removeItem(key);
				}
			}
		};

		var broadcastChanges = function(callback) {
			var oldSettings = getSettings();
			callback();
			$rootScope.$broadcast('cruisemonkey.user.settings-changed', {
				'old': oldSettings,
				'new': getSettings()
			});
		};

		var getDatabaseRoot = function() {
			var dbRoot = settings['database.root'] || defaultValue['database.root'];
			if (dbRoot.startsWith('http') && !dbRoot.endsWith('/')) {
				dbRoot += '/';
			}
			return dbRoot;
		};
		var setDatabaseRoot = function(root) {
			settings['database.root'] = angular.copy(root);
			updateStorage();
		};

		var getDatabaseName = function() {
			return settings['database.name'] || defaultValue['database.name'];
		};
		var setDatabaseName = function(name) {
			settings['database.name'] = angular.copy(name);
			updateStorage();
		};

		var shouldDatabaseReplicate = function() {
			return settings['database.replicate'] || defaultValue['database.replicate'];	
		};
		var setDatabaseReplicate = function(shouldReplicate) {
			settings['database.replicate'] = angular.copy(shouldReplicate);
			updateStorage();
		};

		var getTwitarrRoot = function() {
			var twRoot = settings['twitarr.root'] || defaultValue['twitarr.root'];
			if (!twRoot.endsWith('/')) {
				twRoot += '/';
			}
			return twRoot;
		};
		var setTwitarrRoot = function(root) {
			settings['twitarr.root'] = angular.copy(root);
			updateStorage();
		};

		var getBackgroundInterval = function() {
			var backgroundInterval = settings['background.interval'] || defaultValue['background.interval'];
			return backgroundInterval;
		};
		var setBackgroundInterval = function(ival) {
			ival = parseInt(ival);
			if (ival >= 10000) {
				settings['background.interval'] = ival;
			} else {
				console.log('SettingsService.setBackgroundInterval: interval must be at least 10 seconds!');
			}
			updateStorage();
		};

		var getDefaultSettings = function() {
			return angular.copy({
				databaseRoot: defaultValue['database.root'],
				databaseName: defaultValue['database.name'],
				databaseReplicate: defaultValue['database.replicate'],
				twitarrRoot: defaultValue['twitarr.root'],
				backgroundInterval: defaultValue['background.interval'],
			});
		};

		var getSettings = function() {
			return angular.copy({
				databaseRoot: getDatabaseRoot(),
				databaseName: getDatabaseName(),
				databaseReplicate: shouldDatabaseReplicate(),
				twitarrRoot: getTwitarrRoot(),
				backgroundInterval: getBackgroundInterval(),
			});
		};

		var saveSettings = function(newSettings) {
			setDatabaseRoot(newSettings.databaseRoot);
			setDatabaseName(newSettings.databaseName);
			setDatabaseReplicate(newSettings.databaseReplicate);
			setTwitarrRoot(newSettings.twitarrRoot);
			setBackgroundInterval(newSettings.backgroundInterval);
		};

		var getRemoteDatabaseRoot = function() {
			var root = getDatabaseRoot();
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

		var onaboat = storage.get('cruisemonkey.settings.onaboat');

		var startCruise = moment('2015-01-31 00:00');
		var endCruise   = moment('2015-02-08 00:00');
		var now = moment();

		if (now.isAfter(startCruise) && now.isBefore(endCruise) && !$rootScope.onaboat) {
			storage.set('cruisemonkey.settings.onaboat', true);

			/* switch out the defaults with the shipboard ones */
			defaultValue['database.root'] = 'http://jcc5.rccl.com/db/';
			defaultValue['database.name'] = 'cruisemonkey-2015';
			defaultValue['twitarr.root']  = 'http://jcc5.rccl.com/';

			/* now override the user's settings */
			var s = getSettings();
			s.databaseRoot = defaultValue['database.root'];
			s.databaseName = defaultValue['database.name'];
			s.twitarrRoot  = defaultValue['twitarr.root'];
			saveSettings(s);
		}

		upgrades.register('4.8.90', 'Reset all local storage.', function() {
			clearOldStorage();
		});

		return {
			'getDefaultSettings': getDefaultSettings,
			'getSettings': getSettings,
			'saveSettings': function(settings) {
				broadcastChanges(function() {
					saveSettings(settings);
				});
			},
			'getDatabaseRoot': getDatabaseRoot,
			'setDatabaseRoot': function(root) {
				broadcastChanges(function() {
					setDatabaseRoot(root);
				});
			},
			'getDatabaseName': getDatabaseName,
			'setDatabaseName': function(name) {
				broadcastChanges(function() {
					setDatabaseName(name);
				});
			},
			'shouldDatabaseReplicate': shouldDatabaseReplicate,
			'setDatabaseReplicate': function(shouldReplicate) {
				broadcastChanges(function() {
					setDatabaseReplicate(shouldReplicate);
				});
			},
			'getTwitarrRoot': getTwitarrRoot,
			'setTwitarrRoot': function(root) {
				broadcastChanges(function() {
					setTwitarrRoot(root);
				});
			},
			'getBackgroundInterval': getBackgroundInterval,
			'setBackgroundInterval': function(ival) {
				broadcastChanges(function() {
					setBackgroundInterval(ival);
				});
			},
			'getRemoteDatabaseRoot': getRemoteDatabaseRoot,
			'getRemoteDatabaseUrl': function() {
				return getRemoteDatabaseRoot() + getDatabaseName();
			},
			'getLocalDatabaseUrl': function() {
				return getDatabaseName();
			}
		};
	}]);
}());
