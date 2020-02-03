const seamailNewHtml = require('./new.html');

const uniqueUsers = (users) => {
	const seen = {};
	return users.filter((user) => {
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
.controller('NewSeamailCtrl', ($ionicPopup, $log, $rootScope, $scope, Twitarr) => {
	$log.debug('Initializing NewSeamailCtrl.');

	$scope.postSeamail = (ev, message) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		const newMessage = angular.copy(message);
		if (newMessage.users && !Array.isArray(newMessage.users)) {
			newMessage.users = [newMessage.users];
		}
		newMessage.users = uniqueUsers(newMessage.users);
		$log.debug('message=' + angular.toJson(newMessage));
		Twitarr.postSeamail(newMessage).then(() => {
			$scope.message = { users: [] };
			delete $scope.sendTo;
			$scope.closeModal();
			$rootScope.$broadcast('cruisemonkey.notify.newSeamail', 1);
			$rootScope.$broadcast('cruisemonkey.notify.refreshSeamails');
		}, (err) => {
			$ionicPopup.alert({
				title: 'Failed',
				template: 'Failed to post Seamail: ' + err[0]
			});
		});
	};

	$scope.message = { users: [] };
})
.factory('NewSeamail', ($injector, $ionicModal, $log, $q, $rootScope) => {
	const $scope = $rootScope.$new();
	$scope.modal = $q.defer();

	$ionicModal.fromTemplateUrl(seamailNewHtml, {
		animation: 'slide-in-up',
		focusFirstInput: true,
		scope: $scope
	}).then((modal) => {
		$log.debug('New Seamail modal initialized.');
		$scope.modal.resolve(modal);
	});

	$scope.closeModal = (ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$scope.modal.promise.then((modal) => {
			modal.hide().then(() => {
				delete $scope.sendTo;
			});
		});
	};

	const openNewSeamail = (sendTo, ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$scope.modal.promise.then((modal) => {
			if ($injector.has('UserDetail')) {
				const UserDetail = $injector.get('UserDetail');
				UserDetail.close();
			}

			modal.scope.message = { users: [] };
			if (sendTo) {
				modal.scope.sendTo = sendTo;
			} else {
				delete modal.scope.sendTo;
			}
			modal.show();
		});
	};

	const closeNewSeamail = () => {
		$scope.closeModal();
	};

	$scope.$on('$destroy', () => {
		$scope.modal.promise.then((modal) => {
			modal.remove();
		});
	});

	return {
		open: openNewSeamail,
		close: closeNewSeamail
	};
});
