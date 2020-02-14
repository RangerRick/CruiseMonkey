const assert = require('assert-plus');

const moment = require('moment-timezone');

const model = require('../../lib/data/Model');

describe('Model', function() {
	describe('CMEvent', function() {
		it('should create a basic event', function() {
			const start   = moment('1980-01-01 00:00');
			const middle  = moment('1980-01-01 00:50');
			const end     = moment('1980-01-01 01:00');
			const tooOld  = moment('1979-01-01');
			const tooLate = moment('1991-01-01');

			const cmevent = new model.CMEvent({
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
