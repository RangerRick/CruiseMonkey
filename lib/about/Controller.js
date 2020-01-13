angular.module('cruisemonkey.controllers.About', [
	'ng',
	'cruisemonkey.Config'
])
.controller('CMAboutCtrl', ['$scope', '$window', 'config.app.version', 'config.app.build', ($scope, version, build) => {
	$scope.version = version;
	$scope.build = build;
}]);
