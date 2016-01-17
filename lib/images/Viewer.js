(function() {
	'use strict';

    var angular = require('angular');
	var viewerTemplate = require('ngtemplate!html!./viewer.html');

	angular.module('cruisemonkey.images.Viewer', [
		'ionic',
		'cruisemonkey.Settings'
	]).factory('ImageViewer', function($ionicModal, $log, $q, $rootScope, SettingsService) {
		$log.info('ImageViewer: Initializing.');

		var $scope = $rootScope.$new();
		$scope.modal = $q.defer();

		$ionicModal.fromTemplateUrl(viewerTemplate, {
			scope: $scope
		}).then(function(modal) {
			$scope.modal.resolve(modal);
		});

		var show = function(photoId) {
			$q.all({
				modal: $scope.modal.promise,
				twitarrRoot: SettingsService.getTwitarrRoot()
			}).then(function(p) {
				$scope.photoId = photoId;
				$scope.twitarrRoot = p.twitarrRoot;

				$log.debug('ImageViewer: photoId=' + photoId + ', twitarrRoot=' + p.twitarrRoot);
				p.modal.show();
			});
		};

		$scope.closeModal = function() {
			$scope.modal.promise.then(function(modal) {
				modal.hide().then(function() {
					delete $scope.twitarrRoot;
					delete $scope.photoId;
				});
			});
		};

		$scope.$on('$destroy', function() {
			$scope.closeModal();

			$scope.modal.promise.then(function(modal) {
				modal.remove();
				delete $scope.modal;
			});
		});

		return {
			show: show,
			hide: $scope.closeModal
		}
	});

}());
