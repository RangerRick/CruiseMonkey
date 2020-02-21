require('../settings/Service');
require('../twitarr/Service');
require('../user/User');
require('../util/Photo');

angular.module('cruisemonkey.profile.Controller', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.Twitarr',
	'cruisemonkey.user.User',
	'cruisemonkey.util.Photo'
])
.controller('CMProfileCtrl', ($log, $q, $scope, $timeout, Photos, SettingsService, Twitarr, UserService) => {
	$log.info('Initializing CMProfileCtrl');

	$scope.p = Photos;
	$scope.lastUpdated;
	$scope.updateInfo = () => {
		return $q.all({
			twitarrRoot: SettingsService.getTwitarrRoot(),
			user: Twitarr.getUserInfo(UserService.getUsername())
		}).then((res) => {
			$scope.lastUpdated = new Date().getTime();
			$scope.twitarrRoot = res.twitarrRoot;
			$scope.user = angular.copy(res.user);
			$scope.origUser = angular.copy(res.user);
			return res.user;
		});
	};

	$scope.getImageUrl = () => {
		if ($scope.twitarrRoot && $scope.user && $scope.user.username) {
			return $scope.twitarrRoot + 'api/v2/user/photo/' + $scope.user.username + '?_x=' + $scope.lastUpdated;
		} else {
			return undefined;
		}
	};

	$scope.isModified = () => {
		return angular.toJson($scope.user) !== angular.toJson($scope.origUser);
	};

	$scope.save = () => {
		return Twitarr.setUserInfo($scope.user).then((newUser) => {
			$scope.user = angular.copy(newUser);
			$scope.origUser = angular.copy(newUser);
			return SettingsService.getTwitarrRoot().then((twitarrRoot) => {
				$scope.twitarrRoot = twitarrRoot;
				return $scope.user;
			});
		});
	};

	$scope.reset = (ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$scope.user = angular.copy($scope.origUser);
	};

	$scope.replaceImage = (ev) => {
		return Photos.activate(ev, true).then((photo) => {
			$log.debug('CMProfileCtrl.replaceImage: photo=' + photo);
			return $scope.updateInfo();
		}, (err) => {
			if (err) {
				$log.debug('CMProfileCtrl.replaceImage: error: ' + angular.toJson(err));
			} else {
				$log.debug('CMProfileCtrl.replaceImage: no photo.');
			}
			return $q.reject(err);
		}, (progress) => {
			$scope.photoUploading = progress;
		}).finally(() => {
			$timeout(() => {
				delete $scope.photoUploading;
			}, 200);
		});
	};

	$scope.$on('$ionicView.beforeEnter', $scope.updateInfo);

	$scope.$on('cruisemonkey.user.updated', (ev, newUser) => {
		$scope.user = angular.copy(newUser);
		$scope.origUser = angular.copy(newUser);
	});
})
;
