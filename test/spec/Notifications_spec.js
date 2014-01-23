describe('Notifications', function() {
	var notifications = null;
	var q             = null;
	var rootScope     = null;
	var timeout       = null;
	var async         = new AsyncSpec(this);

	var mockWindow;

	beforeEach(function() {
		mockWindow = {
			alert: jasmine.createSpy()
		};

		module('cruisemonkey.Notifications', function($provide) {
			$provide.value('config.notifications.timeout', 500);
			$provide.value('$window', mockWindow);
		});
		inject(['$q', '$rootScope', '$timeout', 'NotificationService', function($q, $rootScope, $timeout, NotificationService) {
			q             = $q;
			rootScope     = $rootScope;
			timeout       = $timeout;
			notifications = NotificationService;
		}]);
	});

	describe("#alert", function() {
		async.it('should return true after 500ms', function(done) {
			var notified = false;
			var ret = undefined;

			var promise = notifications.alert('This is a test.', function() {
				notified = true;
				return "booga";
			});
			q.when(promise).then(function(value) {
				ret = value;
			});

			expect(notified).not.toBeTruthy();
			expect(mockWindow.alert).not.toHaveBeenCalled();

			// flush everything as if timeouts have happened
			rootScope.$digest();
			timeout.flush();

			expect(ret).toBe("booga");
			expect(notified).toBeTruthy();

			expect(mockWindow.alert).toHaveBeenCalledWith('This is a test.');
			expect(mockWindow.alert.callCount).toEqual(1);

			done();
		});
	});
});

