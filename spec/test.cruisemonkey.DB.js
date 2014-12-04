/*global jasmine: true */
/*global describe: true */
/*global expect: true */
/*global inject: true */
/*global beforeEach: true */
/*global afterEach: true */
/*global it: true */
/*global spyOn: true */
/*global xit: true */
/*global xdescribe: true */
/*global PouchDB: true */

describe('DB Tests', function() {
	'use strict';

	var eventsdb,
		favoritesdb,
		settings,
		$q,
		$rootScope,
		pouchdb,
		originalTimeout,
		timeout = 10000,
		entries;

	var couchRemoteName = 'http://localhost:5984';

	beforeEach(function() {
		console.info('--------------------------------------------------------------------------------');
		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
		jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
		$rootScope = undefined;
		eventsdb = undefined;
		favoritesdb = undefined;
	});

	var destroyDatabases = function(done) {
		var dbs = [
		couchRemoteName + '/eventsdb',
		couchRemoteName + '/favoritesdb',
		'eventsdb',
		'favoritesdb'
		];

		var count = 0;
		for (var i in dbs) {
			var db = dbs[i];
			console.debug('destroying ' + db);
			PouchDB.destroy(db).then(function() {
				count++;
				if (count === dbs.length) {
					console.debug('destroyed ' + count + ' databases');
					done();
				}
			});
		}
	};

	beforeEach(destroyDatabases);

	beforeEach(function(done) {
		module('pouchdb');
		module('toaster');
		module('cruisemonkey.Config');
		module('cruisemonkey.Notifications');
		module('cruisemonkey.Upgrades');
		module('cruisemonkey.Settings', function($provide) {
			$provide.value('config.logging.useStringAppender', true);
			$provide.value('config.database.root', couchRemoteName);
			$provide.value('config.database.adapter', undefined);
			$provide.value('config.database.replicate', true);
			$provide.value('config.database.events', 'eventsdb');
			$provide.value('config.database.favorites', 'favoritesdb');
		});
		module('cruisemonkey.DB');
		inject(function(_$q_, _$rootScope_, _pouchdb_, _eventsdb_, _SettingsService_) {
			$q         = _$q_;
			$rootScope = _$rootScope_;
			pouchdb    = _pouchdb_;
			settings   = _SettingsService_;
			eventsdb   = _eventsdb_;

			spyOn($rootScope, '$broadcast').and.callThrough();
			spyOn($rootScope, '$emit').and.callThrough();

			done();
		});
	});

	beforeEach(function(done) {
		entries = [
			{ '$id': '1', username: 'official',   summary: 'official event',           start: '2012-01-01 00:00', isPublic: true  },
			{ '$id': '2', username: 'rangerrick', summary: 'rangerrick public event',  start: '2013-01-01 00:00', isPublic: true  },
			{ '$id': '3', username: 'rangerrick', summary: 'rangerrick private event', start: '2013-01-02 00:00', isPublic: false },
			{ '$id': '4', username: 'triluna',    summary: 'triluna public event',     start: '2013-02-01 00:00', isPublic: true  },
			{ '$id': '5', username: 'triluna',    summary: 'triluna private event',    start: '2013-02-02 00:00', isPublic: false }
		];
		var remote = new PouchDB(couchRemoteName + '/eventsdb');
		var count = 0;
		for (var entry in entries) {
			entry = entries[entry];
			remote.save(entry).then(function(doc) {
				count++;
				if (count == entries.length) {
					console.debug('created ' + count + ' entries');
					done();
				}
			});
		}
	});

	afterEach(destroyDatabases);

	afterEach(function() {
		jasmine.DEFAULT_TIMEOUT_INTERVAL_INTERVAL = originalTimeout;
	});

	it('should be disconnected by default', function() {
		expect($rootScope.$broadcast.calls.count()).toEqual(0);
		expect($rootScope.$emit.calls.count()).toEqual(0);
		expect(eventsdb.isStarted()).toBe(false);
	});

	it('should connect when state.online is emitted', function() {
		expect(eventsdb.isStarted()).toBe(false);
		$rootScope.$broadcast('state.online', 'state.offline', undefined);
		$rootScope.$digest();
		expect($rootScope.$broadcast).toHaveBeenCalledWith('eventsdb.sync.starting', 'http://localhost:5984/eventsdb');
		expect(eventsdb.isStarted()).toBe(true);
	});

	xit('should have replicated when everything has started', function(done) {
		$rootScope.$broadcast('state.online', 'state.offline', undefined);
		$rootScope.$digest();
		window.setInterval(function() {
			console.debug('digest');
			$rootScope.$digest();
		}, 200);
		window.setTimeout(function() {
			console.debug('calling all');
			eventsdb.all().then(function(docs) {
				var count = 0;
				angular.forEach(docs, function(key, value) {
					console.debug(key, value);
					count++;
				});
				expect(count).toBe(5);
				done();
			}, function(err) {
				console.debug('err=',err);
				expect(err).toBeUndefined();
				done();
			});
			$rootScope.$digest();
		}, 2000);
	});

	xit('should initialize when Cordova is ready and online', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.initialized', 'state.uninitialized', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.online', 'state.initialized', true);
	});

	xit('should initialize when Cordova is ready and offline', function() {
		spyOn($rootScope, '$emit');
		isOnline = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.initialized', 'state.uninitialized', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.offline', 'state.initialized', true);
	});

	xit('should be logged out by default', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.initialized', 'state.uninitialized', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.online', 'state.initialized', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'state.online', undefined);
	});

	xit('should stay logged out if login fails', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'state.online', undefined);
		StateService.loginFailed();
		expect($rootScope.$emit.calls.count()).toEqual(3); // [state.initialized, state.online, state.loggedout]
	});

	xit('should switch to logged in if the user logs in and the username is in UserService', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'state.online', undefined);
		user.username = 'ranger';
		StateService.loginSucceeded();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedin', 'state.loggedout', 'ranger');
		expect($rootScope.$emit.calls.count()).toEqual(4); // [state.initialized, state.online, state.loggedout, state.loggedin]
	});

	xit('should switch to logged in if the user logs in and the username is passed', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'state.online', undefined);
		StateService.loginSucceeded('ranger');
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedin', 'state.loggedout', 'ranger');
		expect($rootScope.$emit.calls.count()).toEqual(4); // [state.initialized, state.online, state.loggedout, state.loggedin]
	});

});
