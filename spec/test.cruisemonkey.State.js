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

describe('State Machine Tests', function() {
	'use strict';

	var StateService,
		CordovaService,
		$rootScope,
		$timeout;

	var isOnline = false,
		$cordovaNetwork = {
		isOnline: function() {
			return isOnline;
		}
	};

	var user = {};
	var UserService = {
		loggedIn: function() {
			if (user && user.loggedIn) {
				return true;
			}
			return false;
		},
		getUsername: function() {
			if (user.username) {
				return user.username.toLowerCase();
			}
			return undefined;
		}
	};

	beforeEach(function() {
		console.info('--------------------------------------------------------------------------------');
		jasmine.clock().install();
		angular.module('ngCordova', []);
		isOnline = false;
		user = {
			loggedIn: false
		};
	});

	beforeEach(module('cruisemonkey.Cordova'));
	beforeEach(module('cruisemonkey.State', function($provide) {
		$provide.value('$cordovaNetwork', $cordovaNetwork);
		$provide.value('UserService', UserService);
	}));

	beforeEach(function() {
		inject(function(_StateService_, _CordovaService_, _$rootScope_, _$timeout_) {
			StateService   = _StateService_;
			CordovaService = _CordovaService_;
			$rootScope     = _$rootScope_;
			$timeout       = _$timeout_;
		});
	});

	afterEach(function() {
		jasmine.clock().uninstall();
	});

	it('should initialize if Cordova is never ready', function() {
		spyOn($rootScope, '$emit');
		$timeout.flush(5000);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.initialized', 'uninitialized', 'initialized', false);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.online', 'initialized', 'online', false);
	});

	it('should initialize when Cordova is ready and online', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.initialized', 'uninitialized', 'initialized', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.online', 'initialized', 'online', true);
	});

	it('should initialize when Cordova is ready and offline', function() {
		spyOn($rootScope, '$emit');
		isOnline = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.initialized', 'uninitialized', 'initialized', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.offline', 'initialized', 'offline', true);
	});

	it('should be logged out by default', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.initialized', 'uninitialized', 'initialized', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.online', 'initialized', 'online', true);
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'online', 'loggedout', undefined);
	});

	it('should stay logged out if login fails', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'online', 'loggedout', undefined);
		StateService.loginFailed();
		expect($rootScope.$emit.calls.count()).toEqual(3); // [state.initialized, state.online, state.loggedout]
	});

	it('should switch to logged in if the user logs in and the username is in UserService', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'online', 'loggedout', undefined);
		user.username = 'ranger';
		StateService.loginSucceeded();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedin', 'loggedout', 'loggedin', 'ranger');
		expect($rootScope.$emit.calls.count()).toEqual(4); // [state.initialized, state.online, state.loggedout, state.loggedin]
	});

	it('should switch to logged in if the user logs in and the username is passed', function() {
		spyOn($rootScope, '$emit');
		isOnline = true;
		user.loggedIn = false;
		CordovaService.setCordova(true);
		$rootScope.$digest();
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedout', 'online', 'loggedout', undefined);
		StateService.loginSucceeded('ranger');
		expect($rootScope.$emit).toHaveBeenCalledWith('state.loggedin', 'loggedout', 'loggedin', 'ranger');
		expect($rootScope.$emit.calls.count()).toEqual(4); // [state.initialized, state.online, state.loggedout, state.loggedin]
	});

});