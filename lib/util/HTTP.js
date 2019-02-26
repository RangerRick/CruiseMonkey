'use strict';

var stringMap = function(obj) {
	var keys = Object.keys(obj);
	for (var i=0, len=keys.length, key; i < len; i++) {
		key = keys[i];
		if (obj.hasOwnProperty(key) && key !== 'data') {
			obj[key] = '' + obj[key];
		}
	}
	return obj;
};

var URI = require('urijs');

var module = angular.module('cruisemonkey.util.HTTP', [
	'ng',
	'cruisemonkey.Config',
	'cruisemonkey.Settings'
]);

ionic.Platform.ready(function() {
	if (window.cordova.plugin.http) {
		/* eslint-disable no-console */
		console.log('window.cordova.plugin.http found.');
		/* eslint-enable no-console */
		module.factory('cordovaHTTP', function($log, $timeout, $q) {
			function makePromise(fn, args, async) {
				var deferred = $q.defer();

				var success = function(response) {
					if (async) {
						$timeout(function() {
							deferred.resolve(response);
						});
					} else {
						deferred.resolve(response);
					}
				};

				var fail = function(response) {
					if (async) {
						$timeout(function() {
							deferred.reject(response);
						});
					} else {
						deferred.reject(response);
					}
				};

				if (async) {
					$log.debug('calling ' + fn.name + ' with args:' + angular.toJson(args));
					args.push(success);
					args.push(fail);
					fn.apply(cordova.plugin.http, args);
				} else {
					$log.debug('calling ' + fn.name + ' with args: ' + angular.toJson(args));
					var ret = fn.apply(cordova.plugin.http, args);
					deferred.resolve(ret);
				}

				return deferred.promise.then(function(result) {
					/*
					var json = angular.toJson(result);
					if (json && json.length > 500) {
						json = json.substring(0, 500) + '...';
					}
					$log.debug('result from ' + fn.name + ':', json);
					*/
					return result;
				});
			}

			return {
				getBasicAuthHeader: function(username, password) {
					return makePromise(cordova.plugin.http.getBasicAuthHeader, [username, password]);
				},
				useBasicAuth: function(username, password) {
					return makePromise(cordova.plugin.http.useBasicAuth, [username, password]);
				},
				setHeader: function(header, value) {
					return makePromise(cordova.plugin.http.setHeader, [header, value]);
				},
				setDataSerializer: function(serializer) {
					return makePromise(cordova.plugin.http.setDataSerializer, [serializer]);
				},
				setRequestTimeout: function(connectionTimeout) {
					return makePromise(cordova.plugin.http.setRequestTimeout, [connectionTimeout]);
				},
				getCookieString: function(url) {
					return makePromise(cordova.plugin.http.getCookieString, [url]);
				},
				setCookie: function(url, cookie, options) {
					return makePromise(cordova.plugin.http.setCookie, [url, cookie, options]);
				},
				clearCookies: function() {
					return makePromise(cordova.plugin.http.clearCookies, []);
				},
				setSSLCertMode: function(mode) {
					return makePromise(cordova.plugin.http.setSSLCertMode, [mode], true);
				},
				disableRedirect: function(bool) {
					return makePromise(cordova.plugin.http.disableRedirect, [bool], true);
				},
				removeCookies: function(bool) {
					return makePromise(cordova.plugin.http.removeCookies, [bool], true);
				},
				sendRequest: function(url, options) {
					return makePromise(cordova.plugin.http.head, [url, stringMap(options)], true);
				},
				head: function(url, params, headers) {
					return makePromise(cordova.plugin.http.head, [url, stringMap(params), stringMap(headers)], true);
				},
				post: function(url, data, headers) {
					return makePromise(cordova.plugin.http.post, [url, data, stringMap(headers)], true);
				},
				put: function(url, params, headers) {
					return makePromise(cordova.plugin.http.put, [url, stringMap(params), stringMap(headers)], true);
				},
				patch: function(url, params, headers) {
					return makePromise(cordova.plugin.http.patch, [url, stringMap(params), stringMap(headers)], true);
				},
				delete: function(url, params, headers) {
					return makePromise(cordova.plugin.http.delete, [url, stringmap(params), stringMap(headers)], true);
				},
				get: function(url, params, headers) {
					return makePromise(cordova.plugin.http.get, [url, stringMap(params), stringMap(headers)], true);
				},
				uploadFile: function(url, params, headers, filePath, name) {
					return makePromise(cordova.plugin.http.uploadFile, [url, stringMap(params), stringMap(headers), filePath, name], true);
				},
				downloadFile: function(url, params, headers, filePath) {
					return makePromise(cordova.plugin.http.downloadFile, [url, stringMap(params), stringMap(headers), filePath], true);
				}
			};
		});
	} else {
		/* eslint-disable no-console */
		console.log('!!!! window.cordova.plugin.http NOT found.');
		/* eslint-enable no-console */
	}
});

module.factory('cmHTTP', function($http, $injector, $log, $q, $window, SettingsService, UserService) {
	var requestTimeout = parseInt($injector.get('config.request.timeout'), 10) * 1000;
	var enableCachebusting = $injector.get('config.twitarr.enable-cachebusting');

	var ready;
	var initialize = function() {
		var deferred = $q.defer();

		if ($injector.has('cordovaHTTP')) {
			$log.info('cmHTTP: Cordova HTTP is available.');
			var cordovaHTTP = $injector.get('cordovaHTTP');
			cordovaHTTP.setSSLCertMode('nocheck').then(function() {
				return cordovaHTTP.setRequestTimeout(requestTimeout / 1000.0);
			}).then(function() {
				deferred.resolve(cordovaHTTP);
			});
		} else {
			$log.warn('cmHTTP: Cordova HTTP is not available.');
			deferred.resolve(undefined);
		}
		return deferred.promise;
	};

	var defaultOptions = {
		cache: false,
		timeout: requestTimeout,
		headers: {
			Accept: 'application/json'
		}
	};

	var call = function(passedOptions) {
		var options = angular.extend({}, defaultOptions, passedOptions);

		if (!ready) {
			ready = initialize();
		}

		return $q.all({
			cordovaHTTP: ready,
			twitarrRoot: SettingsService.getTwitarrRoot()
		}).then(function(all) {
			if (options.url.indexOf('http') !== 0) {
				options.url = all.twitarrRoot + options.url;
			}
			var url = URI(options.url);

			var user = UserService.get();

			if (!options.params) {
				options.params = {};
			}

			if (!options.params.key) {
				if (user.loggedIn && user.key) {
					options.params.key = user.key;
				}
			}

			if (options.method === 'GET' && enableCachebusting) {
				options.params._x = new Date().getTime();
			}

			if (options.params.cache) {
				// disable cachebusting for this request
				options.cache = true;
				delete options.params._x;
				delete options.params.cache;
			}

			Object.keys(options.params).forEach(function(param) {
				url.addSearch(param, options.params[param]);
			});

			//$log.debug('Making HTTP call with options:',options);
			if (all.cordovaHTTP) {
				var handleSuccess = function(response) {
					if (response.data) {
						response.data = angular.fromJson(response.data);
					}
					//$log.debug('cmHTTP: got: ' + angular.toJson(response.data));
					return response;
				};
				var handleError = function(err) {
					$log.error('cmHTTP: failed: ' + angular.toJson(err));
					return $q.reject(err);
				};

				if (options.method === 'GET') {
					return all.cordovaHTTP.get(options.url, options.params, options.headers).then(handleSuccess, handleError);
				} else if (options.method === 'HEAD') {
					return all.cordovaHTTP.head(options.url, options.params, options.headers).then(handleSuccess, handleError);
				} else if (options.method === 'PUT') {
					options.params = angular.extend({}, options.data, options.params);
					return all.cordovaHTTP.put(options.url, options.params, options.headers).then(handleSuccess, handleError);
				} else if (options.method === 'POST') {
					return all.cordovaHTTP.post(url.toString(), options.data || {}, options.headers).then(handleSuccess, handleError);
				} else if (options.method === 'DELETE') {
					return all.cordovaHTTP.delete(options.url, options.params, options.headers).then(handleSuccess, handleError);
				} else {
					$log.error('cmHTTP: Unknown method: ' + options.method);
					return $q.reject('Unknown method: ' + options.method);
				}
			} else {
				return $http(options);
			}
		});
	};

	var get = function(url, options) {
		options.method = 'GET';
		options.url = url;
		return call(options);
	};

	var del = function(url, options) {
		options.method = 'DELETE';
		options.url = url;
		return call(options);
	};

	var post = function(url, options) {
		options.method = 'POST';
		options.url = url;
		return call(options);
	};

	var put = function(url, options) {
		options.method = 'PUT';
		options.url = url;
		return call(options);
	};

	return {
		get: get,
		del: del,
		post: post,
		put: put
	};
});
