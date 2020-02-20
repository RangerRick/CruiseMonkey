require('ionic/js/ionic');
require('ionic/js/ionic-angular');

import { HTTP } from '@ionic-native/http';
import URI from 'urijs';

const module = angular.module('cruisemonkey.util.HTTP', [
	'ng',
	'cruisemonkey.Config',
	'cruisemonkey.Settings'
]);

module.factory('cmHTTP', ($http, $injector, $ionicPlatform, $log, $q, $window, SettingsService, UserService) => {
	const requestTimeout = parseInt($injector.get('config.requestTimeout'), 10) * 1000;
	const enableCachebusting = $injector.get('config.twitarr.enable-cachebusting');

	let ready;
	const initialize = async () => {
		const deferred = $q.defer();

		$ionicPlatform.ready(async () => {
			if ($window && $window.cordova && $window.cordova.plugin && $window.cordova.plugin.http) {
				$log.info('cmHTTP: Cordova HTTP is available.');
				await HTTP.setServerTrustMode('nocheck');
				await HTTP.setRequestTimeout(requestTimeout / 1000.0);
				deferred.resolve(HTTP);
			} else {
				$log.warn('cmHTTP: Cordova HTTP is not available.');
				deferred.resolve(undefined);
			}
			return deferred.promise;
		});
	};

	const defaultOptions = {
		cache: false,
		timeout: requestTimeout,
		headers: { Accept: 'application/json' }
	};

	const call = (passedOptions) => {
		$log.debug('call:' + angular.toJson(passedOptions));
		const options = angular.extend({}, defaultOptions, passedOptions);

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
			const url = URI(options.url);

			const user = UserService.get();

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
				if (param !== undefined) {
					options.params[param] = String(options.params[param]);
				}
				url.addSearch(param, options.params[param]);
			});

			$log.debug('Making HTTP call with options: ' + angular.toJson(options));
			if (all.cordovaHTTP) {
				const handleSuccess = (response) => {
					if (response.data) {
						response.data = angular.fromJson(response.data);
					}
					//$log.debug('cmHTTP: got: ' + angular.toJson(response.data));
					return response;
				};
				const handleError = (err) => {
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
		}).catch((err) => {
			$log.warn('failed: ' + angular.toJson(err));
			return $q.reject(err);
		});
	};

	const get = function(url, opts) {
		const options = opts || {};
		options.method = 'GET';
		options.url = url;
		return call(options);
	};

	const del = function(url, opts) {
		const options = opts || {};
		options.method = 'DELETE';
		options.url = url;
		return call(options);
	};

	const post = function(url, opts) {
		const options = opts || {};
		options.method = 'POST';
		options.url = url;
		return call(options);
	};

	const put = function(url, opts) {
		const options = opts || {};
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
