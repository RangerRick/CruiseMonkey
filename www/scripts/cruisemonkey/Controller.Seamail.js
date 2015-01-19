(function() {
	'use strict';

	/* global removeFromArray: true */

	angular.module('cruisemonkey.controllers.Seamail', [
		'cruisemonkey.Config',
		'cruisemonkey.Twitarr',
	])
	.directive('autoComplete',['Twitarr',function(Twitarr) {
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
				//console.log('additional user:',scope.additionalUser);

				scope.removeTag=function(index){
					scope.selectedUsers.splice(index,1);
				};

				scope.search=function(){
					Twitarr.getAutocompleteUsers(scope.searchText).then(function(users) {
						if (scope.additionalUser) {
							removeFromArray(users, scope.additionalUser.toLowerCase());
						}
						for (var i=0; i < scope.selectedUsers.length; i++) {
							removeFromArray(users, scope.selectedUsers[i]);
						}
						scope.suggestions=users;
						scope.selectedIndex = -1;
					});
				};

				scope.addToSelectedUsers=function(index){
					//console.log('addToSelectedUsers(' + index + ')');
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
	}])
	.controller('CMSeamailCtrl', ['$scope', '$timeout', '$interval', '$ionicLoading', '$ionicModal', '$ionicPopup', '$ionicScrollDelegate', 'Images', 'SettingsService', 'Twitarr', 'UserService', function($scope, $timeout, $interval, $ionicLoading, $ionicModal, $ionicPopup, $ionicScrollDelegate, Images, SettingsService, Twitarr, UserService) {
		console.log('CMSeamailCtrl Initializing.');

		$ionicModal.fromTemplateUrl('template/seamail-detail.html', {
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			modal.scope.closeModal = function() {
				modal.hide();
			};

			modal.scope.updateUserImages = function() {
				var twitarrRoot = SettingsService.getTwitarrRoot();
				var users = modal.scope.seamail.users.map(function(entry) {
					return entry.username;
				});
				Images.getAll(users.map(function(username) {
					return twitarrRoot + 'api/v2/user/photo/' + username;
				})).then(function(res) {
					for (var i=0; i < users.length; i++) {
						modal.scope.userImages[users[i]] = res[i];
					}
				});
			};

			modal.scope.refreshMessages = function() {
				var promise = Twitarr.getSeamailMessages(modal.scope.seamail.id);
				promise.then(function(res) {
					if (res.seamail && res.seamail.messages) {
						console.log('Refreshed messages:' + angular.toJson(res));
						modal.scope.seamail = res.seamail;
						modal.scope.updateUserImages();
					}
				});
				return promise;
			};
			modal.scope.postMessage = function() {
				console.log('posting seamail message:',modal.scope.newMessage.text);
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
			/*
			modal.scope.$watch('newMessage', function(newValue) {
				console.log('message text: ' + newValue.text);
			});
*/
			$scope.viewSeamailModal = modal;
		});

		$scope.$on('$destroy', function() {
			$scope.viewSeamailModal.remove();
		});

		$scope.userImages = [];

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('seamail').scrollTop(true);
		};

		$scope.doRefresh = function() {
			console.log('Refreshing seamail.');
			$scope.twitarrRoot = SettingsService.getTwitarrRoot();
			Twitarr.getSeamail().then(function(res) {
				if (res && res.seamail_meta) {
					var seen = {}, i, j, users = [];
					for (i=0; i < res.seamail_meta.length; i++) {
						for (j=0; j < res.seamail_meta[i].users.length; j++) {
							var username = res.seamail_meta[i].users[j].username;
							seen[username] = 1;
						}
					}
					for (var u in seen) {
						if (!$scope.userImages[u]) {
							users.push(u);
						}
					}
					Images.getAll(users.map(function(username) {
						return $scope.twitarrRoot + 'api/v2/user/photo/' + username;
					})).then(function(res) {
						for (i=0; i < users.length; i++) {
							$scope.userImages[users[i]] = res[i];
						}
					});
					$scope.seamails = res.seamail_meta;
				} else {
					$scope.seamails = [];
				}
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			}, function(err) {
				console.log('Failed to get seamail:',err);
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		var seamailInterval = null;
		$scope.openSeamail = function(seamail) {
			if (!seamail.messages) {
				seamail.messages = [];
			}
			$scope.viewSeamailModal.scope.userImages = [];
			$scope.viewSeamailModal.scope.user = UserService.get();
			$scope.viewSeamailModal.scope.seamail = seamail;
			$scope.viewSeamailModal.scope.twitarrRoot = SettingsService.getTwitarrRoot();

			$scope.viewSeamailModal.scope.refreshMessages().then(function() {
				$scope.viewSeamailModal.show();
				$scope.doRefresh();
			});
			seamailInterval = $interval(function() {
				$scope.viewSeamailModal.scope.refreshMessages();
			}, 10000);
		};

		$scope.$on('modal.hidden', function() {
			if (seamailInterval) {
				$interval.cancel(seamailInterval);
				seamailInterval = null;
			}
		});

		$scope.$on('cruisemonkey.notify.newSeamail', function(ev, count) {
			$scope.doRefresh();
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			if (!$scope.seamails) {
				$ionicLoading.show({template:'Loading...'});
			}
			$scope.doRefresh();
		});
	}]);
}());
