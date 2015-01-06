(function() {
	'use strict';

	/*global moment: true*/

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.database.root', 'http://cm.raccoonfink.com/db/')
	.value('config.database.name', 'cruisemonkey-test')
	.value('config.database.replicate', true)
	.value('config.urls.openinchrome', false)
	.value('config.notifications.timeout', 5000)
	.value('config.twitarr.root', 'http://cm.raccoonfink.com/')
	.value('config.app.version', '***VERSION***')
	.value('config.upgrade', true);

	angular.module('cruisemonkey.Settings', [
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Upgrades'
	])
	.factory('SettingsService', ['storage', '$rootScope', '$location', '$window', 'UpgradeService',
			'config.database.root', 'config.database.name', 'config.database.replicate', 'config.urls.openinchrome', 'config.twitarr.root',
			function(storage, $rootScope, $location, $window, upgrades,
			databaseRoot, databaseName, databaseReplicate, openInChrome, twitarrRoot) {

		var defaultValue = {
			'database.root': databaseRoot,
			'database.name': databaseName,
			'database.replicate': databaseReplicate,
			'urls.openinchrome': openInChrome,
			'twitarr.root': twitarrRoot
		};

		storage.bind($rootScope, '_settings', {
			'defaultValue': defaultValue,
			'storeName': 'cruisemonkey.settings'
		});

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
			var dbRoot = $rootScope._settings['database.root'] || defaultValue['database.root'];
			if (dbRoot.startsWith('http') && !dbRoot.endsWith('/')) {
				dbRoot += '/';
			}
			return dbRoot;
		};
		var setDatabaseRoot = function(root) {
			$rootScope._settings['database.root'] = angular.copy(root);
		};

		var getDatabaseName = function() {
			return $rootScope._settings['database.name'] || defaultValue['database.name'];
		};
		var setDatabaseName = function(name) {
			$rootScope._settings['database.name'] = angular.copy(name);
		};

		var shouldDatabaseReplicate = function() {
			return $rootScope._settings['database.replicate'] || defaultValue['database.replicate'];	
		};
		var setDatabaseReplicate = function(shouldReplicate) {
			$rootScope._settings['database.replicate'] = angular.copy(shouldReplicate);
		};

		var shouldOpenInChrome = function() {
			var oic = $rootScope._settings['urls.openinchrome'] || defaultValue['urls.openinchrome'];
			if (!oic) { oic = false; }
			return oic;
		};
		var setOpenInChrome = function(shouldOpenInChrome) {
			$rootScope._settings['urls.openinchrome'] = angular.copy(shouldOpenInChrome);
		};

		var getTwitarrRoot = function() {
			var twRoot = $rootScope._settings['twitarr.root'] || defaultValue['twitarr.root'];
			if (!twRoot.endsWith('/')) {
				twRoot += '/';
			}
			return twRoot;
		};
		var setTwitarrRoot = function(root) {
			$rootScope._settings['twitarr.root'] = angular.copy(root);
		};

		var getDefaultSettings = function() {
			return angular.copy({
				databaseRoot: defaultValue['database.root'],
				databaseName: defaultValue['database.name'],
				databaseReplicate: defaultValue['database.replicate'],
				openInChrome: defaultValue['urls.openinchrome'],
				twitarrRoot: defaultValue['twitarr.root']
			});
		};

		var getSettings = function() {
			return angular.copy({
				databaseRoot: getDatabaseRoot(),
				databaseName: getDatabaseName(),
				databaseReplicate: shouldDatabaseReplicate(),
				openInChrome: shouldOpenInChrome(),
				twitarrRoot: getTwitarrRoot()
			});
		};

		var saveSettings = function(newSettings) {
			$rootScope._settings['database.root']      = newSettings.databaseRoot;
			$rootScope._settings['database.name']      = newSettings.databaseName;
			$rootScope._settings['database.replicate'] = newSettings.databaseReplicate;
			$rootScope._settings['urls.openinchrome']  = newSettings.openInChrome;
			$rootScope._settings['twitarr.root']       = newSettings.twitarrRoot;
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
			defaultValue['database.root'] = 'http://jccc5.rccl.com/db/';
			defaultValue['database.name'] = 'cruisemonkey';
			defaultValue['twitarr.root']  = 'http://jccc5.rccl.com/';

			/* now override the user's settings */
			var s = getSettings();
			s.databaseRoot = defaultValue['database.root'];
			s.databaseName = defaultValue['database.name'];
			s.twitarrRoot  = defaultValue['twitarr.root'];
			saveSettings(s);
		}

		upgrades.register('4.0.82', 'Reset all local storage.', function() {
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
			'shouldOpenInChrome': shouldOpenInChrome,
			'setOpenInChrome': function(oic) {
				if (!oic) {
					oic = false;
				}
				broadcastChanges(function() {
					setOpenInChrome(oic);
				});
			},
			'getTwitarrRoot': getTwitarrRoot,
			'setTwitarrRoot': function(root) {
				broadcastChanges(function() {
					setTwitarrRoot(root);
				});
			},
			'getRemoteDatabaseUrl': function() {
				return getRemoteDatabaseRoot() + getDatabaseName();
			},
			'getLocalDatabaseUrl': function() {
				return getDatabaseName();
			}
		};
	}]);
}());
