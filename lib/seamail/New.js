(function() {
	'use strict';

	var seamailNewHtml = require('ngtemplate!html!./new.html');

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
			if ($scope.sendTo && !message.users.indexOf($scope.sendTo) >= 0) {
				message.users.push($scope.sendTo);
			}
			$log.debug('message=' + angular.toJson(message));
			Twitarr.postSeamail(message).then(function() {
				$scope.closeModal();
				$rootScope.$broadcast('cruisemonkey.notify.newSeamail', 1);
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
		/*
		if ($scope.sendTo) {
			$scope.message.users.push($scope.sendTo);
		}
		*/
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
