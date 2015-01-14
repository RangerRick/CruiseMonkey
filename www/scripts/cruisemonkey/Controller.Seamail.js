(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.Seamail', [
		'cruisemonkey.Config',
		'cruisemonkey.Twitarr',
	])
	.controller('CMSeamailCtrl', ['$scope', '$timeout', '$interval', '$ionicLoading', '$ionicModal', '$ionicScrollDelegate', 'SettingsService', 'Twitarr', 'UserService', function($scope, $timeout, $interval, $ionicLoading, $ionicModal, $ionicScrollDelegate, SettingsService, Twitarr, UserService) {
		console.log('CMSeamailCtrl Initializing.');

		$ionicModal.fromTemplateUrl('template/seamail-detail.html', {
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			modal.scope.closeModal = function() {
				modal.hide();
			};
			modal.scope.refreshMessages = function() {
				var promise = Twitarr.getSeamailMessages(modal.scope.seamail.id);
				promise.then(function(res) {
					if (res.seamail && res.seamail.messages) {
						console.log('Refreshed messages:',res);
						modal.scope.seamail = res.seamail;
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
					console.log('not posting message.');
				}
			};
			modal.scope.newMessage = { text: '' };
			modal.scope.$watch('newMessage', function(newValue) {
				console.log('message text: ' + newValue.text);
			});
			$scope.viewSeamailModal = modal;
		});

		$scope.$on('$destroy', function() {
			$scope.viewSeamailModal.remove();
		});

		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('seamail').scrollTop(true);
		};

		$scope.doRefresh = function() {
			console.log('do refresh');
			$scope.twitarrRoot = SettingsService.getTwitarrRoot();
			Twitarr.getSeamail().then(function(res) {
				if (res && res.seamail_meta) {
					$scope.seamails = res.seamail_meta;
				} else {
					$scope.seamails = [];
				}
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			}, function(err) {
				console.log('Failed to get seamail:',err);
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		var seamailInterval = null;
		$scope.openSeamail = function(seamail) {
			if (!seamail.messages) {
				seamail.messages = [];
			}
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
