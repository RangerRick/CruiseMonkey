(function() {
	'use strict';

  require('ngstorage');
  require('../twitarr/Service');
  require('../user/User');

  var conductTemplate = require('./contents.html');
  var modalTemplate = require('./modal.html');

	angular.module('cruisemonkey.conduct.Service', [
    'ionic',
    'ngStorage',
    'cruisemonkey.Twitarr',
    'cruisemonkey.user.User'
	])
	.factory('Conduct', function($log, $rootScope, $ionicModal, $localStorage, Twitarr, UserService) {
    $log.debug('Initializing Conduct service.');

    var $scope = $rootScope.$new();
    $scope.$storage = $localStorage;
    $scope.conduct = $scope.$storage['cruisemonkey.conduct.contents'];
    $scope.conductTemplate = conductTemplate;

    $ionicModal.fromTemplateUrl(modalTemplate, {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.$on('$destroy', function() {
      $log.debug('Conduct: destroying modal.');
      $scope.modal.remove();
    });

    $scope.cancel = function(ev) {
      $log.debug('Conduct: canceling CoC.');
      $rootScope.rejectedCoC = true;
      $scope.$storage['cruisemonkey.conduct.seen'] = false;
      $scope.modal.hide();
      UserService.reset();
    };

    $scope.accept = function() {
      $log.debug('Conduct: accepting Code of Conduct.');
      $rootScope.rejectedCoC = false;
      $scope.$storage['cruisemonkey.conduct.seen'] = true;
    };

    $scope.hideModal = function(ev) {
      $log.debug('Conduct: hiding modal.');
      $scope.modal.hide();
      $scope.accept();
    };

    $scope.showModal = function() {
      $log.debug('Conduct: showing modal.');
      $scope.$evalAsync(function() {
        $scope.modal.show();
      });
    };

    var showIfNotSeen = function() {
			if (!$scope.$storage['cruisemonkey.conduct.seen']) {
				$log.warn('Conduct: Code of Conduct has not been read!');
        if ($scope.conduct) {
          $scope.showModal();
        } else {
          $log.warn('Conduct: no code of conduct text found, yet!');
        }
      } else {
        $log.info('Conduct: Code of Conduct has already been read.');
      }
    };

    var getCodeOfConduct = function() {
      return $scope.conduct;
    };

    var checkCodeOfConduct = function() {
      $log.info('Conduct: checking for updated Code of Conduct.');
      return Twitarr.getText('codeofconduct').then(function(conduct) {
        $log.debug('Updated the code of conduct.');

        $scope.conduct = conduct;
        $scope.$storage['cruisemonkey.conduct.contents'] = conduct;

        $rootScope.$broadcast('cruisemonkey.conduct.updated', conduct);
        showIfNotSeen();
        return conduct;
      });
		};

		$rootScope.$on('cruisemonkey.user.settings-changed', function(ev, changed) {
			if (changed.old['twitarr.root'] !== changed.new['twitarr.root']) {
				checkCodeOfConduct();
			}
		});
    checkCodeOfConduct();

    return {
      get: getCodeOfConduct,
      check: checkCodeOfConduct,
      accept: $scope.accept,
      show: $scope.showModal,
      hide: $scope.hideModal
    };
	});
}());
