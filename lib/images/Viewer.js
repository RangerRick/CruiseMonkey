(function() {
	'use strict';

   require('./Cache');

	var viewerTemplate = require('ngtemplate!html!./viewer.html');

	angular.module('cruisemonkey.images.Viewer', [
		'ionic',
		'cruisemonkey.Settings',
		'cruisemonkey.images.Cache'
	]).factory('ImageViewer', function($log, $window, ImageCache, SettingsService) {
		$log.info('ImageViewer: Initializing.');

		var show = function(photoId, ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
				var url = twitarrRoot + 'photo/full/' + photoId;
				return ImageCache.getImage(url).then(function(cachedUrl) {
					if (typeof PhotoViewer !== 'undefined') {
						$window.resolveLocalFileSystemURL(cachedUrl, function success(entry) {
							PhotoViewer.show(entry.toURL());
						}, function failed(err) {
							$rootScope.$evalAsync(function() {
								$log.warn('Unable to convert ' + cachedUrl + ' to a native URL: ' + angular.toJson(err));
								PhotoViewer.show(url);
							});
						});
					} else {
						return $window.open(cachedUrl, '_blank');
					}
				});
			});
		};

		return {
			show: show
		}
	});

}());
