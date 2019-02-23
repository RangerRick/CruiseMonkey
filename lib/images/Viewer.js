(function() {
	'use strict';

   require('./Cache');

	var viewerTemplate = require('ngtemplate!html!./viewer.html');

	angular.module('cruisemonkey.images.Viewer', [
		'ionic',
		'cruisemonkey.Settings',
		'cruisemonkey.images.Cache'
	]).factory('ImageViewer', function($ionicLoading, $log, $q, $window, ImageCache, SettingsService) {
		$log.info('ImageViewer: Initializing.');

		var show = function(photoId, ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$ionicLoading.show({
				template: 'Loading image...',
				duration: 5000,
				noBackdrop: true
			});
			return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				var url = twitarrRoot + 'api/v2/photo/full/' + photoId;
				return ImageCache.getImage(url).then(function(cachedUrl) {
					if (typeof PhotoViewer !== 'undefined') {
						var deferred = $q.defer();
						$window.resolveLocalFileSystemURL(cachedUrl, function success(entry) {
							PhotoViewer.show(entry.toURL());
							deferred.resolve(true);
						}, function failed(err) {
							$rootScope.$evalAsync(function() {
								$log.warn('Unable to convert ' + cachedUrl + ' to a native URL: ' + angular.toJson(err));
								PhotoViewer.show(url);
								deferred.resolve(false);
							});
						});
						return deferred.promise;
					} else {
						return $window.open(cachedUrl, '_blank');
					}
				});
			}).finally(function() {
				$ionicLoading.hide();
			});
		};

		return {
			show: show
		}
	});

}());
