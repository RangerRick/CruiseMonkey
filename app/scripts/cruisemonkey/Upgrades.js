(function() {
	'use strict';

	var compareVersions = function (versionA, versionB) {
		var arrA,
			arrB;

		arrA = typeof versionA !== 'object' ? versionA.toString().split('.') : versionA;
		arrB = typeof versionB !== 'object' ? versionB.toString().split('.') : versionB;

		for (var i = 0; i < (Math.max(arrA.length, arrB.length)); i++) {
			arrA[i] = typeof arrA[i] === 'undefined' ? 0 : Number(arrA[i]);
			arrB[i] = typeof arrB[i] === 'undefined' ? 0 : Number(arrB[i]);

			if (arrA[i] > arrB[i]) {
				return 1;
			}
			if (arrA[i] < arrB[i]) {
				return -1;
			}
		}
		return 0;
	};

	angular.module('cruisemonkey.Upgrades', [
		'angularLocalStorage',
		'cruisemonkey.Config',
		'cruisemonkey.Notifications'
	])
	.factory('UpgradeService', ['$q', '$timeout', '$log', 'NotificationService', 'storage', 'config.app.version', 'config.upgrade', function($q, $timeout, log, notifications, storage, version, shouldUpgrade) {
		var previousVersion = storage.get('cm.version');
		if (!previousVersion) {
			previousVersion = '0.0.0';
		}
		var currentVersion = version.split('+')[0];

		log.info('UpgradeService initializing.');

		var actions = [];

		var registerAction = function(version, affected, callback) {
			log.debug('action registered for version ' + version + ': ' + affected);
			actions.push({
				'version': version,
				'affected': affected,
				'callback': callback
			});
		};

		var doUpgrade = function() {
			var performed = [];

			var def = $q.defer();

			log.debug('UpgradeService.upgrade(): previous version = ' + previousVersion + ', current version = ' + currentVersion);

			if (!shouldUpgrade) {
				log.info('Upgrades disabled.');
				$timeout(function() {
					def.resolve(false);
				});
			} else if (compareVersions(currentVersion, previousVersion) > 0) {
				log.info('Upgrade for ' + currentVersion + ' has not yet run.');

				var deferred = [];
				angular.forEach(actions, function(action) {
					var comparison = compareVersions(action.version, previousVersion);
					if (comparison > 0) {
						log.info('UpgradeService.upgrade(): performing upgrade: ' + action.version + ': ' + action.affected);
						deferred.push(action.callback());
						performed.push(action);
					} else {
						log.info('UpgradeService.upgrade(): skipping upgrade: ' + action.version + ': ' + action.affected);
					}
				});
				if (performed.length > 0 && previousVersion !== '0.0.0') {
					var notif = "Upgrade to " + currentVersion + " complete:<br/>";
					angular.forEach(performed, function(action) {
						notif += "* " + action.affected + "<br/>";
					});
					notifications.status(notif, 5000);
				}
				storage.set('cm.version', currentVersion);
				$q.all(deferred)['finally'](function() {
					def.resolve(true);
				});
			} else {
				log.info('No upgrade necessary for version ' + currentVersion + '.');
				$timeout(function() {
					def.resolve(true);
				});
			}

			return def;
		};

		return {
			'register': registerAction,
			'upgrade': doUpgrade
		};
	}]);
}());
