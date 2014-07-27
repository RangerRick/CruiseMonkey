var MockUserResource = function($q, $rootScope) {
	return {
		get: function() {
			var deferred = $q.defer();
			setTimeout(function() {
				$rootScope.$apply(function() {
					deferred.resolve({
						"organizations":["fcf8f8ba-49d1-4f93-beb6-fae6850603cf"],
						"password":null,
						"login":"aUser",
						"contactEmail":"user@example.com",
						"contactGiven":"Arnold",
						"contactSurname":"User"
					});
				});
			}, 0);
			return deferred.promise;
		}
	}
};