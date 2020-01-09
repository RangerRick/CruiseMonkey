(function() {
	'use strict';

	var seamailNewHtml = require('./new.html');

	var uniqueUsers = function(users) {
		var seen = {};
		return users.filter(function(user) {
			if (user === undefined || user === null || seen[user]) {
				return false;
			}
			return seen[user] = true;
		});
	};

	angular.module('cruisemonkey.seamail.New', [
		'ionic',
		'cruisemonkey.Twitarr'
	])
	.controller('NewSeamailCtrl', function($ionicPopup, $log, $rootScope, $scope, Twitarr) {
		$log.debug('Initializing NewSeamailCtrl.');

		$scope.postSeamail = function(ev, message) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			var newMessage = angular.copy(message);
			if (newMessage.users && !Array.isArray(newMessage.users)) {
				newMessage.users = [newMessage.users];
			}
			newMessage.users = uniqueUsers(newMessage.users);
			$log.debug('message=' + angular.toJson(newMessage));
			Twitarr.postSeamail(newMessage).then(function() {
				$scope.message = {
					users: []
				};
				delete $scope.sendTo;
				$scope.closeModal();
				$rootScope.$broadcast('cruisemonkey.notify.newSeamail', 1);
				$rootScope.$broadcast('cruisemonkey.notify.refreshSeamails');
			}, function(err) {
				$ionicPopup.alert({
					title: 'Failed',
					template: 'Failed to post Seamail: ' + err[0]
				});
			});
		};

		$scope.message = {
			users: []
		};
	})
	.factory('NewSeamail', function($injector, $ionicModal, $log, $q, $rootScope) {
		var $scope = $rootScope.$new();
		$scope.modal = $q.defer();

		$ionicModal.fromTemplateUrl(seamailNewHtml, {
			animation: 'slide-in-up',
			focusFirstInput: true,
			scope: $scope
		}).then(function(modal) {
			$log.debug('New Seamail modal initialized.');
			$scope.modal.resolve(modal);
		});

		$scope.closeModal = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$scope.modal.promise.then(function(modal) {
				modal.hide().then(function() {
					delete $scope.sendTo;
				});
			});
		};

		var openNewSeamail = function(sendTo, ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$scope.modal.promise.then(function(modal) {
				if ($injector.has('UserDetail')) {
					var UserDetail = $injector.get('UserDetail');
					UserDetail.close();
				}

				modal.scope.message = {
					users: []
				};
				if (sendTo) {
					modal.scope.sendTo = sendTo;
				} else {
					delete modal.scope.sendTo;
				}
				modal.show();
			});
		};

		var closeNewSeamail = function() {
			$scope.closeModal();
		};

		$scope.$on('$destroy', function() {
			$scope.modal.promise.then(function(modal) {
				modal.remove();
			});
		});

		return {
			open: openNewSeamail,
			close: closeNewSeamail
		};
	});
}());
