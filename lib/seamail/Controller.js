(function() {
	'use strict';

	var angular = require('angular');

	require('../util/array-monkeypatch');

	var autocompleteTemplate = require('ngtemplate!html!./autocomplete-template.html');
	var seamailTemplate = require('ngtemplate!html!./seamail.html');

	angular.module('cruisemonkey.seamail.Controller', [
		'cruisemonkey.Config',
		'cruisemonkey.Twitarr',
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

				scope.removeTag=function(index){
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
	.controller('CMSeamailCtrl', function($interval, $ionicPopup, $log, $scope, seamail, SettingsService, Twitarr, UserService) {
		$log.info('CMSeamailCtrl Initializing.');

		$scope.user = UserService.get();
		$scope.seamail = seamail.seamail;
		$scope.newMessage = { text: undefined };
		$log.debug('seamail = ' + angular.toJson(seamail));

		$scope.postMessage = function() {
			$log.debug('posting seamail message: ' + angular.toJson($scope.newMessage.text));
			if ($scope.newMessage && $scope.newMessage.text && $scope.newMessage.text !== '') {
				Twitarr.postSeamailMessage($scope.seamail.id, $scope.newMessage.text).then(function() {
					$scope.newMessage.text = undefined;
					$scope.refreshMessages();
				});
			} else {
				$ionicPopup.alert({
					title: 'Invalid Message',
					template: 'Please enter something to post. ;)'
				});
			}
		};

		$scope.refreshMessages = function() {
			return Twitarr.getSeamailMessages($scope.seamail.id).then(function(res) {
				if (res.seamail && res.seamail.messages) {
					$scope.seamail = res.seamail;
				}
				return res;
			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		var interval, inView = false;
		var startRefresh = function() {
			if (inView) {
				SettingsService.getBackgroundInterval().then(function(bgi) {
					interval = $interval($scope.refreshMessages, bgi * 1000);
				});
			}
		};

		var stopRefresh = function() {
			if (interval) {
				$interval.cancel(interval);
				interval = undefined;
			}
		};

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
	.controller('CMSeamailsCtrl', function($q, $scope, $interval, $log, $timeout, $ionicModal, $ionicPopup, $ionicScrollDelegate, NewSeamail, SeamailService, SettingsService, Twitarr, UserService, seamails) {
		$log.info('CMSeamailsCtrl Initializing.');

		$scope.seamails = seamails;
		$scope.unread = 3;

		$ionicModal.fromTemplateUrl(seamailTemplate, {
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			modal.scope.closeModal = function() {
				modal.hide();
			};
			$scope.viewSeamailModal = modal;
		});

		$scope.$on('$destroy', function() {
			$scope.viewSeamailModal.remove();
		});

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
		};
		updateUnread();

		$scope.doRefresh = function() {
			$log.info('Refreshing seamail.');
			SettingsService.getTwitarrRoot().then(function(tr) {
				$scope.twitarrRoot = tr;
			});
			return SeamailService.list().then(function(seamails) {
				$scope.seamails = seamails;
			}, function(err) {
				$log.error('Failed to get seamails: ' + angular.toJson(err));
				return $q.reject(err);
			}).finally(function() {
				updateUnread();
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		$scope.newSeamail = function() {
			NewSeamail.open();
		};

		$scope.$on('modal.hidden', function() {
			updateUnread();
		});

		$scope.$on('cruisemonkey.notify.newSeamail', function(ev, count) {
			$scope.unread = count;
			$scope.doRefresh();
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			$scope.doRefresh();
		});
	});
}());
