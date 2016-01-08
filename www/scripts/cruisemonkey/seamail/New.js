(function() {
	'use strict';

	angular.module('cruisemonkey.seamail.New', [
		'ionic',
	])
	.factory('NewSeamail', function($q, $rootScope, $log, $injector, $ionicModal, $ionicPopup) {
		var $scope = $rootScope.$new();
		$scope.modal = $q.defer();

		$ionicModal.fromTemplateUrl('scripts/cruisemonkey/seamail/new.html', {
			animation: 'slide-in-up',
			focusFirstInput: true,
			scope: $scope,
		}).then(function(modal) {
			$log.debug('New Seamail modal initialized.');

			$scope.closeModal = function() {
				modal.hide();
			};
			$scope.postSeamail = function(seamail, sendTo) {
				var message = angular.copy(seamail);
				if (sendTo) {
					message.users.push(sendTo);
				}
				console.log('postSeamail: seamail=' + angular.toJson(message));
				Twitarr.postSeamail(message).then(function() {
					modal.hide();
					$rootScope.$broadcast('cruisemonkey.notify.newSeamail', 1);
				}, function(err) {
					$ionicPopup.alert({
						title: 'Failed',
						template: 'Failed to post Seamail: ' + err[0]
					});
				});
			};

			$scope.modal.resolve(modal);
		});

		var openNewSeamail = function(sendTo) {
			if ($injector.has('UserDetail')) {
				var UserDetail = $injector.get('UserDetail');
				UserDetail.close();
			}
			$scope.newSeamail = { users: [] };
			$scope.sendTo = sendTo;
			$scope.modal.promise.then(function(modal) {
				modal.show();
			})
		};

		var closeNewSeamail = function() {
			$scope.modal.promise.then(function(modal) {
				modal.hide();
			});
		};

		$scope.$on('$destroy', function() {
			$scope.modal.promise.then(function(modal) {
				modal.remove();
			});
		});

		return {
			open: openNewSeamail,
			close: closeNewSeamail,
		};
	});
}());
