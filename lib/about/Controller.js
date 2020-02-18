angular.module('cruisemonkey.controllers.About', [
	'ng',
	'cruisemonkey.Config'
])
.controller('CMAboutCtrl', ['$scope', 'config.app.version', 'config.app.build', ($scope, version, build) => {
	$scope.version = version;
	$scope.build = build;
}]);
