require('../images/Cache');
require('../seamail/New');

const userDetailHtml = require('./detail.html');
// const deckHtml = require('./deck-modal.html');

angular.module('cruisemonkey.user.Detail', [
	'ionic',
	'cruisemonkey.images.Cache',
	'cruisemonkey.muffles.Service',
	'cruisemonkey.seamail.New'
])
.factory('UserDetail', ($injector, $ionicPopover, $log, $q, $rootScope, kv, MuffleService, NewSeamail) => {
	const $scope = $rootScope.$new();
	$scope.detailPopover = $q.defer();

	const openUserDetail = (username, evt) => {
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

		const Twitarr = $injector.get('Twitarr');
		const UserService = $injector.get('UserService');

		return $q.all([
			$scope.detailPopover.promise,
			Twitarr.getUserInfo(username),
		]).then((res) => {
			const [po, user] = res;

			po.scope.user = user;
			po.scope.me = UserService.get();
			po.scope.isMuffled = (username) => MuffleService.isMuffled(username);
			$log.debug('UserDetail.openUserDetail: user='+ angular.toJson(user));
			po.show(evt);
		});
	};

	$scope.closeUserDetail = () => {
		$scope.detailPopover.promise.then((userDetail) => {
			userDetail.hide();
		});
	};

	$ionicPopover.fromTemplateUrl(userDetailHtml, {
		scope: $scope
		/* animation: 'slide-in-up' */
	}).then((p) => {
		$scope.detailPopover.resolve(p);

		p.scope.toggleMuffle = (username) => MuffleService.toggle(username);

		p.scope.sendSeamail = (sendTo, ev) => {
			NewSeamail.open(sendTo, ev);
		};
	});

	$scope.$on('$destroy', () => {
		$scope.detailPopover.promise.then((popover) => {
			popover.remove();
		});
	});

	return {
		open: openUserDetail,
		close: $scope.closeUserDetail
	};
});
