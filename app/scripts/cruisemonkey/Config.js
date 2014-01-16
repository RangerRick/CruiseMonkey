(function() {
	'use strict';

	angular.module('cruisemonkey.Config', [])
	.value('config.logging.useStringAppender', false)
	.value('config.database.host', 'cm.raccoonfink.com')
	.value('config.database.name', 'cruisemonkey')
	.value('config.database.replicate', true)
	.value('config.twitarr.root', 'https://twitarr.rylath.net/')
	.value('config.app.version', '3.9.1+20140115223347');
	
	angular.module('cruisemonkey.Settings', ['cruisemonkey.Config', 'angularLocalStorage'])
	.factory('SettingsService', ['storage', '$rootScope', 'config.database.host', 'config.database.name', 'config.twitarr.root', function(storage, $rootScope, databaseHost, databaseName, twitarrRoot) {
		storage.bind($rootScope, '_settings', {
			'defaultValue': {
				'database.host': databaseHost,
				'database.name': databaseName,
				'twitarr.root': twitarrRoot
			},
			'storeName': 'cm.settings'
		});
		
		return {
			'getSettings': function() {
				return angular.copy({
					databaseHost: $rootScope._settings['database.host'],
					databaseName: $rootScope._settings['database.name'],
					twitarrRoot: $rootScope._settings['twitarr.root']
				});
			},
			'getDatabaseHost': function() {
				return angular.copy($rootScope._settings['database.host']);
			},
			'setDatabaseHost': function(host) {
				$rootScope._settings['database.host'] = angular.copy(host);
			},
			'getDatabaseName': function() {
				return angular.copy($rootScope._settings['database.name']);
			},
			'setDatabaseName': function(name) {
				$rootScope._settings['database.host'] = angular.copy(name);
			},
			'getTwitarrRoot': function() {
				var twitarrRoot = $rootScope._settings['twitarr.root'];
				if (!twitarrRoot.endsWith('/')) {
					twitarrRoot += '/';
				}
				return angular.copy(twitarrRoot);
			},
			'setTwitarrRoot': function(root) {
				$rootScope._settings['twitarr.root'] = angular.copy(root);
			}
		};
	}]);
}());
