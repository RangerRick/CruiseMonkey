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

xdescribe('DB Tests', function() {
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
		inject(function(_$q_, _$rootScope_, _pouchdb_, _eventsdb_, _favoritesdb_, _SettingsService_) {
			$q          = _$q_;
			$rootScope  = _$rootScope_;
			pouchdb     = _pouchdb_;
			settings    = _SettingsService_;
			eventsdb    = _eventsdb_;
			favoritesdb = _favoritesdb_;

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
					console.debug('created ' + count + ' events');
					done();
				}
			});
		}
	});

	beforeEach(function(done) {
		entries = [
			{ '$id': '1', username: 'rangerrick', eventId: '1' }
		];
		var remote = new PouchDB(couchRemoteName + '/favoritesdb');
		var count = 0;
		for (var entry in entries) {
			entry = entries[entry];
			remote.save(entry).then(function(doc) {
				count++;
				if (count == entries.length) {
					console.debug('created ' + count + ' favorites');
					done();
				}
			});
		}
	});

	afterEach(destroyDatabases);

	afterEach(function() {
		stopDigesting();
		jasmine.DEFAULT_TIMEOUT_INTERVAL_INTERVAL = originalTimeout;
	});

	it('should be disconnected by default', function() {
		expect($rootScope.$broadcast.calls.count()).toEqual(0);
		expect($rootScope.$emit.calls.count()).toEqual(0);
		expect(eventsdb.isStarted()).toBe(false);
		expect(favoritesdb.isStarted()).toBe(false);
	});

	it('should connect when state.online is emitted', function(done) {
		expect(eventsdb.isStarted()).toBe(false);
		expect(favoritesdb.isStarted()).toBe(false);
		$rootScope.$broadcast('state.online', 'state.offline', undefined);
		$rootScope.$digest();
		expect($rootScope.$broadcast).toHaveBeenCalledWith('eventsdb.sync.starting', 'http://localhost:5984/eventsdb');
		window.setTimeout(function() {
			expect(eventsdb.isStarted()).toBe(true);
			expect(favoritesdb.isStarted()).toBe(false);
			done();
		}, 200);
	});

	it('should have replicated when everything has started', function(done) {
		$rootScope.$broadcast('state.online', 'state.offline', undefined);
		startDigesting();
		window.setTimeout(function() {
			eventsdb.count().then(function(count) {
				expect(count).toBe(5);
				expect(eventsdb.isStarted()).toBe(true);
				expect(favoritesdb.isStarted()).toBe(false);
				done();
			}, function(err) {
				console.debug('err=',err);
				expect(err).toBeUndefined();
				done();
			});
		}, 3000);
	});

	it('should stop replicating when we go offline', function(done) {
		$rootScope.$broadcast('state.online', 'state.offline', undefined);
		startDigesting();
		window.setTimeout(function() {
			eventsdb.count().then(function(count) {
				expect(count).toBe(5);
				expect(eventsdb.isStarted()).toBe(true);
				expect(favoritesdb.isStarted()).toBe(false);

				$rootScope.$broadcast('state.offline', 'state.online', undefined);
				window.setTimeout(function() {
					expect($rootScope.$broadcast).toHaveBeenCalledWith('eventsdb.sync.stopping');
					expect(eventsdb.isStarted()).toBe(false);
					expect(favoritesdb.isStarted()).toBe(false);
					done();
				}, 500);
			}, function(err) {
				console.debug('err=',err);
				expect(err).toBeUndefined();
				done();
			});
		}, 2000);
	});

	it('should replicate favorites when we log in and stop when we log out', function(done) {
		$rootScope.$broadcast('state.loggedin', 'state.loggedout', undefined);
		startDigesting();
		window.setTimeout(function() {
			favoritesdb.count().then(function(count) {
				expect(count).toBe(1);
				expect(eventsdb.isStarted()).toBe(false);
				expect(favoritesdb.isStarted()).toBe(true);

				$rootScope.$broadcast('state.loggedout', 'state.loggedin', undefined);
				window.setTimeout(function() {
					expect($rootScope.$broadcast).toHaveBeenCalledWith('favoritesdb.sync.stopping');
					expect(eventsdb.isStarted()).toBe(false);
					expect(favoritesdb.isStarted()).toBe(false);
					done();
				}, 500);
			}, function(err) {
				console.debug('err=',err);
				expect(err).toBeUndefined();
				done();
			});
		}, 2000);
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
