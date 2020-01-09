require('../data/DB');

(function() {
	'use strict';

	require('ion-sticky');

	require('../images/Cache');
	require('../images/Viewer');
	require('../settings/Service');
	require('./Service');

	angular.module('cruisemonkey.forums.Controller', [
		'ion-sticky',
		'cruisemonkey.DB',
		'cruisemonkey.Settings',
		'cruisemonkey.Twitarr',
		'cruisemonkey.forums.Service',
		'cruisemonkey.images.Cache',
		'cruisemonkey.user.Detail'
	])
	.controller('CMForumsCtrl', function($ionicLoading, $log, $scope, ForumService, UserDetail) {
		$scope.openUser = UserDetail.open;

		$scope.doRefresh = function() {
			return ForumService.list().then(function(forums) {
				$scope.forums = forums;
			}).finally(function() {
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		$scope.$on('$ionicView.beforeEnter', function() {
			$ionicLoading.show({
				template: 'Loading...',
				duration: 5000,
				noBackdrop: true
			});
			$scope.doRefresh();
		});
		$scope.$on('$ionicView.unloaded', function() {
			delete $scope.forums;
		});
	})
	.controller('CMForumCtrl', function($ionicLoading, $ionicScrollDelegate, $log, $q, $scope, $stateParams, ForumService, ImageViewer, kv, SettingsService, UserDetail) {
		$scope.openUser = UserDetail.open;
		$scope.showImage = ImageViewer.show;

		kv.get('cruisemonkey.forum.')
		$scope.scrollTop = function() {
			$ionicScrollDelegate.$getByHandle('forum-scroll').scrollTop(true);
		};

		$scope.getDisplayName = function(post) {
			if (post.author.display_name && post.author.display_name !== post.author.name) {
				return post.author.display_name;
			} else {
				return '@' + post.author.username;
			}
		};

		$scope.getDisplayHandle = function(post) {
			if (post.author.display_name && post.author.display_name !== post.author.username) {
				return '(@' + post.author.username + ')';
			} else {
				return '';
			}
		};

		$scope.doRefresh = function(page) {
			SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				$scope.twitarrRoot = twitarrRoot;
			});

			var id = $stateParams.id;
			if (id) {
				return ForumService.get(id, page).then(function(forum) {
					//$log.debug('got forum: ' + angular.toJson(forum));
					$scope.forum = forum;
				}).finally(function() {
					$ionicLoading.hide();
					$scope.$broadcast('scroll.refreshComplete');
				});
			} else {
				return $q.reject('No forum ID specified!');
			}
		};

		$scope.previousPage = function() {
			if ($scope.page > 0) {
				$scope.page--;
			}
		};

		$scope.nextPage = function() {
			$scope.page++;
		};

		$scope.$watch('page', function(newPage) {
			var id = $stateParams.id;
			if (id) {
				kv.set('cruisemonkey.forum.' + id + '.page', newPage);
			}
			$scope.doRefresh(newPage).then(function() {
				$scope.scrollTop();
			});
		});

		var firstLoad = true;
		$scope.$on('$ionicView.beforeEnter', function() {
			var id = $stateParams.id;
			if (firstLoad) {
				firstLoad = false;
				$ionicLoading.show({
					template: 'Loading...',
					duration: 5000,
					noBackdrop: true
				});
			}
			if ($scope.page === undefined || $scope.page === null) {
				if (id) {
					kv.get('cruisemonkey.forum.' + id + '.page').then(function(page) {
						$scope.page = page;
					}, function() {
						$scope.page = 0;
					});
				}
			}
		});
		$scope.$on('$ionicView.unloaded', function() {
			delete $scope.forum;
		});
	})
	;
}());
