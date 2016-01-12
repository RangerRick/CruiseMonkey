(function() {
	'use strict';

	var angular = require('angular'),
		ionic = require('ionic');

	require('../array-monkeypatch');

	angular.module('cruisemonkey.seamail.Controller', [
		'cruisemonkey.Config',
		'cruisemonkey.Twitarr',
		'cruisemonkey.seamail.New',
		'cruisemonkey.seamail.Service',
	])
	.directive('autoComplete',function($log, Twitarr) {
		return {
			restrict:'AE',
			scope:{
				selectedUsers:'=model',
				additionalUser:'='
			},
			templateUrl:'template/autocomplete-template.html',
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
	.controller('CMSeamailCtrl', function($q, $scope, $interval, $log, $timeout, $ionicLoading, $ionicModal, $ionicPopup, $ionicScrollDelegate, NewSeamail, SeamailService, SettingsService, Twitarr, UserService, seamails) {
		$log.info('CMSeamailCtrl Initializing.');

		$scope.seamails = seamails;
		$scope.unread = 3;

		$ionicModal.fromTemplateUrl('scripts/cruisemonkey/seamail/seamail.html', {
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			modal.scope.closeModal = function() {
				modal.hide();
			};

			modal.scope.refreshMessages = function() {
				return Twitarr.getSeamailMessages(modal.scope.seamail.id).then(function(res) {
					if (res.seamail && res.seamail.messages) {
						modal.scope.seamail = res.seamail;
					}
					return res;
				});
			};

			modal.scope.postMessage = function() {
				$log.debug('posting seamail message: ' + angular.toJson(modal.scope.newMessage.text));
				if (modal.scope.newMessage && modal.scope.newMessage.text && modal.scope.newMessage.text !== '') {
					Twitarr.postSeamailMessage(modal.scope.seamail.id, modal.scope.newMessage.text).then(function() {
						modal.scope.newMessage.text = '';
						modal.scope.refreshMessages();
					});
				} else {
					$ionicPopup.alert({
						title: 'Invalid Message',
						template: 'Please enter something to post. ;)'
					});
				}
			};
			modal.scope.newMessage = { text: '' };
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

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('seamail').scrollTop(true);
		};

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
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		var seamailInterval;
		$scope.openSeamail = function(seamail) {
			if (!seamail.messages) {
				seamail.messages = [];
			}
			SettingsService.getTwitarrRoot().then(function(tr) {
				$scope.viewSeamailModal.scope.twitarrRoot = tr;
			});
			$scope.viewSeamailModal.scope.user = UserService.get();
			$scope.viewSeamailModal.scope.seamail = seamail;

			seamailInterval = $interval(function() {
				$scope.viewSeamailModal.scope.refreshMessages();
			}, 10000);

			$scope.viewSeamailModal.scope.refreshMessages().then(function() {
				$scope.viewSeamailModal.show();
				$scope.doRefresh();
			});
		};

		$scope.newSeamail = function() {
			NewSeamail.open();
		};

		$scope.$on('modal.hidden', function() {
			if (seamailInterval) {
				$interval.cancel(seamailInterval);
				seamailInterval = undefined;
			}
			updateUnread();
		});

		$scope.$on('cruisemonkey.notify.newSeamail', function(ev, count) {
			$scope.unread = count;
			$scope.doRefresh();
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			if (!$scope.seamails) {
				$ionicLoading.show({template:'Loading...'});
			}
			$scope.doRefresh();
		});
	});
}());
