(function() {
	'use strict';

	var datetime = require('../util/datetime');

	require('../util/HTTP');
	require('../cordova/Initializer');

	angular.module('cruisemonkey.images.Cache', [
		'ngCordova',
		'ionic',
		'cruisemonkey.Initializer',
		'cruisemonkey.util.HTTP'
	])
	.directive('cmCache', function($compile, $log, ImageCache) {
		return {
			restrict: 'A',
			scope: {
				imgSrc: '@',
				imgBackground: '@'
			},
			link: function(scope, el, attrs) {
				var doSet = function(type, url) {
					if (type === 'background') {
						el.css({'background-image': 'url(' + url + ')'});
					} else {
						el.attr('src', url);
					}
				};

				var setImage = function(type, src) {
					ImageCache.getImage(src).then(function(dest) {
						doSet(type, dest);
					}, function(err) {
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
	.factory('ImageCache', function($cordovaFile, $cordovaFileTransfer, $log, $q, $rootScope, $window, cmHTTP, Cordova, SettingsService) {
		var keepFor = datetime.moment.duration(1, 'day');
		var reloadIn = datetime.moment.duration(1, 'hour');

		var ready = $q.defer();
		var getImage, localCache;

		var resolvePath = function(path) {
			return Cordova.inCordova().then(function() {
				var deferred = $q.defer();
				$window.resolveLocalFileSystemURL(path, function success(entry) {
					$rootScope.$evalAsync(function() {
						deferred.resolve(entry);
					});
				}, function failure(err) {
					$rootScope.$evalAsync(function() {
						deferred.reject(err);
					});
				});
				return deferred.promise;
			}, function() {
				return path;
			});
		};

		var getMetadata = function(file) {
			var deferred = $q.defer();
			file.getMetadata(function success(md) {
				$rootScope.$evalAsync(function() {
					deferred.resolve(md);
				});
			}, function failure(err) {
				$rootScope.$evalAsync(function() {
					deferred.reject(err);
				});
			});
			return deferred.promise;
		};

		var listFiles = function() {
			//$log.debug('ImageCache.listFiles(): ' + localCache);
			return resolvePath(localCache).then(function(dirEntry) {
				//$log.debug('ImageCache.listFiles(): resolved path: ' + dirEntry.toInternalURL());
				var deferred = $q.defer();

				var reader = dirEntry.createReader();
				reader.readEntries(function success(entries) {
					$rootScope.$evalAsync(function() {
						deferred.resolve(entries);
					});
				}, function failure(err) {
					$rootScope.$evalAsync(function() {
						deferred.reject(err);
					});
				});

				return deferred.promise;
			});
		};

		var removeFile = function(file) {
			var deferred = $q.defer();
			file.remove(function success(res) {
				$rootScope.$evalAsync(function() {
					$log.debug('ImageCache.removeFile(): ' + file.name + ' removed.');
					deferred.resolve(res);
				});
			}, function failure(err) {
				$rootScope.$evalAsync(function() {
					$log.warn('ImageCache.removeFile(): ' + file.name + ' NOT removed.');
					deferred.reject(err);
				});
			});
			return deferred.promise;
		};

		var isOlderThan = function(file, compareTo) {
			return getMetadata(file).then(function(md) {
				var lastModified = datetime.create(md.modificationTime);
				var ago = datetime.create().subtract(compareTo);
				return lastModified.isBefore(ago);
			}, function(err) {
				$log.error('ImageCache.isOlderThan: unable to get metadata for ' + file.name);
				return $q.reject(err);
			});
		};

		var removeIfOld = function(file) {
			return isOlderThan(file, keepFor).then(function(res) {
				if (res) {
					$log.debug('ImageCache.removeIfOld: ' + file.name + ' is stale.  Removing.');
					return removeFile(file);
				} else {
					return false;
				}
			});
		};

		var wipeCache = function() {
			Cordova.inCordova().then(function() {
				$log.info('ImageCache.wipeCache(): Wiping cache of images.');
				var oldReady = ready;
				ready = $q.defer();

				listFiles().then(function(files) {
					//$log.debug('Existing files: ' + angular.toJson(files));
					var promises = [];
					for (var i=0, len=files.length; i < len; i++) {
						promises.push(removeFile(files[i]));
					}
					return $q.all(promises);
				}, function(err) {
					$log.error('Failed to list files: ' + angular.toJson(err));
					return $q.reject(err);
				}).finally(function() {
					oldReady.resolve(getImage);
					ready.resolve(getImage);
				});

				return ready.promise;
			}, function() {
				return ready.promise;
			});
		};

		var cleanCache = function() {
			Cordova.inCordova().then(function() {
				$log.info('ImageCache.cleanCache(): Cleaning cache of images older than ' + keepFor.humanize() + '.');
				var oldReady = ready;
				ready = $q.defer();

				listFiles().then(function(files) {
					//$log.debug('Existing files: ' + angular.toJson(files));
					var promises = [];
					for (var i=0, len=files.length; i < len; i++) {
						promises.push(removeIfOld(files[i]));
					}
					return $q.all(promises);
				}, function(err) {
					$log.error('Failed to list files: ' + angular.toJson(err));
					return $q.reject(err);
				}).finally(function() {
					oldReady.resolve(getImage);
					ready.resolve(getImage);
				});

				return ready.promise;
			}, function() {
				return ready.promise;
			});
		};

		var getLocalPathForUrl = function(url) {
			return localCache + '/' + btoa(url);
		};

		var downloadUrl = function(url) {
			var path = getLocalPathForUrl(url);

			return $cordovaFileTransfer.download(url, path, { headers: {
				Accept: 'image/*'
			}}, true).then(function(res) {
				var newUrl = res.toInternalURL();
				$log.debug('ImageCache.downloadUrl: saved to cache: ' + newUrl);
				return newUrl;
			}, function(err) {
				$log.warn('ImageCache.downloadUrl: download failure: ' + angular.toJson(err));
				return $q.reject(err);
			});
		};

		var getImageCordova = function getImageCordova(url) {
			var path = getLocalPathForUrl(url);
			var deferred = $q.defer();

			var onError = function(err) {
				$log.warn('ImageCache.getImageCordova: Error: ' + angular.toJson(err));
				// failed to download, fall through to the original URL
				deferred.resolve(url);
			};

			resolvePath(path).then(function(fileEntry) {
				//$log.debug('ImageCache.getImageCordova: found in cache: ' + path);
				//$log.debug('ImageCache.getImageCordova: returning: ' + fileEntry.toInternalURL());
				return isOlderThan(fileEntry, reloadIn).then(function(older) {
					if (older) {
						$log.debug('ImageCache.getImageCordova: found ' + fileEntry.name + ' in cache, but it is older than ' + reloadIn.humanize() + '.  Redownloading.');
						return downloadUrl(url).then(function(newUrl) {
							return newUrl;
						}, onError);
					} else {
						return fileEntry.toInternalURL();
					}
				}, onError);
			}, function(err) {
				//$log.debug('ImageCache.getImageCordova: not in cache: ' + path);
				return downloadUrl(url).then(function(newUrl) {
					return newUrl;
				}, onError);
			}).then(function(ret) {
				deferred.resolve(ret);
			});
			return deferred.promise;
		};

		var getImageNoop = function getImageNoop(url) {
			return $q.when(url);
		};

		// initialize
		Cordova.inCordova().then(function() {
			var deferred = $q.defer();
			var onError = function(err) {
				$rootScope.$evalAsync(function() {
					$log.error('ImageCache.init: error initializing: ' + angular.toJson(err));
					deferred.resolve(getImageNoop);
				});
				return deferred.promise;
			};

			if (cordova && cordova.file && cordova.file.cacheDirectory) {
				localCache = cordova.file.cacheDirectory + 'image-cache';
				$log.debug('ImageCache.init: local cache directory: ' + localCache);
				resolvePath(cordova.file.cacheDirectory).then(function(dirEntry) {
					dirEntry.getDirectory('image-cache', { create:true }, function success(newEntry) {
						$rootScope.$evalAsync(function() {
							$log.debug('ImageCache.init: created: ' + newEntry.toURL());
							deferred.resolve(getImageCordova);
						});
					}, onError);
				}, onError);
			} else {
				return onError('cordova.file.cacheDirectory is not defined');
			}

			return deferred.promise;
		}, function() {
			$log.info('ImageCache.init: Not in Cordova.  Returning passthrough.');
			return $q.when(getImageNoop);
		}).then(function(impl) {
			getImage = impl;
			ready.resolve(impl);
			cleanCache();
		});

		$rootScope.$on('cruisemonkey.wipe-cache', function() {
			wipeCache();
		});

		$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
			if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
				wipeCache();
			}
		});

		var inFlight = {};
		return {
			getImage: function(src) {
				$log.debug('ImageCache.getImage: ' + src);
				if (!inFlight[src]) {
					inFlight[src] = ready.promise.then(function(impl) {
						if (impl) {
							return impl(src);
						} else {
							$log.warn('ImageCache.getImage: no implementation found!  Falling back to ' + src);
							return src;
						}
					}).finally(function() {
						delete inFlight[src];
					});
				}
				return inFlight[src];
			},
			wipeCache: wipeCache,
			cleanCache: cleanCache
		};
	})
	;

}());
