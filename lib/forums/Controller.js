require('../data/DB');

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
.controller('CMForumsCtrl', ($ionicLoading, $scope, ForumService, UserDetail) => {
	$scope.openUser = UserDetail.open;

	$scope.doRefresh = () => {
		return ForumService.list().then((forums) => {
			$scope.forums = forums;
		}).finally(() => {
			$ionicLoading.hide();
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.$on('$ionicView.beforeEnter', () => {
		$ionicLoading.show({
			template: 'Loading...',
			duration: 5000,
			noBackdrop: true
		});
		$scope.doRefresh();
	});
	$scope.$on('$ionicView.unloaded', () => {
		delete $scope.forums;
	});
})
.controller('CMForumCtrl', ($ionicLoading, $ionicScrollDelegate, $log, $q, $scope, $stateParams, ForumService, ImageViewer, kv, SettingsService, UserDetail) => {
	$scope.openUser = UserDetail.open;
	$scope.showImage = ImageViewer.show;

	kv.get('cruisemonkey.forum.')
	$scope.scrollTop = () => {
		$ionicScrollDelegate.$getByHandle('forum-scroll').scrollTop(true);
	};

	$scope.getDisplayName = (post) => {
		if (post.author.display_name && post.author.display_name !== post.author.name) {
			return post.author.display_name;
		} else {
			return '@' + post.author.username;
		}
	};

	$scope.getDisplayHandle = (post) => {
		if (post.author.display_name && post.author.display_name !== post.author.username) {
			return '(@' + post.author.username + ')';
		} else {
			return '';
		}
	};

	$scope.doRefresh = (page) => {
		SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			$scope.twitarrRoot = twitarrRoot;
		});

		const id = $stateParams.id;
		if (id) {
			return ForumService.get(id, page).then((forum) => {
				//$log.debug('got forum: ' + angular.toJson(forum));
				$scope.forum = forum;
			}).finally(() => {
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});
		} else {
			return $q.reject('No forum ID specified!');
		}
	};

	$scope.previousPage = () => {
		if ($scope.page > 0) {
			$scope.page--;
		}
	};

	$scope.nextPage = () => {
		$scope.page++;
	};

	$scope.$watch('page', (newPage) => {
		const id = $stateParams.id;
		if (id) {
			kv.set('cruisemonkey.forum.' + id + '.page', newPage);
		}
		$scope.doRefresh(newPage).then(() => {
			$scope.scrollTop();
		});
	});

	let firstLoad = true;
	$scope.$on('$ionicView.beforeEnter', () => {
		const id = $stateParams.id;
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
				kv.get('cruisemonkey.forum.' + id + '.page').then((page) => {
					$scope.page = page;
				}, () => {
					$scope.page = 0;
				});
			}
		}
	});
	$scope.$on('$ionicView.unloaded', () => {
		delete $scope.forum;
	});
})
;
