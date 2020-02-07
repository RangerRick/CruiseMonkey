const datetime = require('../util/datetime'),
	model = require('../data/Model'),
	CMEvent = model.CMEvent,
	CMDay = model.CMDay;

require('ionic-filter-bar');
require('ion-sticky');
require('ngstorage');

const boatImage = require('../data/boat.svg').default;

const templates = { eventsChooser: require('./chooser.html') };

const withDays = (events) => {
	const ret = [];
	let lastDay = datetime.create('1970-01-01 00:00'),
		currentDay = null,
		even = true;

	for (let i=0, len=events.length, ev; i < len; i++) {
		ev = events[i];
		currentDay = ev.getDay();
		if (!lastDay.isSame(currentDay)) {
			ret.push(new CMDay(currentDay));
			lastDay = currentDay;
			even = true;
		}
		even = !even;
		ev.setEven(even);
		ret.push(ev);
	}

	return ret;
};

const findElementById = (id) => {
	/* eslint-disable no-console */
	let scrollEl, position = 0;
	const elm = document.getElementById(id);
	if (elm) {
		scrollEl = angular.element(elm);
		while (scrollEl) {
			if (scrollEl.hasClass('scroll-content')) {
				break;
			}
			const offsetTop = scrollEl[0].offsetTop,
				scrollTop = scrollEl[0].scrollTop,
				clientTop = scrollEl[0].clientTop;
			position += offsetTop - scrollTop + clientTop;
			scrollEl = scrollEl.parent();
		}
		if (position < 10) {
			return 0;
		}
		return position;
		/* $scope.$broadcast('scroll.scrollTo', 0, position, true); */
	} else {
		console.warn('can\'t find element ' + id);
		return 0;
	}
	/* eslint-enable no-console */
};

angular.module('cruisemonkey.controllers.Events', [
	'ngStorage',
	'ui.router',
	'ionic',
	'ion-sticky',
	'jett.ionic.filter.bar',
	'cruisemonkey.Events',
	'cruisemonkey.user.User'
])
.filter('eventFilter', () => {
	return (cmEvents, searchString) => {
		const matches = cmEvents.filter((ev) => {
			if (ev instanceof CMDay) {
				return false;
			}
			return ev instanceof CMEvent && ev.matches(searchString);
		});
		return withDays(matches);
	};
})
.controller('CMEventsCtrl', ($filter, $ionicFilterBar, $ionicLoading, $ionicPopover, $ionicScrollDelegate, $localStorage, $log, $q, $scope, $timeout, EventService, UserService) => {
	$log.info('Initializing CMEventsCtrl');

	const defaultEventType = 'all';
	let firstRefresh = true;

	$scope.eventTypes = ['official', 'shadow', 'all'];
	$scope.user = {};
	$scope.u = UserService;
	$scope.officialIcon = boatImage;

	$scope.$storage = $localStorage;

	const getEventType = () => {
		return $scope.$storage && $scope.$storage['cruisemonkey.events.type'] ? $scope.$storage['cruisemonkey.events.type'] : defaultEventType;
	}

	$scope.getEventTypeDescription = () => {
		return getEventType() === 'followed'? 'Followed' : getEventType().capitalize();
	};

	let filterBarInstance;

	const popover = $ionicPopover.fromTemplateUrl(templates['eventsChooser'], { scope: $scope });

	$scope.showFilterBar = () => {
		filterBarInstance = $ionicFilterBar.show({
			items: $scope.events,
			debounce: true,
			filter: $filter('eventFilter'),
			update: function (filteredItems, filterText) {
				$scope.searchString = filterText;
				$scope.events = filteredItems;
			}
		});
	};

	$scope.openEventTypePopover = (ev) => {
		popover.then((p) => {
			p.show(ev);
		});
	};

	$scope.setEventType = (type) => {
		popover.then((p) => {
			p.hide();
		});
		if (getEventType() !== type) {
			$scope.$storage['cruisemonkey.events.type'] = type;
			$scope.doRefresh().then(() => {
				$timeout(() => {
					$scope.goToNow();
				});
			});
		}
	};

	$scope.currentEvents = [];

	$scope.doRefresh = (cached) => {
		if (!$scope.isVisible) {
			return $q.when();
		}

		const now = datetime.moment();
		const currentEvents = [];

		const deferred = $q.defer();
		$scope.$evalAsync(() => {
			const user = UserService.get();
			if (user && user.loggedIn) {
				$scope.eventTypes = ['all', 'official', 'shadow', 'followed'];
			} else {
				$scope.eventTypes = ['all', 'official', 'shadow'];
			}
			if ($scope.eventTypes.indexOf(getEventType()) < 0) {
				// logged out, maybe it's a hidden type
				$scope.$storage['cruisemonkey.events.type'] = defaultEventType;
			}
			$scope.user = user;

			let evFunction = EventService.getOfficialEvents;
			switch(getEventType()) {
				case 'all':
					evFunction = EventService.getAllEvents;
					break;
				case 'shadow':
					evFunction = EventService.getUnofficialEvents;
					break;
				case 'followed':
					evFunction = EventService.getFollowedEvents;
					break;
			}

			$log.debug('doRefresh(' + cached + ')');
			evFunction(cached).then((events) => {
				$log.debug('got ' + (events ? events.length : 0 ) + ' events');
				//$log.debug('refresh(): events = ' + angular.toJson(events));
				for (let i=0, len=events.length, e; i < len; i++) {
					e = events[i];
					if (e.matchesDate(now)) {
						currentEvents.push(e.getId());
					}
				}

				$scope.events = withDays(events);
				if (filterBarInstance) {
					filterBarInstance();
				}
				if (firstRefresh) {
					firstRefresh = false;
					$timeout(() => {
						$scope.goToNow();
					}, 500);
				}
				$scope.$broadcast('scroll.refreshComplete');
			}).finally(() => {
				//$log.warn('current events: ' + angular.toJson(currentEvents));
				$scope.currentEvents = currentEvents;
				$ionicLoading.hide();
				deferred.resolve();
			});
		});
		return deferred.promise;
	};

	let _refreshDelayTimeout = null;
	$scope.refreshDelayed = (delay) => {
		$log.debug('CMEventsCtrl.$scope.refreshDelayed()');
		if (_refreshDelayTimeout) {
			return;
		}
		_refreshDelayTimeout = $timeout(() => {
			_refreshDelayTimeout = null;
			$scope.doRefresh();
		}, delay || 300);
	};

	$scope.showFollowed = (/* entry */) => {
		if (!$scope.user.loggedIn) {
			return false;
		}
		return true;
	};
	$scope.showEditable = (/* entry */) => {
		return false;
	};

	$scope.getCssClass = (entry) => {
		let ret = '';
		if (entry.isOfficial()) {
			ret += ' official';
		} else {
			ret += ' unofficial';
		}
		if (entry.isEven()) {
			ret += ' even';
		} else {
			ret += ' odd';
		}
		return ret;
	}

	$scope.getDateId = (date) => {
		return 'date-' + date.unix();
	};

	$scope.isDay = (entry) => {
		return entry && entry.day !== undefined;
	};

	$scope.prettyDate = (date) => {
		return date? date.format('dddd, MMMM Do') : undefined;
	};

	$scope.fuzzy = (date) => {
		return date? date.fromNow() : undefined;
	};

	$scope.justTime = (date) => {
		return date? date.format('hh:mma') : undefined;
	};

	$scope.toggleFollowed = (ev) => {
		const eventId = ev.getId();
		$log.debug('CMEventCtrl.toggleFollowed(' + eventId + ')');

		if (ev.isFollowed()) {
			ev.unfollow();
			EventService.unfollow(ev).finally(() => {
				$scope.refreshDelayed(1000);
			});
		} else {
			ev.follow();
			EventService.follow(ev).finally(() => {
				$scope.refreshDelayed(1000);
			});
		}
	};

	$scope.scrollTop = (ev) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		$ionicScrollDelegate.$getByHandle('event-scroll').scrollTop();
	};

	$scope.goToNow = (ev, animate) => {
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		//$timeout(() => {
		$scope.$evalAsync(() => {
			const delegate = $ionicScrollDelegate.$getByHandle('event-scroll');

			let idLocation,
				nextEvent = EventService.getNextEvent($scope.events);

			if ($scope.events && nextEvent) {
				$log.debug('next event=' + nextEvent.toString());
				for (let i=0, len=$scope.events.length, event; i < len; i++) {
					event = $scope.events[i];
					if (event.getId() === nextEvent.getId() && i > 0 && $scope.events[i-1] instanceof CMDay) {
						$log.debug('event is the first of the day, scrolling to the day marker instead');
						nextEvent = $scope.events[i-1];
						break;
					}
				}

				idLocation = findElementById(nextEvent.getId());
				if (!(nextEvent instanceof CMDay)) {
					$log.debug('event is not the first of the day, giving extra space for the sticky header');
					idLocation = Math.max(0, idLocation - 32);
				}

				$log.debug('scrolling to id location: ' + idLocation);
				delegate.scrollTo(0, idLocation, animate);
			} else {
				delegate.scrollBottom(animate);
			}
		});
	};

	$scope.$on('cruisemonkey.user.updated', $scope.doRefresh);
	$scope.$on('cruisemonkey.notify.eventAdded', $scope.doRefresh);
	$scope.$on('cruisemonkey.notify.eventUpdated', $scope.doRefresh);
	$scope.$on('$ionicView.beforeEnter', () => {
		$scope.isVisible = true;
		if (!$scope.events) {
			$ionicLoading.show({
				template: 'Loading...',
				duration: 5000,
				noBackdrop: true
			});
		}
		// start from the cache
		$scope.doRefresh(true);
		// then asynchronously do a full refresh to get updates
		$scope.$evalAsync(() => {
			$scope.doRefresh(false);
		});
	});
	$scope.$on('$ionicView.afterLeave', () => {
		$scope.isVisible = false;
	});
	$scope.$on('$ionicView.unloaded', () => {
		delete $scope.events;
		delete $scope.users;
	});
})
;
