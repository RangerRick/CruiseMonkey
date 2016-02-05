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
				ImageCache.getImage(url).then(function(cachedUrl) {
					if (typeof PhotoViewer !== 'undefined') {
						PhotoViewer.show(url);
					} else {
						$window.open(url, '_blank');
					}
				});
			});
		};

		return {
			show: show
		}
	});

}());
