(function() {
	'use strict';

	require('../polyfills/Array');
	require('../images/Cache');
	var hashFunc = require('string-hash/index');

	var autocompleteTemplate = require('ngtemplate!html!./autocomplete-template.html');
	var seamailTemplate = require('ngtemplate!html!./seamail.html');
	var userListTemplate = require('ngtemplate!html!./user-list.html');

	angular.module('cruisemonkey.seamail.Controller', [
		'cruisemonkey.Config',
		'cruisemonkey.Twitarr',
		'cruisemonkey.images.Cache',
		'cruisemonkey.seamail.New',
		'cruisemonkey.seamail.Service'
	])
	.directive('autoComplete',function($log, Twitarr) {
		return {
			restrict:'AE',
			scope:{
				selectedUsers:'=model',
				additionalUser:'='
			},
			templateUrl:autocompleteTemplate,
			link:function(scope,elem,attrs){
				scope.suggestions=[];
				scope.selectedUsers=[];
				scope.selectedIndex=-1;
				//$log.debug('additional user: ' + angular.toJson(scope.additionalUser));

				scope.removeTag=function(ev, index){
					if (ev) {
						ev.preventDefault();
						ev.stopPropagation();
					}
					scope.selectedUsers.splice(index,1);
				};

				scope.search=function(){
					Twitarr.getAutocompleteUsers(scope.searchText).then(function(users) {
						if (scope.additionalUser) {
							users.remove(scope.additionalUser.toLowerCase());
						}
						for (var i=0; i < scope.selectedUsers.length; i++) {
							users.remove(scope.selectedUsers[i]);
						}
						scope.suggestions=users;
						scope.selectedIndex = -1;
					});
				};

				scope.addToSelectedUsers=function(index){
					//$log.debug('addToSelectedUsers(' + index + ')');
					if(scope.selectedUsers.indexOf(scope.suggestions[index])===-1){
						scope.selectedUsers.push(scope.suggestions[index]);
						scope.searchText='';
						scope.suggestions=[];
					}
				};

				scope.checkKeyDown=function(event){
					if(event.keyCode===40){
						event.preventDefault();
						if(scope.selectedIndex+1 !== scope.suggestions.length){
							scope.selectedIndex++;
						}
					}
					else if(event.keyCode===38){
						event.preventDefault();
						if(scope.selectedIndex-1 !== -1){
							scope.selectedIndex--;
						}
					}
					else if(event.keyCode===13){
						scope.addToSelectedUsers(scope.selectedIndex);
					}
				};

				scope.$watch('selectedIndex',function(val){
					if(val!==-1) {
						scope.searchText = scope.suggestions[scope.selectedIndex];
					}
				});
			}
		};
	})
	.controller('CMSeamailUserListCtrl', function($log, $scope) {
		$scope.userList = {
			closed: true
		};

		if ($scope.listView === undefined) {
			$scope.listView = false;
		}

		$scope.toggle = function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			$scope.userList.closed = !$scope.userList.closed;
		};
	})
	.controller('CMSeamailCtrl', function($interval, $ionicPopover, $ionicPopup, $ionicScrollDelegate, $log, $q, $scope, $stateParams, SettingsService, Twitarr, UserService) {
		$log.info('CMSeamailCtrl Initializing.');

		$scope.userListTemplate = userListTemplate;
		$scope.user = UserService.get();
		$scope.seamail = undefined;
		$scope.newMessage = { text: undefined };

		$scope.postMessage = function() {
			$scope.user = UserService.get();
			if (!$scope.user.loggedIn) {
				$log.debug('Can\'t post message while not logged in!');
				$ionicPopup.alert({
					title: 'Not Logged In',
					template: 'You must be logged in to post a seamail.'
				});
				return;
			}

			$log.debug('posting seamail message: ' + angular.toJson($scope.newMessage.text));
			if ($scope.newMessage && $scope.newMessage.text && $scope.newMessage.text !== '') {
				Twitarr.postSeamailMessage($scope.seamail.id, $scope.newMessage.text).then(function() {
					$scope.newMessage = { text: undefined };
					$scope.doRefresh();
				});
			} else {
				$ionicPopup.alert({
					title: 'Invalid Message',
					template: 'Please enter something to post. ;)'
				});
			}
		};

		var popover = $ionicPopover.fromTemplate('<ion-popover-view class="fit seamail"><span ng-include="userListTemplate"></span></ion-popover-view>', {
			scope: $scope
		});
		popover.scope.listView = true;

		$scope.openUserList = function(ev) {
			popover.show(ev);
		};

		$scope.doRefresh = function() {
			if (!UserService.loggedIn()) {
				$log.info('CMSeamailCtrl.doRefresh(): not logged in');
				stopRefresh();
				$scope.seamail = undefined;
				$scope.$broadcast('scroll.refreshComplete');
				return $q.when();
			}
			$log.info('CMSeamailCtrl.doRefresh()');
			$scope.user = UserService.get();
			return Twitarr.getSeamailMessages($stateParams.id).then(function(res) {
				if (res.seamail && res.seamail.messages) {
					res.seamail.messages = res.seamail.messages.reverse();
					$scope.seamail = res.seamail;
					//$log.debug('seamail=' + angular.toJson($scope.seamail));
					$scope.$broadcast('scroll.refreshComplete');
					$ionicScrollDelegate.$getByHandle('seamail').scrollBottom();
				}
				return res;
			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
				$scope.$broadcast('cruisemonkey.notify.refreshSeamails');
			});
		};

		var interval, inView = false;
		var startRefresh = function() {
			//$log.warn('CMSeamilCtrl.startRefresh()');
			if (inView && !interval) {
				$scope.doRefresh().then(function() {
					SettingsService.getBackgroundInterval().then(function(bgi) {
						//$log.warn('bgi='+bgi);
						interval = $interval($scope.doRefresh, bgi * 1000);
					});
				});
			}
		};

		var stopRefresh = function() {
			if (interval) {
				$interval.cancel(interval);
				interval = undefined;
			}
		};

		$scope.$on('cruisemonkey.user.updated', $scope.doRefresh);

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			inView = true;
			startRefresh();
		});
		$scope.$on('$ionicView.beforeLeave', function(ev, info) {
			stopRefresh();
			inView = false;
		});
		$scope.$on('cruisemonkey.app.paused', stopRefresh);
		$scope.$on('cruisemonkey.app.locked', stopRefresh);
		$scope.$on('cruisemonkey.app.resumed', startRefresh);
	})
	.controller('CMSeamailsCtrl', function($interval, $ionicLoading, $ionicModal, $ionicPopup, $ionicScrollDelegate, $log, $q, $rootScope, $scope, $timeout, NewSeamail, SeamailService, SettingsService, Twitarr, UserService) {
		$log.info('CMSeamailsCtrl Initializing.');

		$scope.userListTemplate = userListTemplate;
		$scope.user = UserService.get();
		$scope.unread = 0;

		var updateUnread = function() {
			if (!$scope.seamails) {
				return;
			}
			var count = 0;
			for (var s=0, len=$scope.seamails.length, seamail; s < len; s++) {
				seamail = $scope.seamails[s];
				if (seamail.is_unread) {
					count++;
				}
			}
			$scope.unread = count;
			$rootScope.$broadcast('cruisemonkey.notify.tabs.showSeamails', count > 0);
		};
		updateUnread();

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('seamails').scrollTop();
		};

		$scope.doRefresh = function() {
			if (!UserService.loggedIn()) {
				$log.info('CMSeamailsCtrl.doRefresh(): not logged in');
				stopRefresh();
				$scope.seamail = [];
				$scope.$broadcast('scroll.refreshComplete');
				return;
			}
			$log.info('CMSeamailsCtrl.doRefresh()');
			$scope.user = UserService.get();
			$q.all({
				twitarrRoot: SettingsService.getTwitarrRoot(),
				seamails: SeamailService.list()
			}).then(function(res) {
				$scope.twitarrRoot = res.twitarrRoot;
				$scope.seamails = res.seamails;
			}, function(err) {
				$log.error('Failed to get seamails: ' + angular.toJson(err));
				return $q.reject(err);
			}).finally(function() {
				updateUnread();
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		$scope.newSeamail = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			NewSeamail.open();
		};

		$scope.$on('modal.hidden', function() {
			updateUnread();
		});

		var interval, inView = false;
		var startRefresh = function() {
			//$log.warn('CMSeamailsCtrl.startRefresh()');
			if (inView) {
				$scope.doRefresh();
				SettingsService.getBackgroundInterval().then(function(bgi) {
					//$log.warn('bgi='+bgi);
					interval = $interval($scope.doRefresh, bgi * 1000);
				});
			}
		};

		var stopRefresh = function() {
			if (interval) {
				$interval.cancel(interval);
				interval = undefined;
			}
		};

		/*
		$scope.$on('cruisemonkey.notify.newSeamail', function(ev, count) {
			$scope.doRefresh();
		});
		*/
		$scope.$on('cruisemonkey.notify.refreshSeamails', function() {
			$scope.doRefresh();
		});

		$scope.$on('cruisemonkey.user.updated', function(ev, user) {
			$scope.doRefresh(user);
		});
		$rootScope.$on('cruisemonkey.wipe-cache', function() {
			$scope.doRefresh();
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			inView = true;
			if (!$scope.seamails || $scope.seamails.length === 0) {
				$ionicLoading.show({
					template: 'Loading...',
					duration: 5000,
					noBackdrop: true
				});
			}
			startRefresh();
		});
		$scope.$on('$ionicView.beforeLeave', function(ev, info) {
			stopRefresh();
			inView = false;
		});
		$scope.$on('cruisemonkey.app.paused', stopRefresh);
		$scope.$on('cruisemonkey.app.locked', stopRefresh);
		$scope.$on('cruisemonkey.app.resumed', startRefresh);
	});
}());
