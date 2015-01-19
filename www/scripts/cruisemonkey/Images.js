(function() {
	'use strict';

	/* global LocalFileSystem: true */
	/* global cordova: true */
	/* global ionic: true */
	/* global moment: true */

	angular.module('cruisemonkey.Images', [
		'ngCordova'
	])
	.directive('cmImage', ['Images', function(Images) {
		return {
			restrict: 'AE',
			template: '<img ng-src="{{imageUrl}}">',
			transclude: false,
			scope: {
				url: '='
			},
			replace: true,
			link: function(scope, elem, attrs, ctrl) {
				//console.log('cmImage: getting ' + scope.url);
				scope.imageUrl = 'images/blank.gif';
				Images.get(scope.url).then(function(imageUrl) {
					scope.imageUrl = imageUrl;
				});
			}
		};
	}])
	.factory('Images', ['$q', '$rootScope', '$http', '$interval', '$window', '$cordovaFile', '$cordovaFileTransfer', 'Cordova', function($q, $rootScope, $http, $interval, $window, $cordovaFile, $cordovaFileTransfer, Cordova) {
		console.log('Images: Initializing image cache.');

		var inFlight = {};
		var maxCacheSize = 5000;

		var ready = $q.defer();

		var getEntryFromFile = function(file) {
			//console.log('Images.getEntryFromFile: ' + file);

			var deferred = $q.defer();

			Cordova.inCordova().then(function() {
				try {
					/*
					if (ionic.Platform.isIOS()) {
						if (!(file instanceof String)) {
							file = file.toURL();
						}
					}
					*/
					$window.resolveLocalFileSystemURL(file.toURL(), function(res) {
						$rootScope.$evalAsync(function() {
							console.log('resolveLocalFileSystemURL = ' + angular.toJson(res));
							if (res && res.fullPath) {
								//console.log('Images.getEntryFromFile: ' + file + ' resolves to ' + angular.toJson(res));
								deferred.resolve(res);
							} else {
								//console.log('Images.getEntryFromFile: no full path for ' + file);
								deferred.reject();
							}
						});
					}, function(err) {
						$rootScope.$evalAsync(function() {
							deferred.reject(err);
						});
					});
				} catch(err) {
					$rootScope.$evalAsync(function() {
						deferred.reject(err);
					});
				}
			}, function() {
				deferred.reject('Not in Cordova!');
			});

			return deferred.promise;
		};

		var getCacheDirectory = function() {
			var deferred   = $q.defer(),
				imageCache = cordova.file.cacheDirectory + 'image-cache',
				onError = function(err) {
					$rootScope.$evalAsync(function() {
						console.log('Images.getCacheDirectory: error: ' + (err instanceof String? err : angular.toJson(err)));
						deferred.reject(err);
					});
				};

			Cordova.inCordova().then(function() {
				$window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fileSystem) {
					$rootScope.$evalAsync(function() {
						console.log('Images.getCacheDirectory: got root filesystem = ' + angular.toJson(fileSystem));
						fileSystem.root.getDirectory('image-cache', { create: true }, function(dir) {
							$rootScope.$evalAsync(function() {
								console.log('Images.getCacheDirectory: image cache directory = ' + angular.toJson(dir));
								deferred.resolve(dir);
							});
						}, onError);
					});
				}, onError);
			}, function() {
				deferred.reject('Not in Cordova!');
			});

			return deferred.promise;
		};

		var _findMatchingFile = function(cacheDirectory, hash) {
			var deferred = $q.defer();

			cacheDirectory.getFile(hash + '.jpg', {create:false}, function(file) {
				$rootScope.$evalAsync(function() {
					deferred.resolve(file);
				});
			}, function() {
				cacheDirectory.getFile(hash + '.png', {create:false}, function(file) {
					$rootScope.$evalAsync(function() {
						deferred.resolve(file);
					});
				}, function() {
					cacheDirectory.getFile(hash + '.gif', {create:false}, function(file) {
						$rootScope.$evalAsync(function() {
							deferred.resolve(file);
						});
					}, function() {
						$rootScope.$evalAsync(function() {
							deferred.reject();
						});
					});
				});
			});

			return deferred.promise;
		};

		var getImageUrl = function(url) {
			var deferred = $q.defer();

			$q.all([Cordova.inCordova(), ready.promise]).then(function() {
				var hash, m, localFile;

				hash = $window.btoa(url).replace(/\=+/, '');

				getCacheDirectory().then(function(cacheDirectory) {
					if (inFlight[hash]) {
						inFlight[hash].promise.then(function(url) {
							if (inFlight[hash]) {
								delete inFlight[hash];
							}
							deferred.resolve(url);
						}, function(err) {
							console.log('Images: in-flight call to ' + url + ' failed: ' + angular.toJson(err));
							deferred.resolve(url);
						});
						return deferred.promise;
					} else {
						inFlight[hash] = $q.defer();
					}

					var onError = function(err) {
						$rootScope.$evalAsync(function() {
							console.log('Images.getImageUrl: error: ' + angular.toJson(err));
							inFlight[hash].reject(err);
						});
					};

					_findMatchingFile(cacheDirectory, hash).then(function(localFile) {
						$rootScope.$evalAsync(function() {
							console.log('Images.getImageUrl: found matching cached file: ' + angular.toJson(localFile));
							inFlight[hash].resolve(localFile.toURL());
						});
					}, function(err) {
						$rootScope.$evalAsync(function() {
							console.log('Images.getImageUrl: downloading remote file from url: ' + url);
							$http.get(url,
								{
									cache: true,
									responseType: 'blob'
								}).success(function(data, status, headers, config) {
									var contentType = headers('Content-Type'), ext = '';
									switch(contentType) {
										case 'image/jpeg':
											ext = '.jpg';
											break;
										case 'image/png':
											ext = '.png';
											break;
										case 'image/gif':
											ext = '.gif';
											break;
										default:
											ext = '';
											console.log('Images.getImageUrl: unhandled mime-type from URL ' + url + ': ' + contentType);
											inFlight[hash].reject(err);
											return;
									}

									cacheDirectory.getFile(hash + ext, {create:true}, function(file) {
										console.log('Images.getImageUrl: created local file: ' + angular.toJson(file));
										file.createWriter(function(writer) {
											writer.onwrite = function() {
												$rootScope.$evalAsync(function() {
													console.log('Images.getImageUrl: wrote file to ' + file.toURL());
													inFlight[hash].resolve(file.toURL());
												});
											};
											writer.onerror = onError;
											writer.write(data);
										}, onError);
									}, onError);
								}).error(function(data, status) {
									onError([data, status]);
								});
						cacheDirectory.getFile(hash, { create: true }, function(localFile) {
							});
						}, onError);
					});

					inFlight[hash].promise.then(function(match) {
						deferred.resolve(match);
					}, function(err) {
						console.log('Images.getImageUrl(): Failed to get cached file for ' + url + ': ' + angular.toJson(err));
						deferred.resolve(url);
					});
				}, function(err) {
					deferred.resolve(url);
				});
			}, function() {
				// not cordova, just resolve the URL
				deferred.resolve(url);
			});

			return deferred.promise;
		};

		var getAllImageUrls = function(urls) {
			var promises = [];
			for (var i=0; i < urls.length; i++) {
				promises.push(getImageUrl(urls[i]));
			}
			return $q.all(promises);
		};

		var _getFileInfo = function(entry) {
			var deferred = $q.defer();
			entry.getMetadata(function(metadata) {
				deferred.resolve({
					'path': entry.toURL(),
					'timestamp': moment(metadata.modificationTime)
				});
			}, function(err) {
				deferred.reject(err);
			});
			return deferred.promise;
		};

		var _sortFileInfo = function(a, b) {
			if (a.timestamp.isBefore(b.timestamp)) {
				return -1;
			} else if (a.timestamp.isSame(b.timestamp)) {
				return 0;
			} else {
				return 1;
			}
		};

		var _deleteEntry = function(entry) {
			console.log('Images._deleteEntry: ' + entry.path);
		};

		ready.promise.then(function() {
			console.log('Images: Ready for queries.');
		});

		Cordova.inCordova().then(function() {
			getCacheDirectory().then(function(cacheDirectory) {
				console.log('Images: checking for old cache files in ' + angular.toJson(cacheDirectory));
				getEntryFromFile(cacheDirectory).then(function(dir) {
					var reader = dir.createReader();
					reader.readEntries(function(entries) {
						$rootScope.$evalAsync(function() {
							//console.log('Images: got entries: ' + angular.toJson(entries));

							if (entries.length > maxCacheSize) {
								var promises = [], entry, i;
								for (i=0; i < entries.length; i++) {
									promises.push(_getFileInfo(entries[i]));
								}
								$q.all(promises).then(function(res) {
									res.sort(_sortFileInfo);
									//console.log('Images: cache files: ' + angular.toJson(res));
									while (res.length > maxCacheSize) {
										entry = res.shift();
										_deleteEntry(entry);
									}
									ready.resolve(true);
								}, function(err) {
									console.log('Images: failed to clean up the cache directory: ' + angular.toJson(err));
									ready.resolve(true);
								});
							} else {
								ready.resolve(true);
							}
						});
					}, function(err) {
						$rootScope.$evalAsync(function() {
							console.log('Images: failed to read directory: ' + angular.toJson(err));
							ready.resolve(true);
						});
					});
				}, function(err) {
					console.log('Images: failed to resolve DirectoryEntry: ' + angular.toJson(err));
					ready.resolve(true);
				});
			});
		});

		return {
			get: getImageUrl,
			getAll: getAllImageUrls,
		};
	}]);
}());
