require('./Service');

const conductTemplate = require('./contents.html');

angular.module('cruisemonkey.conduct.Controller', [
  'ionic',
  'cruisemonkey.conduct.Service'
])
.controller('CMConductCtrl', ($log, $scope, Conduct) => {
  $log.debug('Initializing CMConductCtrl.');

  $scope.hideConductHeader = true;
  $scope.conductTemplate = conductTemplate;
  $scope.conduct = Conduct.get();

  $scope.accept = function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    Conduct.accept();
  };

  $scope.$on('cruisemonkey.conduct.updated', (ev, conduct) => {
    $scope.conduct = conduct;
  });
});
