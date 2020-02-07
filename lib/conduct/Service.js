require('ngstorage');
require('../twitarr/Service');
require('../user/User');

const conductTemplate = require('./contents.html');
const modalTemplate = require('./modal.html');

angular.module('cruisemonkey.conduct.Service', [
  'ionic',
  'ngStorage',
  'cruisemonkey.Twitarr',
  'cruisemonkey.user.User'
])
.factory('Conduct', ($log, $rootScope, $ionicModal, $localStorage, Twitarr, UserService) => {
  $log.debug('Initializing Conduct service.');

  const $scope = $rootScope.$new();
  $scope.$storage = $localStorage;
  $scope.conduct = $scope.$storage['cruisemonkey.conduct.contents'];
  $scope.conductTemplate = conductTemplate;

  $ionicModal.fromTemplateUrl(modalTemplate, { scope: $scope }).then((modal) => {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', () => {
    $log.debug('Conduct: destroying modal.');
    $scope.modal.remove();
  });

  $scope.cancel = (/* ev */) => {
    $log.debug('Conduct: canceling CoC.');
    $rootScope.rejectedCoC = true;
    $scope.$storage['cruisemonkey.conduct.seen'] = false;
    $scope.modal.hide();
    UserService.reset();
  };

  $scope.accept = () => {
    $log.debug('Conduct: accepting Code of Conduct.');
    $rootScope.rejectedCoC = false;
    $scope.$storage['cruisemonkey.conduct.seen'] = true;
  };

  $scope.hideModal = (/* ev */) => {
    $log.debug('Conduct: hiding modal.');
    $scope.modal.hide();
    $scope.accept();
  };

  $scope.showModal = () => {
    $log.debug('Conduct: showing modal.');
    $scope.$evalAsync(() => {
      $scope.modal.show();
    });
  };

  const showIfNotSeen = () => {
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

  const getCodeOfConduct = () => {
    return $scope.conduct;
  };

  const checkCodeOfConduct = () => {
    $log.info('Conduct: checking for updated Code of Conduct.');
    return Twitarr.getText('codeofconduct').then((conduct) => {
      $log.debug('Updated the code of conduct.');

      $scope.conduct = conduct;
      $scope.$storage['cruisemonkey.conduct.contents'] = conduct;

      $rootScope.$broadcast('cruisemonkey.conduct.updated', conduct);
      showIfNotSeen();
      return conduct;
    });
  };

  $rootScope.$on('cruisemonkey.user.settings-changed', (ev, changed) => {
    if (changed.old.twitarrRoot !== changed.new.twitarrRoot) {
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
