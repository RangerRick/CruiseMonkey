(function() {
	'use strict';

	/*global StateMachine: true*/

	angular.module('cruisemonkey.State', [
		'cruisemonkey.Cordova',
		'cruisemonkey.User',
		'ngCordova'
	])
	.factory('StateService', ['$rootScope', '$timeout', 'CordovaService', 'UserService', '$cordovaNetwork', function($rootScope, $timeout, c, UserService, $cordovaNetwork) {
		console.info('StateService: Initializing.');

		var initWait = 5000;
		var fsm = StateMachine.create({
			initial: 'uninitialized',
			error: function(eventName, from, to, args, errorCode, errorMessage) {
				console.warn('StateService: event ' + eventName + ' failed: ' + from + ' -> ' + to + ' is illegal: ' + errorMessage);
			},
			events: [
				{ name: 'initialize', to: 'initialized', from: [
					'uninitialized'
				]},
				{ name: 'goOffline', to: 'offline', from: [
					'initialized',
					'online'
				]},
				{ name: 'goOnline', to: 'online', from: [
					'initialized',
					'offline'
				]},
				{ name: 'logOut', to: 'loggedout', from: [
					'online'
				]},
				{ name: 'logIn', to: 'loggedin', from: [
					'loggedout',
					'online'
				]}
			],
			callbacks: {
				oninitialized: function(event, from, to, isCordova) {
					console.info(event + ': ' + from + ' -> ' + to);
					$rootScope.$emit('state.initialized', from, to, isCordova);
					if (isCordova) {
						if ($cordovaNetwork.isOnline()) {
							fsm.goOnline(isCordova);
						} else {
							fsm.goOffline(isCordova);
						}
					} else {
						fsm.goOnline(isCordova);
					}
				},
				onoffline: function(event, from, to, data) {
					console.info(event + ': ' + from + ' -> ' + to);
					$rootScope.$emit('state.offline', from, to, data);
				},
				ononline: function(event, from, to, data) {
					console.info(event + ': ' + from + ' -> ' + to);
					$rootScope.$emit('state.online', from, to, data);
					if (UserService.loggedIn()) {
						fsm.logIn();
					} else {
						fsm.logOut();
					}
				},
				onloggedout: function(event, from, to, data) {
					console.info(event + ': ' + from + ' -> ' + to);
					$rootScope.$emit('state.loggedout', from, to, data);
				},
				onloggedin: function(event, from, to, data) {
					console.info(event + ': ' + from + ' -> ' + to);
					$rootScope.$emit('state.loggedin', from, to, data);
				}
			}
		});

		c.isCordova().then(function(isCordova) {
			fsm.initialize(isCordova);
		});

		return {
			currentState: function() {
				return fsm.current;
			},
			is: function(state) {
				return fsm.is(state);
			},
			loginSucceeded: function(username) {
				if (fsm.can('logIn')) {
					if (!username) {
						username = UserService.getUsername();
					}
					fsm.logIn(username);
					return true;
				} else {
					console.warn("Can't log in.  Current state is: " + fsm.current);
					return false;
				}
			},
			loginFailed: function() {
				if (fsm.can('logOut')) {
					fsm.logOut();
					return true;
				} else {
					console.warn("Can't log out.  Current state is: " + fsm.current);
					return false;
				}
			}
		};
	}]);
}());
