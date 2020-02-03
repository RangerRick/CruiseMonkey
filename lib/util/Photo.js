import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
const {
	Camera,
	Device,
} = Plugins;

require('ng-file-model');

require('../twitarr/Service');

angular.module('cruisemonkey.util.Photo', [
	'ng-file-model',
	'cruisemonkey.Config',
	'cruisemonkey.Twitarr',
])
.factory('Photos', ($compile, $document, $log, $q, $rootScope, Twitarr) => {
	const $scope = $rootScope.$new();

	const findKey = (obj, keyName) => {
		if (obj) {
			const keys = Object.keys(obj);
			for (let i=0, len=keys.length, key, value; i < len; i++) {
				key = keys[i];
				value = obj[key];
				if (Object.prototype.hasOwnProperty.call(obj, key) && key === keyName) {
					return value;
				} else if (typeof value === 'object') {
					const ret = findKey(value, keyName);
					if (ret !== undefined) {
						return ret;
					}
				}
			}
		}
		return undefined;
	};

	const getPhotoId = (response) => {
		if (response) {
			const status = findKey(response, 'status');
			const id = findKey(response, 'id');
			const hash = findKey(response, 'md5_hash');
			const photo = findKey(response, 'photo');
			if (status === 'ok') {
				if (id) return id;
				if (hash) return hash;
				if (photo) return photo;
			}
		}
		$log.debug('Photos.getPhotoId: unhandled response: ' + angular.toJson(response));
		return undefined;
	};

	$scope.uploadFile = (image) => {
		$log.debug('Photos.uploadFile: ' + image.name);

		$scope.deferred.notify(1);

		$log.debug('Photos.uploadFile: image does NOT have data', image);
		let tw;
		if ($scope.isProfile) {
			tw = Twitarr.postUserPhoto;
		} else {
			tw = Twitarr.postPhoto;
		}

		return tw(image).then((res) => {
			const response = angular.fromJson(res);
			$log.debug('Photos.uploadFile: response='+angular.toJson(response));
			const id = getPhotoId(response);
			if (id) {
				$scope.deferred.resolve(id);
			} else {
				$scope.deferred.reject('got a response, but no ID was found');
			}
			return $scope.deferred.promise;
		}, (err) => {
			$log.debug('Photos.uploadFile: error: ' + angular.toJson(err));
			$scope.deferred.reject(err);
			return $scope.deferred.promise;
		}, (progress) => {
			if (progress && progress.loaded && progress.total) {
				$scope.deferred.notify(progress.loaded / progress.total * 100);
			} else {
				$scope.deferred.notify(progress);
			}
		});
	}

	$scope.$watch('photo', (newFile) => {
		if (newFile) {
			return $scope.uploadFile(newFile);
		}
	});

	const doPhoto = (source) => {
		console.log('Photos.doPhoto:', source);
		return $q.when(Camera.getPhoto({
			allowEditing: true,
			quality: 90,
			resultType: CameraResultType.Base64,
			saveToGallery: true,
			source: source,
		})).then((image) => {
			$scope.uploadFile({
				name: 'uploadme.jpg',
				data: 'data:image/jpeg;base64,' + image.base64String,
				type: 'image/jpeg',
			});
			return $scope.deferred.promise;
		});
	};

	$scope.activate = (ev, isProfile) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}

		console.log('Photos.activate:', isProfile);
		$scope.isProfile = isProfile;
		$scope.deferred = $q.defer();

		if ($scope.hasNative()) {
			return doPhoto(CameraSource.Prompt);
		} else {
			$log.debug('Photos.activate: browser');
			$scope.wrapper = angular.element('<div style="width: 1px; height: 1px"></div>');
			const el = angular.element('<input type="file" id="photo-upload" accept="image/*;capture=camera" ng-file-model="$parent.photo"></input>');
			$scope.wrapper.append(el);
			angular.element($document[0].body).append($scope.wrapper);

			$compile($scope.wrapper.contents())($scope);

			el.click();

			return $scope.deferred.promise;
		}
	};

	$q.when(Device.getInfo()).then((info) => {
		$scope.hasNative = () => {
			return info.platform !== 'web';
		};
	});

	return {
		hasNative: $scope.hasNative,
		activate: $scope.activate
	};
});
