(function() {
	'use strict';

	/*global PouchDB: true*/
	/*global CMEvent: true*/
	/*global CMFavorite: true*/

	angular.module('cruisemonkey.DB', [
		'pouchdb',
		'cruisemonkey.Config'
	])
	.factory('eventsdb', ['$q', '$rootScope', '$timeout', 'config.database.replicate', 'pouchdb', 'SettingsService', function($q, $rootScope, $timeout, replicate, pouchdb, settings) {
		var pouchOptions = {};
		if (settings.getDatabaseAdapter()) {
			console.debug('eventsdb: using alternative database adapter: ' + settings.getDatabaseAdapter());
			pouchOptions.adapter = settings.getDatabaseAdapter();
		}

		console.info('Creating local database: ' + settings.getLocalEventsDatabaseUrl());
		var db = pouchdb.create(settings.getLocalEventsDatabaseUrl(), pouchOptions);
		var started = false;
		var persist;

		var startSync = function() {
			var remoteDb = settings.getRemoteEventsDatabaseUrl();
			var databaseName = settings.getLocalEventsDatabaseUrl();
			$rootScope.$broadcast('eventsdb.sync.starting', remoteDb);
			console.info('eventsdb: database sync starting: ' + remoteDb + ' -> ' + databaseName);
			var listeners = [
				{ method: 'on', event: 'uptodate', listener: function () {
					$rootScope.$evalAsync(function() {
						//console.debug('eventsdb: onUptodate');
						$rootScope.$broadcast('eventsdb.sync.uptodate');
					});
				}},
				{ method: 'on', event: 'connect', listener: function () {
					$rootScope.$evalAsync(function() {
						//console.debug('eventsdb: onConnect');
						$rootScope.$broadcast('eventsdb.sync.connect');
					});
				}},
				{ method: 'on', event: 'disconnect', listener: function () {
					$rootScope.$evalAsync(function() {
						//console.debug('eventsdb: onDisconnect');
						$rootScope.$broadcast('eventsdb.sync.disconnect');
					});
				}}
			];

			persist = db._db().persist({
				url: remoteDb,
				to: { listeners: listeners },
				from: { listeners: listeners },
				changes: {
					opts: { live: true }
				}
			});

			started = true;
		};

		var stopSync = function() {
			$rootScope.$broadcast('eventsdb.sync.stopping');
			console.info('eventsdb: database sync stopping');
			started = false;
		};

		$rootScope.$on('state.online', function(evt, from, data) {
			if (replicate) {
				startSync();
			} else {
				console.info('eventsdb: replication is disabled');
			}
		});

		$rootScope.$on('state.offline', function(evt, from, data) {
			if (replicate) {
				stopSync();
			}
		});

		return {
			isStarted: function() { return started; },
			all: function() {
				return db.all();
			}
		};
	}])
	.factory('favoritesdb', ['$q', '$rootScope', '$timeout', 'pouchdb', function($q, $rootScope, $timeout, pouchdb) {
		var db = pouchdb.create('cm5-favorites');

		var logAndEmit = function(event, from, to, data) {
			console.info(event + ': ' + from + ' -> ' + to);
			$rootScope.$emit('favorites.' + to, 'favorites.' + from, data);
		};

		var fsm = StateMachine.create({
			initial: 'disconnected',
			error: function(eventName, from, to, args, errorCode, errorMessage) {
				console.warn('StateService: event ' + eventName + ' failed: ' + from + ' -> ' + to + ' is illegal: ' + errorMessage);
			},
			events: [
				{ name: 'connect', to: 'connected', from: [
					'disconnected'
				]},
				{ name: 'disconnect', to: 'disconnected', from: [
					'connected', 'loggedin', 'loggedout'
				]},
				{ name: 'logOut', to: 'loggedout', from: [
					'connected', 'loggedin'
				]},
				{ name: 'logIn', to: 'loggedin', from: [
					'connected', 'loggedout'
				]}
			],
			callbacks: {
				onconnected: function(event, from, to, data) {
					logAndEmit(event, from, to, data);
				},
				ondisconnected: function(event, from, to, data) {
					logAndEmit(event, from, to, data);
				},
				onloggedout: function(event, from, to, data) {
					logAndEmit(event, from, to, data);
				},
				onloggedin: function(event, from, to, data) {
					logAndEmit(event, from, to, data);
				}
			}
		});

		$rootScope.$on('state.online', function(evt, from, to, data) {
			console.debug('favoritesdb: received loggedin event');
		});

		return {
		};
	}]);
}());
