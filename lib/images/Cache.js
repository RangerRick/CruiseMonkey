const datetime = require('../util/datetime');

require('../util/HTTP');
require('../cordova/Initializer');

require('ng-cordova');

angular.module('cruisemonkey.images.Cache', [
	'ngCordova',
	'ionic',
	'cruisemonkey.Initializer'
])
.directive('cmCache', function(ImageCache) {
	return {
		restrict: 'A',
		scope: {
			imgSrc: '@',
			imgBackground: '@'
		},
		link: (scope, el, attrs) => {
			const doSet = (type, url) => {
				if (type === 'background') {
					el.css({'background-image': 'url(' + url + ')'});
				} else {
					el.attr('src', url);
				}
			};

			const setImage = (type, src) => {
				ImageCache.getImage(src).then(function(dest) {
					doSet(type, dest);
				}, () => {
					doSet(type, src);
				});
			};

			attrs.$observe('imgSrc', function(src) {
				setImage('src', src);
			});
			attrs.$observe('imgBackground', function(src) {
				setImage('background', src);
			});
		}
	};
})
.factory('ImageCache', ($cordovaFileTransfer, $log, $q, $rootScope, $window, Cordova) => {
	const keepFor = datetime.moment.duration(1, 'day');
	const reloadIn = datetime.moment.duration(1, 'hour');

	let ready = $q.defer();
	let getImage, localCache;

	const resolvePath = (path) => {
		return Cordova.inCordova().then(() => {
			const deferred = $q.defer();
			$window.resolveLocalFileSystemURL(path, (entry) => {
				$rootScope.$evalAsync(function() {
					deferred.resolve(entry);
				});
			}, (err) => {
				$rootScope.$evalAsync(function() {
					deferred.reject(err);
				});
			});
			return deferred.promise;
		}, (/* err */) => {
			return path;
		});
	};

	const getMetadata = (file) => {
		const deferred = $q.defer();
		file.getMetadata((md) => {
			$rootScope.$evalAsync(function() {
				deferred.resolve(md);
			});
		}, (err) => {
			$rootScope.$evalAsync(function() {
				deferred.reject(err);
			});
		});
		return deferred.promise;
	};

	const listFiles = () => {
		//$log.debug('ImageCache.listFiles(): ' + localCache);
		return resolvePath(localCache).then((dirEntry) => {
			//$log.debug('ImageCache.listFiles(): resolved path: ' + dirEntry.toInternalURL());
			const deferred = $q.defer();

			const reader = dirEntry.createReader();
			reader.readEntries((entries) => {
				$rootScope.$evalAsync(() => {
					deferred.resolve(entries);
				});
			}, (err) => {
				$rootScope.$evalAsync(() => {
					deferred.reject(err);
				});
			});

			return deferred.promise;
		});
	};

	const removeFile = (file) => {
		const deferred = $q.defer();
		file.remove((res) => {
			$rootScope.$evalAsync(() => {
				$log.debug('ImageCache.removeFile(): ' + file.name + ' removed.');
				deferred.resolve(res);
			});
		}, (err) => {
			$rootScope.$evalAsync(() => {
				$log.warn('ImageCache.removeFile(): ' + file.name + ' NOT removed.');
				deferred.reject(err);
			});
		});
		return deferred.promise;
	};

	const isOlderThan = (file, compareTo) => {
		return getMetadata(file).then((md) => {
			const lastModified = datetime.create(md.modificationTime);
			const ago = datetime.create().subtract(compareTo);
			return lastModified.isBefore(ago);
		}, (err) => {
			$log.error('ImageCache.isOlderThan: unable to get metadata for ' + file.name);
			return $q.reject(err);
		});
	};

	const removeIfOld = (file) => {
		return isOlderThan(file, keepFor).then((res) => {
			if (res) {
				$log.debug('ImageCache.removeIfOld: ' + file.name + ' is stale.  Removing.');
				return removeFile(file);
			} else {
				return false;
			}
		});
	};

	const wipeCache = () => {
		Cordova.inCordova().then(() => {
			$log.info('ImageCache.wipeCache(): Wiping cache of images.');
			const oldReady = ready;
			ready = $q.defer();

			listFiles().then((files) => {
				//$log.debug('Existing files: ' + angular.toJson(files));
				const promises = files.map((file) => removeFile(file));
				return $q.all(promises);
			}, (err) => {
				$log.error('Failed to list files: ' + angular.toJson(err));
				return $q.reject(err);
			}).finally(() => {
				oldReady.resolve(getImage);
				ready.resolve(getImage);
			});

			return ready.promise;
		}, (/* err */) => {
			return ready.promise;
		});
	};

	const cleanCache = () => {
		Cordova.inCordova().then(() => {
			$log.info('ImageCache.cleanCache(): Cleaning cache of images older than ' + keepFor.humanize() + '.');
			const oldReady = ready;
			ready = $q.defer();

			listFiles().then((files) => {
				//$log.debug('Existing files: ' + angular.toJson(files));
				const promises = files.map((file) => removeIfOld(file));
				return $q.all(promises);
			}, (err) => {
				$log.error('Failed to list files: ' + angular.toJson(err));
				return $q.reject(err);
			}).finally(() => {
				oldReady.resolve(getImage);
				ready.resolve(getImage);
			});

			return ready.promise;
		}, (/* err */) => {
			return ready.promise;
		});
	};

	const getLocalPathForUrl = (url) => {
		return localCache + '/' + btoa(url);
	};

	const downloadUrl = (url) => {
		const path = getLocalPathForUrl(url);

		return $cordovaFileTransfer.download(url, path, {
			headers: {
				Accept: 'image/*'
			}
		}, true).then((res) => {
			const newUrl = res.toInternalURL();
			$log.debug('ImageCache.downloadUrl: saved to cache: ' + newUrl);
			return newUrl;
		}, (err) => {
			$log.warn('ImageCache.downloadUrl: download failure: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const getImageCordova = (url) => {
		const path = getLocalPathForUrl(url);
		const deferred = $q.defer();

		const onError = function(err) {
			$log.warn('ImageCache.getImageCordova: Error: ' + angular.toJson(err));
			// failed to download, fall through to the original URL
			deferred.resolve(url);
		};

		resolvePath(path).then((fileEntry) => {
			//$log.debug('ImageCache.getImageCordova: found in cache: ' + path);
			//$log.debug('ImageCache.getImageCordova: returning: ' + fileEntry.toInternalURL());
			return isOlderThan(fileEntry, reloadIn).then((older) => {
				if (older) {
					$log.debug('ImageCache.getImageCordova: found ' + fileEntry.name + ' in cache, but it is older than ' + reloadIn.humanize() + '.  Redownloading.');
					return downloadUrl(url).then((newUrl) => {
						return newUrl;
					}, onError);
				} else {
					return fileEntry.toInternalURL();
				}
			}, onError);
		}, (/* err */) => {
			//$log.debug('ImageCache.getImageCordova: not in cache: ' + path);
			return downloadUrl(url).then((newUrl) => {
				return newUrl;
			}, onError);
		}).then((ret) => {
			deferred.resolve(ret);
		});
		return deferred.promise;
	};

	const getImageNoop = (url) => {
		return $q.when(url);
	};

	// initialize
	Cordova.inCordova().then(() => {
		const deferred = $q.defer();
		const onError = (err) => {
			$rootScope.$evalAsync(() => {
				$log.error('ImageCache.init: error initializing: ' + angular.toJson(err));
				deferred.resolve(getImageNoop);
			});
			return deferred.promise;
		};

		if ($window.cordova && $window.cordova.file && $window.cordova.file.cacheDirectory) {
			localCache = $window.cordova.file.cacheDirectory + 'image-cache';
			$log.debug('ImageCache.init: local cache directory: ' + localCache);
			resolvePath($window.cordova.file.cacheDirectory).then((dirEntry) => {
				dirEntry.getDirectory('image-cache', { create:true }, (newEntry) => {
					$rootScope.$evalAsync(() => {
						$log.debug('ImageCache.init: created: ' + newEntry.toURL());
						deferred.resolve(getImageCordova);
					});
				}, onError);
			}, onError);
		} else {
			return onError('cordova.file.cacheDirectory is not defined');
		}

		return deferred.promise;
	}, (/* err */) => {
		$log.info('ImageCache.init: Not in Cordova.  Returning passthrough.');
		return $q.when(getImageNoop);
	}).then((impl) => {
		getImage = impl;
		ready.resolve(impl);
		cleanCache();
	});

	$rootScope.$on('cruisemonkey.wipe-cache', () => {
		wipeCache();
	});

	$rootScope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
			wipeCache();
		}
	});

	const inFlight = {};
	return {
		getImage: (src) => {
			$log.debug('ImageCache.getImage: ' + src);
			if (!inFlight[src]) {
				inFlight[src] = ready.promise.then((impl) => {
					if (impl) {
						return impl(src);
					} else {
						$log.warn('ImageCache.getImage: no implementation found!  Falling back to ' + src);
						return src;
					}
				}).finally(() => {
					delete inFlight[src];
				});
			}
			return inFlight[src];
		},
		wipeCache: wipeCache,
		cleanCache: cleanCache
	};
});
