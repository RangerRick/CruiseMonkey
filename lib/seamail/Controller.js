require('../polyfills/Array');
require('../images/Cache');
// const hashFunc = require('string-hash/index');

const autocompleteTemplate = require('./autocomplete-template.html');
// const seamailTemplate = require('./seamail.html');
const userListTemplate = require('./user-list.html');

angular.module('cruisemonkey.seamail.Controller', [
	'cruisemonkey.Config',
	'cruisemonkey.Twitarr',
	'cruisemonkey.images.Cache',
	'cruisemonkey.seamail.New',
	'cruisemonkey.seamail.Service'
])
.directive('autoComplete',(Twitarr) => {
	return {
		restrict:'AE',
		scope:{
			selectedUsers:'=model',
			additionalUser:'='
		},
		templateUrl:autocompleteTemplate,
		link:(scope /*,elem,attrs */) =>{
			scope.suggestions=[];
			scope.selectedUsers=[];
			scope.selectedIndex=-1;
			//$log.debug('additional user: ' + angular.toJson(scope.additionalUser));

			scope.removeTag=(ev, index) =>{
				if (ev) {
					ev.preventDefault();
					ev.stopPropagation();
				}
				scope.selectedUsers.splice(index,1);
			};

			scope.search=() =>{
				Twitarr.getAutocompleteUsers(scope.searchText).then((users) => {
					if (scope.additionalUser) {
						users.remove(scope.additionalUser.toLowerCase());
					}
					for (let i=0; i < scope.selectedUsers.length; i++) {
						users.remove(scope.selectedUsers[i]);
					}
					scope.suggestions=users;
					scope.selectedIndex = -1;
				});
			};

			scope.addToSelectedUsers=(index) =>{
				//$log.debug('addToSelectedUsers(' + index + ')');
				if(scope.selectedUsers.indexOf(scope.suggestions[index])===-1){
					scope.selectedUsers.push(scope.suggestions[index]);
					scope.searchText='';
					scope.suggestions=[];
				}
			};

			scope.checkKeyDown=(event) =>{
				if(event.keyCode===40){
					event.preventDefault();
					if(scope.selectedIndex+1 !== scope.suggestions.length){
						scope.selectedIndex++;
					}
				}
				else if(event.keyCode===38){
					event.preventDefault();
					if(scope.selectedIndex-1 !== -1){
						scope.selectedIndex--;
					}
				}
				else if(event.keyCode===13){
					scope.addToSelectedUsers(scope.selectedIndex);
				}
			};

			scope.$watch('selectedIndex',(val) =>{
				if(val!==-1) {
					scope.searchText = scope.suggestions[scope.selectedIndex];
				}
			});
		}
	};
})
.controller('CMSeamailUserListCtrl', ($log, $scope) => {
	$scope.userList = { closed: true };

	if ($scope.listView === undefined) {
		$scope.listView = false;
	}

	$scope.toggle = (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		$scope.userList.closed = !$scope.userList.closed;
	};
})
.controller('CMSeamailCtrl', ($interval, $ionicPopover, $ionicPopup, $ionicScrollDelegate, $log, $q, $scope, $stateParams, SettingsService, Twitarr, UserService) => {
	$log.info('CMSeamailCtrl Initializing.');

	$scope.userListTemplate = userListTemplate;
	$scope.user = UserService.get();
	$scope.seamail = undefined;
	$scope.newMessage = { text: undefined };

	let interval, inView = false;
	const startRefresh = () => {
		//$log.warn('CMSeamilCtrl.startRefresh()');
		if (inView && !interval) {
			$scope.doRefresh().then(() => {
				SettingsService.getBackgroundInterval().then((bgi) => {
					//$log.warn('bgi='+bgi);
					interval = $interval($scope.doRefresh, bgi * 1000);
				});
			});
		}
	};

	const stopRefresh = () => {
		if (interval) {
			$interval.cancel(interval);
			interval = undefined;
		}
	};

	$scope.postMessage = () => {
		$scope.user = UserService.get();
		if (!$scope.user.loggedIn) {
			$log.debug('Can\'t post message while not logged in!');
			$ionicPopup.alert({
				title: 'Not Logged In',
				template: 'You must be logged in to post a seamail.'
			});
			return;
		}

		$log.debug('posting seamail message: ' + angular.toJson($scope.newMessage.text));
		if ($scope.newMessage && $scope.newMessage.text && $scope.newMessage.text !== '') {
			Twitarr.postSeamailMessage($scope.seamail.id, $scope.newMessage.text).then(() => {
				$scope.newMessage = { text: undefined };
				$scope.doRefresh();
				$ionicScrollDelegate.$getByHandle('seamail').scrollTop();
				$scope.$broadcast('scroll.refreshComplete');
			});
		} else {
			$ionicPopup.alert({
				title: 'Invalid Message',
				template: 'Please enter something to post. ;)'
			});
		}
	};

	const popover = $ionicPopover.fromTemplate('<ion-popover-view class="fit seamail"><span ng-include="userListTemplate"></span></ion-popover-view>', { scope: $scope });
	popover.scope.listView = true;

	$scope.openUserList = (ev) => {
		popover.show(ev);
	};

	$scope.doRefresh = () => {
		if (!UserService.loggedIn()) {
			$log.info('CMSeamailCtrl.doRefresh(): not logged in');
			stopRefresh();
			$scope.seamail = undefined;
			$scope.$broadcast('scroll.refreshComplete');
			return $q.when();
		}
		$log.info('CMSeamailCtrl.doRefresh()');
		$scope.user = UserService.get();
		return Twitarr.getSeamailMessages($stateParams.id).then((res) => {
			if (res.seamail && res.seamail.messages) {
				res.seamail.messages = res.seamail.messages.reverse();
				$scope.seamail = res.seamail;
				//$log.debug('seamail=' + angular.toJson($scope.seamail));
				//$ionicScrollDelegate.$getByHandle('seamail').scrollTop();
				//$scope.$broadcast('scroll.refreshComplete');
			}
			return res;
		}).finally(() => {
			$scope.$broadcast('scroll.refreshComplete');
			$scope.$broadcast('cruisemonkey.notify.refreshSeamails');
		});
	};

	$scope.$on('cruisemonkey.user.updated', $scope.doRefresh);

	$scope.$on('$ionicView.beforeEnter', (/* ev, info */) => {
		inView = true;
		startRefresh();
	});
	$scope.$on('$ionicView.beforeLeave', (/* ev, info */) => {
		stopRefresh();
		inView = false;
	});
	$scope.$on('cruisemonkey.app.paused', stopRefresh);
	$scope.$on('cruisemonkey.app.locked', stopRefresh);
	$scope.$on('cruisemonkey.app.resumed', startRefresh);
})
.controller('CMSeamailsCtrl', ($interval, $ionicLoading, $ionicScrollDelegate, $log, $q, $rootScope, $scope, NewSeamail, SeamailService, SettingsService, UserService) => {
	$log.info('CMSeamailsCtrl Initializing.');

	$scope.userListTemplate = userListTemplate;
	$scope.user = UserService.get();
	$scope.unread = 0;

	let interval, inView = false;
	const startRefresh = () => {
		//$log.warn('CMSeamailsCtrl.startRefresh()');
		if (inView) {
			$scope.doRefresh();
			SettingsService.getBackgroundInterval().then((bgi) => {
				//$log.warn('bgi='+bgi);
				interval = $interval($scope.doRefresh, bgi * 1000);
			});
		}
	};

	const stopRefresh = () => {
		if (interval) {
			$interval.cancel(interval);
			interval = undefined;
		}
	};

	const updateUnread = () => {
		if (!$scope.seamails) {
			return;
		}
		let count = 0;
		for (let s=0, len=$scope.seamails.length, seamail; s < len; s++) {
			seamail = $scope.seamails[s];
			if (seamail.is_unread) {
				count++;
			}
		}
		$scope.unread = count;
		$rootScope.$broadcast('cruisemonkey.notify.tabs.showSeamails', count > 0);
	};
	updateUnread();

	$scope.scrollTop = () => {
		$ionicScrollDelegate.$getByHandle('seamails').scrollTop();
	};

	$scope.doRefresh = () => {
		if (!UserService.loggedIn()) {
			$log.info('CMSeamailsCtrl.doRefresh(): not logged in');
			stopRefresh();
			$scope.seamail = [];
			$scope.$broadcast('scroll.refreshComplete');
			return;
		}
		$log.info('CMSeamailsCtrl.doRefresh()');
		$scope.user = UserService.get();
		$q.all({
			twitarrRoot: SettingsService.getTwitarrRoot(),
			seamails: SeamailService.list()
		}).then((res) => {
			$scope.twitarrRoot = res.twitarrRoot;
			$scope.seamails = res.seamails;
		}, (err) => {
			$log.error('Failed to get seamails: ' + angular.toJson(err));
			return $q.reject(err);
		}).finally(() => {
			updateUnread();
			$ionicLoading.hide();
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.newSeamail = (ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		NewSeamail.open();
	};

	$scope.$on('modal.hidden', () => {
		updateUnread();
	});

	$scope.$on('cruisemonkey.notify.refreshSeamails', () => {
		$scope.doRefresh();
	});

	$scope.$on('cruisemonkey.user.updated', (ev, user) => {
		$scope.doRefresh(user);
	});
	$scope.$on('cruisemonkey.wipe-cache', () => {
		$scope.doRefresh();
	});
	$scope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
		if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
			$scope.doRefresh();
		}
	});

	$scope.$on('$ionicView.beforeEnter', (/* ev, info */) => {
		inView = true;
		if ($scope.user.loggedIn && (!$scope.seamails || $scope.seamails.length === 0)) {
			$ionicLoading.show({
				template: 'Loading...',
				duration: 5000,
				noBackdrop: true
			});
		}
		startRefresh();
	});
	$scope.$on('$ionicView.beforeLeave', (/* ev, info */) => {
		stopRefresh();
		inView = false;
	});
	$scope.$on('cruisemonkey.app.paused', stopRefresh);
	$scope.$on('cruisemonkey.app.locked', stopRefresh);
	$scope.$on('cruisemonkey.app.resumed', startRefresh);
});
