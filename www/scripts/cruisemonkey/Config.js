(function() {
	'use strict';

	/*global moment: true*/

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.database.root', 'http://localhost:5984/')
	.value('config.database.adapter', undefined)
	.value('config.database.events', 'cm5-events')
	.value('config.database.favorites', 'cm5-favorites')
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
	.factory('SettingsService', ['storage', '$rootScope', '$location', 'config.database.root', 'config.database.adapter', 'config.database.events', 'config.database.favorites', 'config.urls.openinchrome', 'config.twitarr.root', 'UpgradeService', function(storage, $rootScope, $location, databaseRoot, databaseAdapter, eventsDatabase, favoritesDatabase, openInChrome, twitarrRoot, upgrades) {
		var defaultValue = {
			'database.root': databaseRoot,
			'database.adapter': databaseAdapter,
			'database.events': eventsDatabase,
			'database.favorites': favoritesDatabase,
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
			defaultValue['database.events']    = 'cm5-events';
			defaultValue['database.favorites'] = 'cm5-favorites';
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
			$rootScope._settings['database.events']    = defaults['database.events'];
			$rootScope._settings['database.favorites'] = defaults['database.favorites'];
			$rootScope._settings['twitarr.root']       = defaults['twitarr.root'];
		}

		var getSettings = function() {
			var dbRoot       = $rootScope._settings['database.root']      || databaseRoot;
			var dbAdapter    = $rootScope._settings['database.adapter']   || databaseAdapter;
			var eventsDb     = $rootScope._settings['database.events']    || eventsDatabase;
			var favoritesDb  = $rootScope._settings['database.favorites'] || favoritesDatabase;
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
				eventsDatabase: eventsDatabase,
				favoritesDatabase: favoritesDatabase,
				openInChrome: openInChrome,
				twitarrRoot: twRoot
			});
		};

		var getRemoteDatabaseRoot = function() {
			var root = getSettings().databaseRoot;
			if (!root) {
				root = 'http://' + $location.root();
			}

			/*
			if (!root.endsWith('/')) {
				root += '/';
			}
			if (!root.startsWith('http')) {
				root = 'http://' + root;
			}
			*/

			return root;
		};

		var getRemoteEventsDatabaseUrl = function() {
			return getRemoteDatabaseRoot() + getSettings().eventsDatabase;
		};

		var getRemoteFavoritesDatabaseUrl = function() {
			return getRemoteDatabaseRoot() + getSettings().favoritesDatabase;
		};

		var getDatabaseAdapter = function() {
			return getSettings().databaseAdapter;
		};

		var getLocalEventsDatabaseUrl = function() {
			return getSettings().eventsDatabase;
		};

		var getLocalFavoritesDatabaseUrl = function() {
			return getSettings().favoritesDatabase;
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
			'getEventsDatabaseName': function() {
				return getSettings().eventsDatabase;
			},
			'setEventsDatabaseName': function(name) {
				broadcastChanges(function() {
					$rootScope._settings['database.events'] = angular.copy(name);
				});
			},
			'getFavoritesDatabaseName': function() {
				return getSettings().favoritesDatabase;
			},
			'setFavoritesDatabaseName': function(name) {
				broadcastChanges(function() {
					$rootScope._settings['database.favorites'] = angular.copy(name);
				});
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
			'getRemoteEventsDatabaseUrl': function() {
				return getRemoteEventsDatabaseUrl();
			},
			'getRemoteFavoritesDatabaseUrl': function() {
				return getRemoteFavoritesDatabaseUrl();
			},
			'getLocalEventsDatabaseUrl': function() {
				return getLocalEventsDatabaseUrl();
			},
			'getLocalFavoritesDatabaseUrl': function() {
				return getLocalFavoritesDatabaseUrl();
			}
		};
	}]);
}());
