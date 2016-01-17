(function() {
	'use strict';

	var angular = require('angular'),
		moment = require('moment'),
		model = require('../data/Model'),
		CMEvent = model.CMEvent,
		CMDay = model.CMDay;

	require('moment-timezone');
	require('ionic-filter-bar');

	var templates = {
		'eventsChooser': require('ngtemplate!html!./chooser.html'),
		'eventEdit': require('ngtemplate!html!./edit.html')
	};

	var withDays = function(events) {
		var ret = [],
			lastDay = moment('1970-01-01 00:00'),
			currentDay = null,
			even = true;

		for (var i=0, len=events.length, ev; i < len; i++) {
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

	var sortEvent = function(a,b) {
		var attrA = a.getStart(),
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
		var attrA = a.day,
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

	var findElementById = function(id) {
		/* eslint-disable no-console */
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
				position += offsetTop - scrollTop + clientTop;
				scrollEl = scrollEl.parent();
			}
			//console.log('offset='+position);
			if (position < 10) {
				return 0;
			}
			return position;
			/* $scope.$broadcast('scroll.scrollTo', 0, position, true); */
		} else {
			console.log('can\'t find element ' + id);
			return 0;
		}
		/* eslint-enable no-console */
	};

	angular.module('cruisemonkey.controllers.Events', [
		'ui.router',
		'ionic',
		'jett.ionic.filter.bar',
		'cruisemonkey.DB',
		'cruisemonkey.user.User',
		'cruisemonkey.Events'
	])
	.filter('eventFilter', function($log) {
		return function(cmEvents, searchString) {
			var matches = cmEvents.filter(function(ev) {
				if (ev instanceof CMDay) {
					return false;
				}
				return ev instanceof CMEvent && ev.matches(searchString);
			});
			return withDays(matches);
		};
	})
	.controller('CMEditEventCtrl', function($log, $q, $rootScope, $scope, UserService) {
		$log.info('Initializing CMEditEventCtrl');

		if ($rootScope.editEvent) {
			$scope.event = $rootScope.editEvent.toEditableBean();
			delete $rootScope.editEvent;

			$log.info('Found existing event to edit.');
		} else {
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().add(1, 'hours'));
			ev.setUsername(UserService.getUsername());
			ev.setVisibility('all');
			$scope.event = ev.toEditableBean();

			$log.info('Created fresh event.');
		}
	})
	.controller('CMEventsCtrl', function($filter, $ionicActionSheet, $ionicFilterBar, $ionicModal, $ionicPopover, $ionicScrollDelegate, $log, $q, $scope, $state, $timeout, EventService, kv, UserService) {
		var defaultEventType = 'official';
		$scope.eventType = defaultEventType;
		$scope.eventTypes = ['official', 'unofficial', 'all'];
		$scope.events = [];
		$scope.searchString = '';
		$scope.user = {};
		$scope.u = UserService;

		var filterBarInstance;

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser) {
			$scope.refresh();
		});

		var popover = $ionicPopover.fromTemplateUrl(templates['eventsChooser'], {
			scope: $scope
		});

		kv.get('cruisemonkey.events.event-type').then(function(et) {
			$scope.setEventType(et || defaultEventType);
		}, function() {
			$scope.setEventType(defaultEventType);
		});

		var updateSearchString = function(searchString) {
			$scope.searchString = searchString;
			if ($scope.searchString === undefined) {
				return kv.remove('cruisemonkey.events.search-string');
			} else {
				return kv.set('cruisemonkey.events.search-string', $scope.searchString);
			}
		};

		$scope.showFilterBar = function() {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.events,
				debounce: true,
				filter: $filter('eventFilter'),
				update: function (filteredItems, filterText) {
					updateSearchString(filterText);
					$scope.events = filteredItems;
					if (filterText) {
						$log.debug('Event filter: ' + filterText);
					}
				}
			});
		};

		$scope.openEventTypePopover = function(ev) {
			popover.then(function(p) {
				p.show(ev);
			});
		};

		$scope.setEventType = function(type) {
			popover.then(function(p) {
				p.hide();
			});
			if ($scope.eventType !== type) {
				kv.set('cruisemonkey.events.event-type', type).then(function() {
					$scope.eventType = type;
					$scope.refresh();
				});
			}
		};

		$scope.refresh = function() {
			var user = UserService.get();
			if (user && user.loggedIn) {
				$scope.eventTypes = ['official', 'unofficial', 'all', 'my'];
			} else {
				$scope.eventTypes = ['official', 'unofficial', 'all'];
			}
			if ($scope.eventTypes.indexOf($scope.eventType) < 0) {
				// logged out, maybe it's a hidden type
				$scope.eventType = defaultEventType;
			}
			$scope.user = user;

			var evFunction = EventService.getOfficialEvents;
			switch($scope.eventType) {
				case 'all':
					evFunction = EventService.getAllEvents;
					break;
				case 'unofficial':
					evFunction = EventService.getUnofficialEvents;
					break;
				case 'my':
					evFunction = EventService.getMyEvents;
					break;
			}
			evFunction().then(function(events) {
				//$log.debug('refresh(): events = ' + angular.toJson(events));
				$scope.events = withDays(events);
				if (filterBarInstance) {
					filterBarInstance();
				}
			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		};

		var _refreshDelayTimeout = null;
		$scope.refreshDelayed = function(delay) {
			if (_refreshDelayTimeout) {
				return;
			}
			_refreshDelayTimeout = $timeout(function() {
				$log.debug('CMEventsCtrl.$scope.refreshDelayed()');
				_refreshDelayTimeout = null;
				$scope.refresh();
			}, delay || 300);
		};

		$scope.showFavorite = function(entry) {
			if (!$scope.user.loggedIn) {
				return false;
			}
			if ($scope.user.username === entry.getUsername()) {
				return false;
			}
			return true;
		};
		$scope.showEditable = function(entry) {
			if ($scope.user && $scope.user.username === entry.getUsername() && $scope.user.loggedIn) {
				return true;
			}
			return false;
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

		/** Adding/Editing Events **/

		$ionicModal.fromTemplateUrl(templates['eventEdit'], {
			scope: $scope,
			animation: 'slide-in-up',
			focusFirstInput: true
		}).then(function(modal) {
			$scope.editEventModal = modal;

			$scope.$watch('eventData', function(ev) {
				if (ev) {
					var startDate = moment(ev.startDate);
					var endDate = moment(ev.endDate);
					if (endDate.isBefore(startDate)) {
						$log.error('end date ' + endDate.format() + ' is before start date ' + startDate.format());
						$scope.editEventModal.eventData.endDate = angular.copy(ev.startDate);
					}
				}
			});
		});

		$scope.cancelModal = function(e) {
			e.preventDefault();
			e.stopPropagation();

			$log.debug('closing modal (cancel)');
			$scope.closeKeyboard();
			$scope.editEventModal.hide().then(function() {
				$scope.event = undefined;
				$scope.eventData = undefined;
			});
		};

		$scope.saveModal = function(data) {
			$log.debug('closing modal (save)');

			var username = UserService.getUsername();

			if (!username) {
				$log.error('No username!');
				$scope.closeKeyboard();
				$scope.editEventModal.hide();
				return;
			}

			if (!data.isValid()) {
				$log.error('Cannot save, bean is invalid:' + angular.toJson(data));
				return;
			}

			var ev = $scope.event;
			ev.fromEditableBean(data);
			ev.setUsername(username);

			$log.debug('saving=' + angular.toJson(ev.getRawData()));

			if (ev.getId()) {
				// updating an existing event
				$q.when(EventService.updateEvent(ev)).then(function(res) {
					$log.debug('event updated: ' + angular.toJson(res));
					$scope.editEventModal.hide().then(function() {
						$scope.refreshDelayed(100);
					});
				});
			} else {
				// saving a new event
				$q.when(EventService.addEvent(ev)).then(function(res) {
					$log.debug('event added: ' + angular.toJson(res));
					$scope.editEventModal.hide().then(function() {
						$scope.refreshDelayed(100);
					});
				});
			}
		};

		$scope.addEvent = function() {
			$log.debug('addEvent()');
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().clone());
			ev.setEnd(ev.getEnd().add(1, 'hours'));
			ev.setUsername(UserService.getUsername());
			ev.setVisibility('all');

			$scope.event = ev;
			$scope.eventData = ev.toEditableBean();

			$scope.editEventModal.show();
		};

		$scope.editEvent = function(ev) {
			$scope.$evalAsync(function() {
				$scope.event = ev;
				$scope.eventData = ev.toEditableBean();

				$scope.editEventModal.show();
			});
		};

		$scope.trash = function(ev) {
			if (window.confirm('Are you sure you want to delete "' + ev.getSummary() + '"?')) {
				EventService.removeEvent(ev).then(function() {
					$scope.refreshDelayed(100);
				});
			}
		};

		$scope.toggleFavorite = function(ev) {
			var eventId = ev.getId();
			$log.debug('CMEventCtrl.toggleFavorite(' + eventId + ')');

			var username = UserService.getUsername();
			if (ev.isFavorite(username)) {
				// Event was favorited, unfavorite it
				ev.removeFavorite(username);

				EventService.removeFavorite(ev).then(function() {
					$scope.refreshDelayed(100);
				});
			} else {
				var existing;
				for (var i=0, len=$scope.events.length, event; i < len; i++) {
					event = $scope.events[i];
					if (event.getId() === eventId) {
						existing = event;
						break;
					}
				}

				if (!existing) {
					$log.error('Somehow favorited an event that does not exist! (' + eventId + ')');
					return;
				}

				// Add a temporary favorite object so the UI updates
				existing.addFavorite(username);

				EventService.addFavorite(ev).then(function(fav) {
					$scope.refreshDelayed(100);
				}, function() {
					$scope.$broadcast('cruisemonkey.notify.alert', { message: 'Failed to favorite ' + ev.getSummary() + '!' });
				});
			}
		};

		$scope.togglePublic = function(ev) {
			$log.debug('togglePublic(' + ev.getId() + ')');
			$scope.$evalAsync(function() {
				if (ev.getVisibility() === 'all') {
					ev.setVisibility('self');
				} else {
					ev.setVisibility('all');
				}
				EventService.updateEvent(ev).then(function() {
					$scope.refreshDelayed(100);
				});
			});
		};

		$scope.openPopover = function($event, entry) {
			var user = UserService.get();
			if (!user.username || user.username !== entry.getUsername()) {
				return;
			}

			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: entry.getVisibility() === 'all'? 'Make Private':'Make Public' },
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
						$log.error('Controller.Events.openPopover: unhandled index ' + index);
					}
				}
			});
		};
	})
	/*
	.controller('CMEventsBarCtrl', function($q, $scope, $timeout, $state, $ionicActionSheet, $ionicModal, $ionicScrollDelegate, EventService, kv, UserService) {
		$scope.eventType = 'official';
		$scope.filteredEvents = [];
		$scope.user = {};

		UserService.onUserChanged(function(newUser) {
			$scope.user = newUser;
		});

		var updateSearchString = function(searchString) {
			if (searchString === undefined) {
				return kv.remove('cruisemonkey.events.search-string');
			} else {
				return kv.set('cruisemonkey.events.search-string', searchString);
			}
		};
		$scope.onSearchChanged = function(searchString) {
			var delegate = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
			if (delegate.getScrollPosition().top !== 0) {
				delegate.scrollTop(false);
			}
			updateSearchString(searchString);
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

		$scope.scrollTop = function() {
			var delegate = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
			delegate.scrollTop(true);
		};

		$scope.addEvent = function() {
			$log.debug('addEvent()');
			var ev = new CMEvent();
			ev.setStart(moment());
			ev.setEnd(ev.getStart().clone());
			ev.setEnd(ev.getEnd().add(1, 'hours'));
			ev.setUsername(UserService.getUsername());
			ev.setVisibility('all');

			$scope.event = ev;
			$scope.eventData = ev.toEditableBean();

			$scope.editEventModal.show();
		};


		// Event Refreshing

		$scope.refreshEvents = function() {
			console.log('CMEventsBarCtrl.$scope.refreshEvents()');
			return EventService.getAllEvents().then(function(events) {
				events.sort(sortEvent);
				$scope.allEvents = events;
				$scope.$broadcast('cruisemonkey.events.updated');
				console.log('CMEventsBarCtrl.$scope.refreshEvents: found ' + $scope.allEvents.length + ' total events.');
			}, function(err) {
				console.log('CMEventsBarCtrl.$scope.refreshEvents(): WARNING: ' + err);
			});
		};

		// CruiseMonkey Events

		$scope.$on('cruisemonkey.database.syncComplete', function(ev, db) {
			console.log('CMEventCtrl: Sync complete: ' + db.name);
			$scope.refreshDelayed(100);
		});

		$scope.$on('cruisemonkey.database.change', function(ev, db, doc) {
			if (db.name.endsWith('events')) {
				$scope.refreshDelayed(100);
			}
		});

		// Ionic Events

		$scope.$on('$ionicView.loaded', function(ev, info) {
			var defaultSearchString = {
				'official': '',
				'unofficial': '',
				'all': '',
				'my': ''
			};

			kv.get('cruisemonkey.events.search-string').then(function(s) {
				$scope.searchString = s;
				if (!$scope.searchString || !$scope.searchString.official) {
					$scope.searchString = defaultSearchString;
					updateSearchString(defaultSearchString);
				}
			});
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			if (info.stateName && info.stateName.startsWith('app.events')) {
				$scope.eventType  = info.stateName.replace('app.events.', '');
				$scope.eventTitle = $scope.eventType === 'my'? 'Mine' : $scope.eventType.capitalize();
			}
		});
		$scope.$on('$ionicView.enter', function(ev, info) {
			$scope.refreshDelayed(100);
			$timeout(function() {
				if (!$scope.ready) {
					$scope.ready = {};
				}
				$scope.ready[$scope.eventType] = true;
			});
		});

		$scope.$on('$destroy', function() {
			$scope.editEventModal.remove();
		});
	})
	.controller('CMAllEventCtrl', function($scope, $timeout, $ionicScrollDelegate, UserService) {
		var _updatingFilter = false;
		$scope.updateFilter = function() {
			if (_updatingFilter || !$scope.allEvents) {
				return;
			}

			_updatingFilter = true;

			var user = UserService.get();

			var allEvents = $scope.allEvents, filteredEvents = [], i, ev;
			for (i=0; i < allEvents.length; i++) {
				ev = allEvents[i];
				if (ev.getVisibility() === 'all') {
					filteredEvents.push(ev);
				} else if (ev.getUsername() === user.username) {
					filteredEvents.push(ev);
				}
			}

			console.log('CMAllEventsCtrl.updateFilter: events: ' + filteredEvents.length);
			filteredEvents = withDays(filteredEvents);

			$timeout(function() {
				$scope.filteredEvents = filteredEvents;
				_updatingFilter = false;

				var handle = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
				if (handle) {
					handle.resize();
				}
			});
		};

		$scope.$on('cruisemonkey.events.updated', function() {
			$scope.updateFilter();
		});
	})
	.controller('CMMyEventCtrl', function($scope, $timeout, $ionicScrollDelegate, UserService) {
		var _updatingFilter = false;
		$scope.updateFilter = function() {
			if (_updatingFilter || !$scope.allEvents) {
				return;
			}

			_updatingFilter = true;

			var user = UserService.get();

			var allEvents = $scope.allEvents, filteredEvents = [], i, ev;
			for (i=0; i < allEvents.length; i++) {
				ev = allEvents[i];
				if (ev.getUsername() === user.username) {
					filteredEvents.push(ev);
				} else if (ev.getVisibility() === 'all' && ev.isFavorite(user.username)) {
					filteredEvents.push(ev);
				}
			}

			console.log('CMMyEventsCtrl.updateFilter: events: ' + filteredEvents.length);
			filteredEvents = withDays(filteredEvents);

			$timeout(function() {
				$scope.filteredEvents = filteredEvents;
				_updatingFilter = false;

				var handle = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
				if (handle) {
					handle.resize();
				}
			});
		};

		$scope.$on('cruisemonkey.events.updated', function() {
			$scope.updateFilter();
		});
	})
	.controller('CMOfficialEventCtrl', function($scope, $timeout, $ionicScrollDelegate, UserService) {
		var _updatingFilter = false;
		$scope.updateFilter = function() {
			if (_updatingFilter || !$scope.allEvents) {
				return;
			}

			_updatingFilter = true;

			var user = UserService.get();

			var allEvents = $scope.allEvents, filteredEvents = [], i, ev;
			for (i=0; i < allEvents.length; i++) {
				ev = allEvents[i];
				if (ev.getUsername() === 'official') {
					filteredEvents.push(ev);
				}
			}

			console.log('CMOfficialEventsCtrl.updateFilter: events: ' + filteredEvents.length);
			filteredEvents = withDays(filteredEvents);

			$timeout(function() {
				$scope.filteredEvents = filteredEvents;
				_updatingFilter = false;

				var handle = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
				if (handle) {
					handle.resize();
				}
			});
		};

		$scope.$on('cruisemonkey.events.updated', function() {
			$scope.updateFilter();
		});
	})
	.controller('CMUnofficialEventCtrl', function($scope, $timeout, $ionicScrollDelegate, UserService) {
		var _updatingFilter = false;
		$scope.updateFilter = function() {
			if (_updatingFilter || !$scope.allEvents) {
				return;
			}

			_updatingFilter = true;

			var user = UserService.get();

			var allEvents = $scope.allEvents, filteredEvents = [], i, ev;
			for (i=0; i < allEvents.length; i++) {
				ev = allEvents[i];
				if (ev.getVisibility() === 'all' && ev.getUsername() !== 'official') {
					filteredEvents.push(ev);
				}
			}

			console.log('CMUnofficialEventsCtrl.updateFilter: events: ' + filteredEvents.length);
			filteredEvents = withDays(filteredEvents);

			$timeout(function() {
				$scope.filteredEvents = filteredEvents;
				_updatingFilter = false;

				var handle = $ionicScrollDelegate.$getByHandle($scope.eventType + '-event-scroll');
				if (handle) {
					handle.resize();
				}
			});
		};

		$scope.$on('cruisemonkey.events.updated', function() {
			$scope.updateFilter();
		});
	})
	*/
	;
}());
