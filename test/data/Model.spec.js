var assert = require('assert-plus');
var jsdom = require('jsdom').jsdom;
document = jsdom( '<html/>' );

var moment = require('moment-timezone');

var model = require('../../lib/data/Model');

describe('Model', function() {
	describe('CMEvent', function() {
		it('should create a basic event', function() {
			var start   = moment('1980-01-01 00:00');
			var middle  = moment('1980-01-01 00:50');
			var end     = moment('1980-01-01 01:00');
			var tooOld  = moment('1979-01-01');
			var tooLate = moment('1991-01-01');

			cmevent = new model.CMEvent({
				summary: 'Event summary.',
				start_time: start.format(),
				end_time: end.format()
			});

			assert.equal(cmevent.matchesDate(start), true);
			assert.equal(cmevent.matchesDate(end), true);
			assert.equal(cmevent.matchesDate(middle), true);
			assert.equal(cmevent.matchesDate(tooOld), false);
			assert.equal(cmevent.matchesDate(tooLate), false);
		});
	});
});
