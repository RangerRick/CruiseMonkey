(function() {
	'use strict';

	angular.module('cruisemonkey.controllers.DeckList', ['ngRoute', 'cruisemonkey.Logging', 'hammer'])
	.controller('CMDeckListCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 'LoggingService', function($scope, $rootScope, $routeParams, $location, log) {
		log.info('Initializing CMDeckListCtrl');
		$scope.deck = parseInt($routeParams.deck, 10);
		$rootScope.title = "Deck " + $scope.deck;

		$scope.previous = function() {
			previous();
		};
		$scope.next = function() {
			next();
		};

		var previous = function() {
			$scope.safeApply(function() {
				if ($scope.deck !== 2) {
					var newdeck = ($scope.deck - 1);
					log.info('previous() going down to deck ' + newdeck);
					$location.path('/deck-plans/' + newdeck);
				}
			});
		};
		var next = function() {
			$scope.safeApply(function() {
				if ($scope.deck !== 15) {
					var newdeck = ($scope.deck + 1);
					log.info('next() going up to deck ' + newdeck);
					$location.path('/deck-plans/' + newdeck);
				}
			});
		};
		var listener = function(ev) {
			console.log("received event: ", ev);
			if (ev.keyCode === 37) {
				previous();
				return false;
			} else if (ev.keyCode === 39) {
				next();
				return false;
			}
			return true;
		};

		var newButtons = [];
		$rootScope.rightButtons = [];
		if ($scope.deck !== 2) {
			newButtons.push({
				'type': 'button-clear',
				'content': '<i class="icon icon-arrow-left4"></i>',
				tap: function(e) {
					console.log('Previous Deck.');
					previous();
					return false;
				}
			});
			/*
			$rootScope.actions.push({
				'name': 'Previous',
				'iconClass': 'arrow-left4',
				'launch': function() {
					previous();
				}
			});
			*/
		}
		if ($scope.deck === 15) {
			newButtons.push({
				'type': 'button-clear',
				'content': '<i class="icon icon-blank"></i>',
				tap: function(e) {
					console.log('No action.');
				}
			});
			/*
			$rootScope.actions.push({
				'name': 'Blank',
				'iconClass': 'blank',
				'launch': function() {
				}
			});
			*/
		} else {
			newButtons.push({
				'type': 'button-clear',
				'content': '<i class="icon icon-arrow-right4"></i>',
				tap: function(e) {
					console.log('Next Deck.');
					next();
					return false;
				}
			});
			/*
			$rootScope.actions.push({
				'name': 'Next',
				'iconClass': 'arrow-right4',
				'launch': function() {
					next();
				}
			});
			*/
		}
		$rootScope.rightButtons = newButtons;

		document.addEventListener('keydown', listener, true);
		$scope.$on('$destroy', function() {
			document.removeEventListener('keydown', listener, true);
		});
	}]);
}());