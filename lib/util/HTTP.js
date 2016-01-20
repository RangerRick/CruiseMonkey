'use strict';

var angular = require('angular');

angular.module('cruisemonkey.util.HTTP', [
	'ng',
	'cruisemonkey.Config',
	'cruisemonkey.Settings'
])
.factory('cmHTTP', function($http, $injector, $log, $q, $window, SettingsService, UserService) {
	var cordovaHTTP;
	if ($injector.has('cordovaHTTP')) {
		cordovaHTTP = $injector.get('cordovaHTTP');
	}

	var requestTimeout = parseInt($injector.get('config.request.timeout'), 10) * 1000;
	var enableCachebusting = $injector.get('config.twitarr.enable-cachebusting');
	var useCordovaHTTP = false;

	if ($window.cordova && cordovaHTTP) {
		$log.debug('cmHTTP: Cordova HTTP is available.');
		useCordovaHTTP = true;
		cordovaHTTP.acceptAllCerts(true);
		cordovaHTTP.setTimeouts(requestTimeout, requestTimeout);
	} else {
		$log.debug('cmHTTP: Cordova HTTP is not available.');
	}

	var defaultOptions = {
		cache: false,
		timeout: requestTimeout,
		headers: {
			Accept: 'application/json'
		}
	};

	var call = function(passedOptions) {
		var options = angular.extend({}, defaultOptions, passedOptions);

		return SettingsService.getTwitarrRoot().then(function(twitarrRoot) {
			if (options.url.indexOf('http') !== 0) {
				options.url = twitarrRoot + options.url;
			}

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

			//$log.debug('Making HTTP call with options:',options);
			if (useCordovaHTTP) {
				var handleSuccess = function(response) {
					if (response.data) {
						response.data = angular.fromJson(response.data);
					}
					//$log.debug('Twitarr.call: got: ' + angular.toJson(response.data));
					return response;
				};
				var handleError = function(err) {
					$log.error('Twitarr.call: failed: ' + angular.toJson(err));
					return $q.reject(err);
				};

				if (options.method === 'GET') {
					return cordovaHTTP.get(options.url, options.params, options.headers).then(handleSuccess, handleError);
				} else if (options.method === 'PUT') {
					return cordovaHTTP.put(options.url, options.params, options.headers).then(handleSuccess, handleError);
				} else if (options.method === 'POST') {
					options.params = angular.extend({}, options.data, options.params);
					return cordovaHTTP.post(options.url, options.params, options.headers).then(handleSuccess, handleError);
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

module.exports = {};