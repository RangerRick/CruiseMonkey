describe('Logging', function() {
	var log = null;

	beforeEach(module('cruisemonkey.Logging', function($provide) {
		$provide.value('config.logging.useStringAppender', true);
	}));

	beforeEach(inject(function(LoggingService) {
		log = LoggingService;
	}));

	describe("info", function() {
		it('should log to a string', function() {
			expect(log.getLogHistory()).toBe("");

			log.info("This is a test.");
			expect(log.getLogHistory()).not.toBeUndefined();
			expect(log.getLogHistory()).toContain("This is a test.");
			expect(log.getLogHistory()).toContain("[INFO ]");
		});
	});
});

