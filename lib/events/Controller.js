(function() {
	'use strict';

	var angular = require('angular'),
		moment = require('moment'),
		model = require('../data/Model'),
		CMEvent = model.CMEvent,
		CMDay = model.CMDay;

	require('moment-timezone');
	require('ionic-filter-bar');
	require('ion-sticky');

	require('./Edit');

	var boatImage = require('../data/boat.svg');

	var templates = {
		eventsChooser: require('ngtemplate!html!./chooser.html'),
		eventEdit: require('ngtemplate!html!./edit.html')
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
		'ion-sticky',
		'jett.ionic.filter.bar',
		'cruisemonkey.DB',
		'cruisemonkey.Events',
		'cruisemonkey.events.Edit',
		'cruisemonkey.user.User'
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
	.controller('CMEventsCtrl', function($filter, $ionicActionSheet, $ionicFilterBar, $ionicLoading, $ionicModal, $ionicPopover, $ionicPopup, $ionicScrollDelegate, $log, $q, $scope, $state, $timeout, EditEvent, EventService, kv, UserService) {
		$log.info('Initializing CMEventsCtrl');
		var defaultEventType = 'official';
		$scope.eventType = defaultEventType;
		$scope.eventTypes = ['official', 'shadow', 'all'];
		$scope.events = [];
		$scope.user = {};
		$scope.u = UserService;
		$scope.officialIcon = boatImage;
		$log.debug('boatImage=' + angular.toJson(boatImage));

		var filterBarInstance;

		var popover = $ionicPopover.fromTemplateUrl(templates['eventsChooser'], {
			scope: $scope
		});

		kv.get('cruisemonkey.events.event-type').then(function(et) {
			$scope.setEventType(et || defaultEventType);
		}, function() {
			$scope.setEventType(defaultEventType);
		});

		$scope.showFilterBar = function() {
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
					$scope.doRefresh();
				});
			}
		};

		$scope.doRefresh = function() {
			$scope.$evalAsync(function() {
				var user = UserService.get();
				if (user && user.loggedIn) {
					$scope.eventTypes = ['official', 'shadow', 'all', 'my'];
				} else {
					$scope.eventTypes = ['official', 'shadow', 'all'];
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
					case 'shadow':
						evFunction = EventService.getUnofficialEvents;
						break;
					case 'my':
						evFunction = EventService.getMyEvents;
						break;
				}

				// first get the cached version for speed
				evFunction(true).then(function(events) {
					$log.debug('refresh(): events = ' + angular.toJson(events));
					$scope.events = withDays(events);
					$scope.$broadcast('scroll.refreshComplete');
					$ionicLoading.hide();
				}).finally(function() {
					// then always try to refresh the cache

					$scope.$evalAsync(function() {
						evFunction(false).then(function(events) {
							$scope.events = withDays(events);
						}).finally(function() {
							if (filterBarInstance) {
								filterBarInstance();
							}
							$scope.$broadcast('scroll.refreshComplete');
						});
					});
				});
			});
		};

		var _refreshDelayTimeout = null;
		$scope.refreshDelayed = function(delay) {
			$log.debug('CMEventsCtrl.$scope.refreshDelayed()');
			if (_refreshDelayTimeout) {
				return;
			}
			_refreshDelayTimeout = $timeout(function() {
				_refreshDelayTimeout = null;
				$scope.doRefresh();
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

		$scope.getCssClass = function(entry) {
			var ret = '';
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
			if ($scope.user.username === entry.getUsername()) {
				ret += ' mine';
			}
			return ret;
		}

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

		$scope.addEvent = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			EditEvent.open();
		};

		$scope.editEvent = function(ev) {
			EditEvent.open(ev);
		};

		$scope.trash = function(ev) {
			$ionicPopup.confirm({
				title: 'Delete Event?',
				template: 'Are you sure you want to delete "' + ev.getSummary() + '"?'
			}).then(function(res) {
				if (res) {
					$scope.events.remove(ev);
					EventService.removeEvent(ev).then(function() {
						$scope.doRefresh();
					});
				} else {
					$log.debug('Canceled delete of ' + ev.getSummary());
				}
			});
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

		$scope.toggleShared = function(ev) {
			$log.debug('toggleShared(' + ev.getId() + ')');
			$scope.$evalAsync(function() {
				ev.setShared(!ev.isShared());
				EventService.updateEvent(ev).then(function() {
					$scope.refreshDelayed(100);
				});
			});
		};

		$scope.goToNow = function(ev) {
			if (ev) {
				ev.preventDefault();
				ev.stopPropagation();
			}
			$timeout(function() {
				var id, nextEvent = EventService.getNextEvent($scope.events);
				$log.debug('next event=' + angular.toJson(nextEvent));
				if (nextEvent) {
					id = nextEvent.getId();
					var idLocation = findElementById(id);
					$log.debug('scrolling to id location: ' + idLocation);
					$ionicScrollDelegate.$getByHandle('event-scroll').scrollTo(0, idLocation);
				} else {
					$ionicScrollDelegate.$getByHandle('event-scroll').scrollBottom();
				}
			});
		};

		$scope.openPopover = function($event, entry) {
			var user = UserService.get();
			if (!user.username || user.username !== entry.getUsername()) {
				return;
			}

			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: entry.isShared()? 'Make Private':'Make Public' },
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
						$scope.toggleShared(entry);
					} else if (index === 1) {
						hideSheet();
						$scope.editEvent(entry);
					} else {
						$log.error('Controller.Events.openPopover: unhandled index ' + index);
					}
				}
			});
		};

		$scope.$on('cruisemonkey.user.updated', $scope.doRefresh);
		$scope.$on('cruisemonkey.notify.eventAdded', $scope.doRefresh);
		$scope.$on('cruisemonkey.notify.eventUpdated', $scope.doRefresh);
		$scope.$on('$ionicView.beforeEnter', function() {
			$ionicLoading.show({
				template: 'Loading...',
				noBackdrop: true
			});
			$scope.doRefresh();
		});
		$scope.$on('$ionicView.unloaded', function() {
			delete $scope.events;
			delete $scope.users;
		});
	})
	;
}());
