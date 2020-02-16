const datetime = require('../util/datetime');

require('../util/HTTP');
require('../cordova/Initializer');

import CordovaPromiseFS from 'cordova-promise-fs';
import { File } from '@ionic-native/file';

angular.module('cruisemonkey.images.Cache', [
	'ionic',
	'cruisemonkey.Initializer'
])
.directive('cmCache', (ImageCache) => {
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
				ImageCache.getImage(src).then((dest) => {
					doSet(type, dest);
				}, () => {
					doSet(type, src);
				});
			};

			attrs.$observe('imgSrc', (src) => {
				setImage('src', src.trim());
			});
			attrs.$observe('imgBackground', (src) => {
				setImage('background', src.trim());
			});
		}
	};
})
.factory('ImageCache', ($log, $q, $rootScope, Cordova) => {
	const fs = CordovaPromiseFS({
		persistent: true,
		storageSize: 20*1024*1024,
		Promise: $q,
	});
	try {
		$log.debug('cache directory:', File.cacheDirectory);
	} catch (err) {
		// ignore any errors
	}

	const cacheRoot = 'image-cache/';

	const keepFor = datetime.moment.duration(1, 'day');
	const reloadIn = datetime.moment.duration(1, 'hour');

	let ready = $q.defer();
	let getImage;

	const getMetadata = (file) => {
		const deferred = $q.defer();
		file.getMetadata((metadata) => {
			$rootScope.$evalAsync(() => {
				$log.debug('getMetadata: got', metadata);
				deferred.resolve(metadata);
			});
		}, (err) => {
			$rootScope.$evalAsync(() => {
				$log.error('getMetadata: error:', err);
				deferred.reject(err);
			});
		});
		return deferred.promise;
	};

	const listFiles = () => {
		return fs.list(cacheRoot, 'e');
	};

	const removeFile = (file) => {
		return fs.remove(file);
	};

	const isOlderThan = (file, compareTo) => {
		return getMetadata(file).then((md) => {
			if (md) {
				const lastModified = datetime.create(md.modificationTime);
				const ago = datetime.create().subtract(compareTo);
				return lastModified.isBefore(ago);
			}
			$log.warn('ImageCache.isOlderThan: unable to get metadata for ' + file.name);
			return false;
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
		return Cordova.inCordova().then((inCordova) => {
			if (!inCordova) {
				return ready.promise;
			}

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
		return Cordova.inCordova().then((inCordova) => {
			if (!inCordova) {
				return ready.promise;
			}

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

	const btoaRE = /=*$/;
	const getFilenameForUrl = (url) => {
		return btoa(url).replace(btoaRE, '');
	};

	const getLocalPathForUrl = (url) => {
		return cacheRoot + getFilenameForUrl(url);
	};

	const downloadUrl = (url) => {
		const localPath = getLocalPathForUrl(url);
		return fs.download(url, localPath, {
			trustAllHosts: true,
			retry: [1000, 2000, 3000],
		}).then((entry) => {
			$log.debug('ImageCache.downloadUrl: saved to cache: ' + entry.name);
			return entry;
		}, (err) => {
			$log.warn('ImageCache.downloadUrl: download failure: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const getImageCordova = (url) => {
		const path = getLocalPathForUrl(url);

		return fs.exists(path).then((exists) => {
			if (exists) {
				$log.debug('ImageCache.getImageCordova: found in cache: ' + path);
				return fs.file(path).then((fileEntry) => {
					if (fileEntry) {
						return isOlderThan(fileEntry, reloadIn).then((older) => {
							if (older) {
								$log.debug('ImageCache.getImageCordova: found ' + fileEntry.name + ' in cache, but it is older than ' + reloadIn.humanize() + '.  Redownloading.');
								return downloadUrl(url);
							} else {
								$log.debug('ImageCache.getImageCordova: returning:', fs.toURLSync(fileEntry));
								return fileEntry;
							}
						});
					}
				});
			}
			return downloadUrl(url);
		}, (/* err */) => {
			$log.debug('ImageCache.getImageCordova: not in cache: ' + path);
			return downloadUrl(url);
		}).then((entry) => {
			const url = fs.toURLSync(entry);
			console.log(`getImageCordova: final resolve: ${url}`);
			return url;
		}).catch((err) => {
			$log.warn('ImageCache.getImageCordova: Error: ' + angular.toJson(err));
			return url;
		});
	};

	const getImageNoop = (url) => {
		return $q.when(url);
	};

	// initialize
	Cordova.inCordova().then((inCordova) => {
		const deferred = $q.defer();

		if (!inCordova) {
			deferred.resolve(getImageNoop);
			return deferred.promise;
		}

		const onError = (err) => {
			$rootScope.$evalAsync(() => {
				$log.error('ImageCache.init: error initializing: ' + angular.toJson(err));
				deferred.resolve(getImageNoop);
			});
			return deferred.promise;
		};

		fs.ensure(cacheRoot).then(() => {
			$log.debug(`ImageCache.init: local cache directory: ${cacheRoot}`);
			deferred.resolve(getImageCordova);
		}, onError);

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
		if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
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
