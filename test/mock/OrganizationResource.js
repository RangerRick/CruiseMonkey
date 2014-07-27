var MockOrganizationResource = function($q, $rootScope) {
	return {
		get: function(params) {
			var deferred = $q.defer();

			setTimeout(function() {
				$rootScope.$apply(function() {
					if (params.id == "fcf8f8ba-49d1-4f93-beb6-fae6850603cf") {
						deferred.resolve({
							id: "fcf8f8ba-49d1-4f93-beb6-fae6850603cf",
							name: "Foo"
						});
					} else {
						deferred.reject();
					}
				});
			}, 0);

			return deferred.promise;
		}
	}
};
