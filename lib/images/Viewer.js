import { Plugins } from '@capacitor/core';
const { Browser } = Plugins;

	require('./Cache');

angular.module('cruisemonkey.images.Viewer', [
	'ionic',
	'cruisemonkey.Settings',
	'cruisemonkey.images.Cache'
]).factory('ImageViewer', ($ionicLoading, $log, $q, $rootScope, $window, ImageCache, SettingsService) => {
	$log.info('ImageViewer: Initializing.');

	const show = (photoId, ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$ionicLoading.show({
			template: 'Loading image...',
			duration: 5000,
			noBackdrop: true
		});
		return SettingsService.getTwitarrRoot().then((twitarrRoot) => {
			const url = twitarrRoot + 'api/v2/photo/full/' + photoId;
			return ImageCache.getImage(url).then((cachedUrl) => {
				if (typeof PhotoViewer !== 'undefined') {
					const deferred = $q.defer();
					$window.resolveLocalFileSystemURL(cachedUrl, function success(entry) {
						PhotoViewer.show(entry.toURL());
						deferred.resolve(true);
					}, function failed(err) {
						$rootScope.$evalAsync(() => {
							$log.warn('Unable to convert ' + cachedUrl + ' to a native URL: ' + angular.toJson(err));
							PhotoViewer.show(url);
							deferred.resolve(false);
						});
					});
					return deferred.promise;
				} else {
					return Browser.open({
						url: cachedUrl,
						windowName: '_blank',
					});
				}
			});
		}).finally(() => {
			$ionicLoading.hide();
		});
	};

	return { show: show }
});
