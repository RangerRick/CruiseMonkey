(function() {
	'use strict';

	/*global ionic: true*/
	/*global moment: true*/
	/*global Modernizr: true*/
	/*global CMEvent: true*/
	/*global CMFavorite: true*/
	/*global CMDay: true*/

	var attrA, attrB;

	var sortEvent = function(a,b) {
		attrA = a.getStart();
		attrB = b.getStart();

		if (attrA.isBefore(attrB)) {
			return -1;
		}
		if (attrA.isAfter(attrB)) {
			return 1;
		}

		attrA = a.getSummary().toLowerCase();
		attrB = b.getSummary().toLowerCase();

		if (attrA > attrB) { return 1; }
		if (attrA < attrB) { return -1; }

		attrA = a.getEnd();
		attrB = b.getEnd();

		if (attrA.isBefore(attrB)) { return -1; }
		if (attrA.isAfter(attrB)) { return 1; }

		return 0;
	};
	var sortDay = function(a,b) {
		attrA = a.day;
		attrB = b.day;

		if (attrA.isBefore(attrB)) {
			return -1;
		}
		if (attrA.isAfter(attrB)) {
			return 1;
		}
		return 0;
	};
	var sortFunc = function(a,b) {
		if (a.day !== undefined) {
			return sortDay(a,b);
		} else {
			return sortEvent(a,b);
		}
	};

	angular.module('cruisemonkey.controllers.Events', [
		'ui.router',
		'ionic',
		'angularLocalStorage',
		'cruisemonkey.User',
		'cruisemonkey.Events'
	])
	.filter('eventFilter', function() {
		return function(cmEvent, searchString) {
			var allArray = [], ret = [];
			angular.forEach(cmEvent, function(obj, index) {
				//console.log('eventFilter: obj=',obj);
				if (obj instanceof CMDay) {
					allArray.push(obj);
				} else if (obj && obj.matches(searchString)) {
					allArray.push(obj);
				}
			});
			for (var i=0; i < allArray.length; i++) {
				if (allArray[i+1] && allArray[i] instanceof CMDay && allArray[i+1] instanceof CMDay) {
					// this is a day header, and the next is a day header, do nothing
				} else {
					ret.push(allArray[i]);
				}
			}
			if (ret.length > 0 && ret[ret.length-1] instanceof CMDay) {
				ret.pop();
			}
			return ret;
		};
	})
	.controller('CMEditEventCtrl', ['$q', '$scope', '$rootScope', 'UserService', function($q, $scope, $rootScope, UserService) {
		console.log('Initializing CMEditEventCtrl');

		if ($rootScope.editEvent) {
			$scope.event = $rootScope.editEvent.toEditableBean();
			delete $rootScope.editEvent;

			console.log('Found existing event to edit.');
		} else {
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().add(1, 'hours'));
			ev.setUsername(UserService.getUsername());
			ev.setPublic(true);
			$scope.event = ev.toEditableBean();

			console.log('Created fresh event.');
		}
	}])
	.controller('CMEventsBarCtrl', ['$scope', '$timeout', '$state', 'UserService', 'storage', function($scope, $timeout, $state, UserService, storage) {
		$scope.loggedIn = UserService.get().loggedIn;

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser) {
			$scope.loggedIn = newUser.loggedIn;
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			if (info.stateName && info.stateName.startsWith('app.events')) {
				$scope.eventType  = info.stateName.replace('app.events.', '');
				$scope.eventTitle = ($scope.eventType === 'my'? 'Mine' : $scope.eventType.capitalize());
			}
		});
	}])
	.controller('CMEventCtrl', ['$q', '$scope', '$rootScope', '$sce', '$timeout', '$cordovaKeyboard', '$ionicActionSheet', '$ionicScrollDelegate', '$ionicPopover', '$ionicModal', 'storage', 'EventService', 'UserService', function($q, $scope, $rootScope, $sce, $timeout, $cordovaKeyboard, $ionicActionSheet, $ionicScrollDelegate, $ionicPopover, $ionicModal, storage, EventService, UserService) {
		var withDays = function(events) {
			var ret = [],
				ev, i,
				lastDay = moment('1970-01-01 00:00'),
				currentDay = null;

			for (i=0; i < events.length; i++) {
				ev = events[i];
				currentDay = ev.getDay();
				if (!lastDay.isSame(currentDay)) {
					ret.push(new CMDay(currentDay));
					lastDay = currentDay;
				}
				ret.push(ev);
			}

			return ret;
		};

		var findElementById = function(id) {
			var elm, scrollEl, position = 0;
			elm = document.getElementById(id);
			if (elm) {
				scrollEl = angular.element(elm);
				while (scrollEl) {
					if (scrollEl.hasClass('scroll-content')) {
						break;
					}
					var offsetTop = scrollEl[0].offsetTop,
						scrollTop = scrollEl[0].scrollTop,
						clientTop = scrollEl[0].clientTop;
					position += (offsetTop - scrollTop + clientTop);
					scrollEl = scrollEl.parent();
				}
				console.log('offset='+position);
				return position;
				/* $scope.$broadcast('scroll.scrollTo', 0, position, true); */
			} else {
				console.log("can't find element " + id);
				return 0;
			}
		};

		$scope.getDateId = function(date) {
			return 'date-' + date.unix();
		};

		$scope.isDay = function(entry) {
			return entry && entry.day !== undefined;
		};

		$scope.prettyDate = function(date) {
			return date? date.format('dddd, MMMM Do') : undefined;
		};

		$scope.fuzzy = function(date) {
			return date? date.fromNow() : undefined;
		};

		$scope.justTime = function(date) {
			return date? date.format('hh:mma') : undefined;
		};

		$scope.goToNow = function() {
			$timeout(function() {
				var id, nextEvent = EventService.getNextEvent($scope.filteredEvents[$scope.eventType]);
				console.log('next event=', nextEvent);
				if (nextEvent) {
					id = $scope.eventType + '-' + nextEvent.getId();
					var idLocation = findElementById(id);
					console.log('scrolling to id location: ' + idLocation);
					$ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll').scrollTo(0, idLocation);
				} else {
					$ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll').scrollBottom();
				}
			});
		};

		$scope.onFavoriteChanged = function(ev) {
			$scope.$evalAsync(function() {
				var i, entry, eventId = ev.getId();
				console.log('CMEventCtrl.onFavoriteChanged(' + eventId + ')');

				if (ev.isFavorite()) {
					// Event was favorited, unfavorite it
					ev.setFavorite(undefined);

					EventService.removeFavorite(eventId).then(function() {
						_refreshEvents();
					});
				} else {
					var existing;
					for (i=0; i < $scope.allEvents.length; i++) {
						entry = $scope.allEvents[i];
						if (entry.getId() === eventId) {
							existing = entry;
							break;
						}
					}

					if (!existing) {
						console.log('Somehow favorited an event that does not exist! (' + eventId + ')');
						return;
					}

					// Add a temporary favorite object so the UI updates
					existing.setFavorite(new CMFavorite());

					EventService.addFavorite(eventId).then(function(fav) {
						_refreshEvents();
					}, function() {
						_refreshEvents();
						$scope.$broadcast('cruisemonkey.notify.alert', { message: 'Failed to favorite ' + ev.getSummary() + '!' });
					});
				}
			});
		};

		$scope.loggedIn = function() {
			var user = UserService.get();
			return user && user.username && user.loggedIn;
		};

		$ionicModal.fromTemplateUrl('template/event-edit.html', {
			scope: $scope,
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			$scope.modal = modal;

			$scope.$watch('eventData', function(ev) {
				if (ev) {
					var startDate = moment(ev.startDate);
					var endDate = moment(ev.endDate);
					if (endDate.isBefore(startDate)) {
						console.log('end date ' + endDate.format() + ' is before start date ' + startDate.format());
						$scope.modal.eventData.endDate = angular.copy(ev.startDate);
					}
				}
			});
		});

		$scope.cancelModal = function(e) {
			e.preventDefault();
			e.stopPropagation();

			console.log('closing modal (cancel)');
			$scope.event = undefined;
			$scope.eventData = undefined;
			$scope.modal.hide();
			$scope.closeKeyboard();
		};

		$scope.saveModal = function(data) {
			console.log('closing modal (save)');

			var username = UserService.getUsername();

			if (!username) {
				console.log('No username!');
				$scope.modal.hide();
				$scope.closeKeyboard();
				return;
			}

			if (!data.isValid()) {
				console.log('Cannot save, bean is invalid:',data);
				return;
			}

			var ev = $scope.event;
			ev.fromEditableBean(data);
			ev.setUsername(username);

			console.log('saving=', ev.getRawData());

			if (ev.getRevision()) {
				// updating an existing event
				$q.when(EventService.updateEvent(ev)).then(function(res) {
					console.log('event updated:', res);
					$scope.modal.hide();
				});
			} else {
				// saving a new event
				$q.when(EventService.addEvent(ev)).then(function(res) {
					console.log('event added:', res);
					$scope.modal.hide();
				});
			}
		};

		$scope.addEvent = function() {
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().clone());
			ev.setEnd(ev.getEnd().add(1, 'hours'));
			ev.setUsername(UserService.getUsername());
			ev.setPublic(true);

			$scope.event = ev;
			$scope.eventData = ev.toEditableBean();

			$scope.modal.show();
		};

		$ionicPopover.fromTemplateUrl('template/event-popover.html').then(function(popover) {
			$scope.popover = popover;
		});

		$scope.trash = function(ev) {
			if (window.confirm('Are you sure you want to delete "' + ev.getSummary() + '"?')) {
				EventService.removeEvent(ev).then(function() {
					_refreshEvents();
				});
			}
		};

		$scope.togglePublic = function(ev) {
			console.log('togglePublic(' + ev.getId() + ')');
			$scope.$evalAsync(function() {
				ev.setPublic(!ev.isPublic());
				EventService.updateEvent(ev).then(function() {
					_refreshEvents();
				});
			});
		};

		$scope.editEvent = function(ev) {
			$scope.$evalAsync(function() {
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$scope.modal.show();
			});
		};

		$scope.openPopover = function($event, entry) {
			var user = UserService.get();
			if (!user.username || user.username !== entry.getUsername()) {
				return;
			}

			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: entry.isPublic()? 'Make Private':'Make Public' },
					{ text: 'Edit' }
				],
				destructiveText: 'Delete',
				cancelText: 'Cancel',
				destructiveButtonClicked: function() {
					hideSheet();
					$scope.trash(entry);
				},
				buttonClicked: function(index) {
					if (index === 0) {
						hideSheet();
						$scope.togglePublic(entry);
					} else if (index === 1) {
						hideSheet();
						$scope.editEvent(entry);
					} else {
						console.log('Controller.Events.openPopover: unhandled index ' + index);
					}
				}
			});
		};

		$scope.onSearchChanged = function(searchString) {
			var delegate = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
			if (delegate.getScrollPosition().top !== 0) {
				delegate.scrollTop(false);
			}
		};

		$scope.scrollTop = function() {
			var delegate = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
			delegate.scrollTop(true);
		};

		var _refreshEvents = function() {
			$scope.user = UserService.get();
			//console.log('CMEventCtrl._refreshEvents()');
			EventService.getAllEvents().then(function(events) {
				events.sort(sortEvent);
				$scope.allEvents = events;
				console.log('CMEventCtrl._refreshEvents: found ' + $scope.allEvents.length + ' total events.');
			}, function(err) {
				console.log('CMEventCtrl._refreshEvents(): WARNING: ' + err);
			});
		};

		var _refreshDelayTimeout = null;
		var _refreshDelayed = function(delay) {
			if (_refreshDelayTimeout) {
				return;
			}
			_refreshDelayTimeout = $timeout(function() {
				console.log('CMEventCtrl._refreshDelayed()');
				_refreshDelayTimeout = null;
				_refreshEvents();
			}, delay || 300);
		};

		var _updatingFilter = false;
		var _updateFilter = function() {
			if (_updatingFilter || !$scope.allEvents) {
				return;
			}

			_updatingFilter = true;

			var filteredEvents = {
				official: [],
				unofficial: [],
				all: [],
				my: []
			}, ev, i;
			var user = UserService.get();

			for (i=0; i < $scope.allEvents.length; i++) {
				ev = $scope.allEvents[i];

				// official
				if (ev.getUsername() === 'official') {
					filteredEvents.official.push(ev);
				}

				// unofficial
				if (ev.isPublic() && ev.getUsername() !== 'official') {
					filteredEvents.unofficial.push(ev);
				}

				// all
				if (ev.isPublic()) {
					filteredEvents.all.push(ev);
				} else if (ev.getUsername() === user.username) {
					filteredEvents.all.push(ev);
				}

				// my
				if (ev.getUsername() === user.username) {
					filteredEvents.my.push(ev);
				} else if (ev.isPublic() && ev.isFavorite()) {
					filteredEvents.my.push(ev);
				}
			}

			/*
			console.log('CMEventCtrl._updateFilter: official events: ' + filteredEvents.official.length);
			console.log('CMEventCtrl._updateFilter: unofficial events: ' + filteredEvents.unofficial.length);
			console.log('CMEventCtrl._updateFilter: all events: ' + filteredEvents.all.length);
			console.log('CMEventCtrl._updateFilter: my events: ' + filteredEvents.my.length);
			*/

			filteredEvents.official   = withDays(filteredEvents.official);
			filteredEvents.unofficial = withDays(filteredEvents.unofficial);
			filteredEvents.all        = withDays(filteredEvents.all);
			filteredEvents.my         = withDays(filteredEvents.my);

			$scope.filteredEvents = filteredEvents;

			$timeout(function() {
				$ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll').resize();
			});

			_updatingFilter = false;
		};

		$scope.$watchCollection('allEvents', function() {
			_updateFilter();
		});

		/** CruiseMonkey events **/

		$scope.$on('cruisemonkey.database.syncComplete', function(ev, db) {
			console.log('CMEventCtrl: Sync complete: ' + db.name);
			_refreshDelayed(100);
		});
		$scope.$on('cruisemonkey.database.change', function(ev, db, doc) {
			_refreshDelayed(1000);
		});

		/** Ionic Events **/
		$scope.$on('popover.hidden', function() {
			console.log('popover.hidden');
		});
		$scope.$on('popover.removed', function() {
			console.log('popover.removed');
		});
		$scope.$on('$destroy', function() {
			$scope.popover.remove();
		});

		$scope.$on('$ionicView.loaded', function(ev, info) {
			var defaultSearchString = {
				'official': '',
				'unofficial': '',
				'all': '',
				'my': ''
			};
			storage.bind($scope, 'searchString', {
				'defaultValue': defaultSearchString,
				'storeName': 'cruisemonkey.events.search-string'
			});
			if (!$scope.searchString || !$scope.searchString.official) {
				$scope.searchString = defaultSearchString;
			}
		});
		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			_refreshEvents();
		});
	}]);
}());
