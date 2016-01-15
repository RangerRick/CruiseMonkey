(function() {
	'use strict';

	var angular = require('angular');

	var userDetailHtml = require('ngtemplate!html!./detail.html');

	angular.module('cruisemonkey.user.Detail', [
		'ionic'
	])
	.factory('UserDetail', function($injector, $ionicPopover, $log, $q, $rootScope) {
		var $scope = $rootScope.$new();
		$scope.popover = $q.defer();

		var openUserDetail = function(username, evt) {
			$log.info('UserDetail.openUserDetail: ' + username);
			if (evt) {
				evt.preventDefault();
				evt.stopPropagation();
			} else {
				$log.warn('WARNING: click $event was not passed.');
			}

			if (!$injector.has('Twitarr')) {
				$log.error('UserDetail.openUserDetail: Twitarr service is not available.');
				return;
			}
			if (!$injector.has('UserService')) {
				$log.error('UserDetail.openUserDetail: UserService is not available.');
				return;
			}

			var Twitarr = $injector.get('Twitarr');
			var UserService = $injector.get('UserService');

			return $q.all([
				$scope.popover.promise,
				Twitarr.getUserInfo(username)
			]).then(function(res) {
				var po = res[0],
					user = res[1];

				po.scope.user = user;
				po.scope.me = UserService.get();
				$log.debug('UserDetail.openUserDetail: user='+ angular.toJson(user));
				po.show(evt);
			});
		};

		var closeUserDetail = function() {
			$scope.popover.promise.then(function(up) {
				up.hide();
			});
		};

		$ionicPopover.fromTemplateUrl(userDetailHtml, {
			scope: $scope
			/* animation: 'slide-in-up' */
		}).then(function(p) {
			$scope.popover.resolve(p);

			p.scope.sendSeamail = function(sendTo) {
				$log.info('Opening a seamail dialog to ' + sendTo);
				if (!$injector.has('SeamailService')) {
					$log.error('UserDetail.popover.sendSeamail: SeamailService is not available.');
					return;
				}
				var SeamailService = $injector.get('SeamailService');
				SeamailService.newSeamail(sendTo);
			};
		});

		$scope.$on('$destroy', function() {
			$scope.popover.promise.then(function(popover) {
				popover.remove();
			});
		});

		return {
			'open': openUserDetail,
			'close': closeUserDetail
		};
	});

}());
