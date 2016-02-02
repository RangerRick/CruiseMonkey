(function() {
	'use strict';

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
	.controller('CMProfileCtrl', function($ionicPopup, $log, $q, $scope, Photos, SettingsService, Twitarr, UserService) {
		$log.info('Initializing CMProfileCtrl');

		$scope.p = Photos;
		$scope.lastUpdated;
		$scope.updateInfo = function() {
			return $q.all({
				twitarrRoot: SettingsService.getTwitarrRoot(),
				user: Twitarr.getUserInfo(UserService.getUsername())
			}).then(function(res) {
				$scope.lastUpdated = new Date().getTime();
				$scope.twitarrRoot = res.twitarrRoot;
				$scope.user = angular.copy(res.user);
				$scope.origUser = angular.copy(res.user);
				return res.user;
			});
		};

		$scope.getImageUrl = function() {
			if ($scope.twitarrRoot && $scope.user && $scope.user.username) {
				return $scope.twitarrRoot + 'api/v2/user/photo/' + $scope.user.username + '?_x=' + $scope.lastUpdated;
			} else {
				return undefined;
			}
		};

		$scope.isModified = function() {
			return angular.toJson($scope.user) !== angular.toJson($scope.origUser);
		};

		$scope.save = function() {
			return Twitarr.setUserInfo($scope.user).then(function(newUser) {
				$scope.user = angular.copy(newUser);
				$scope.origUser = angular.copy(newUser);
				return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
					$scope.twitarrRoot = twitarrRoot;
					return $scope.user;
				});
			});
		};

		$scope.reset = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$scope.user = angular.copy($scope.origUser);
		};

		$scope.replaceImage = function(ev) {
			return Photos.activate(ev, true).then(function(photo) {
				$log.debug('CMProfileCtrl.replaceImage: photo=' + photo);
				return $scope.updateInfo();
			}, function(err) {
				if (err) {
					$log.debug('CMProfileCtrl.replaceImage: error: ' + angular.toJson(err));
				} else {
					$log.debug('CMProfileCtrl.replaceImage: no photo.');
				}
				return $q.reject(err);
			}, function(progress) {
				$scope.photoUploading = progress;
			}).finally(function() {
				delete $scope.photoUploading;
			});
		};

		$scope.$on('$ionicView.beforeEnter', $scope.updateInfo);
		UserService.onUserChanged(function(newUser) {
			$scope.user = angular.copy(newUser);
			$scope.origUser = angular.copy(newUser);
		});
	})
	;
}());
