(function() {
	'use strict';

	/*global StateMachine: true*/
	/*global ionic: true*/

	angular.module('cruisemonkey.State', [
		'cruisemonkey.User',
		'ngCordova'
	])
	.factory('StateService', ['$rootScope', '$timeout', 'UserService', '$cordovaNetwork', function($rootScope, $timeout, UserService, $cordovaNetwork) {
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
					$rootScope.$broadcast('state.' + to, 'state.' + from, isCordova);
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
					$rootScope.$broadcast('state.' + to, 'state.' + from, data);
				},
				ononline: function(event, from, to, data) {
					console.info(event + ': ' + from + ' -> ' + to);
					$rootScope.$broadcast('state.' + to, 'state.' + from, data);
					if (UserService.loggedIn()) {
						fsm.logIn(UserService.getUsername());
					} else {
						fsm.logOut();
					}
				},
				onloggedout: function(event, from, to, data) {
					console.info(event + ': ' + from + ' -> ' + to);
					$rootScope.$broadcast('state.' + to, 'state.' + from, data);
				},
				onloggedin: function(event, from, to, username) {
					console.info(event + ': ' + from + ' -> ' + to + ', username=' + username);
					$rootScope.$broadcast('state.' + to, 'state.' + from, username);
				}
			}
		});

		fsm.initialize(ionic.Platform.isWebView());

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
