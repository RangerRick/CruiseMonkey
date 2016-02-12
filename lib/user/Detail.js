(function() {
	'use strict';

	require('../images/Cache');
	require('../seamail/New');

	var cabins = require('../util/cabins');
	var userDetailHtml = require('ngtemplate!html!./detail.html');
	var deckHtml = require('ngtemplate!html!./deck-modal.html');

	angular.module('cruisemonkey.user.Detail', [
		'ionic',
		'cruisemonkey.images.Cache',
		'cruisemonkey.seamail.New'
	])
	.factory('UserDetail', function($injector, $ionicModal, $ionicPopover, $log, $q, $rootScope, NewSeamail) {
		var $scope = $rootScope.$new();
		$scope.detailPopover = $q.defer();

		var showModal = function() {
			$ionicModal.fromTemplateUrl(deckHtml, {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(m) {
				m.scope.closeModal = function(ev) {
					if (ev) {
						ev.preventDefault();
						ev.stopPropagation();
					}
					m.hide();
					m.remove();
				};

				m.show();
				$scope.detailPopover.promise.then(function(po) {
					po.hide();
				});
			});



		};

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
				$scope.detailPopover.promise,
				Twitarr.getUserInfo(username)
			]).then(function(res) {
				var po = res[0],
					user = res[1];

				po.scope.openRoom = function() {
					var match = cabins.find(po.scope.user.room_number);
					if (match) {
						$log.debug('opening room: ' + po.scope.user.room_number + ' (' + match + ')');
						$scope.deck = match[0];
						$scope.amenityId = match[1];
						showModal();
					} else {
						$log.debug('unable to find room.');
					}
				};

				po.scope.user = user;
				po.scope.me = UserService.get();
				$log.debug('UserDetail.openUserDetail: user='+ angular.toJson(user));
				po.show(evt);
			});
		};

		var closeUserDetail = function() {
			$scope.detailPopover.promise.then(function(up) {
				up.hide();
			});
		};

		$ionicPopover.fromTemplateUrl(userDetailHtml, {
			scope: $scope
			/* animation: 'slide-in-up' */
		}).then(function(p) {
			$scope.detailPopover.resolve(p);

			p.scope.sendSeamail = function(sendTo, ev) {
				NewSeamail.open(sendTo, ev);
			};
		});

		$scope.$on('$destroy', function() {
			$scope.detailPopover.promise.then(function(popover) {
				popover.remove();
			});
		});

		return {
			open: openUserDetail,
			close: closeUserDetail
		};
	});

}());
