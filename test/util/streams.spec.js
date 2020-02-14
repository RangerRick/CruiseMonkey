const assert = require('assert-plus');
const moment = require('moment');

const datetime = require('../../lib/util/datetime');
const streamUtil = require('../../lib/util/streams');

describe('Streams Utilities', function() {
	it('turn timestamp strings into moments', function() {
		const chunk = require('./streams.limit-3.json');
		assert.arrayOfObject(chunk);
		assert.equal(3, chunk.length);

		const processed = streamUtil.normalize(chunk);
		assert.arrayOfObject(processed);
		assert.equal(3, processed.length);
		for (let i=0, len=processed.length; i < len; i++) {
			assert.ok(processed[i].timestamp instanceof moment, 'timestamp should be a moment');
		}
		assert.ok(datetime.create('2016-02-05T18:29:25.240Z').isSame(processed[0].timestamp));
		assert.ok(datetime.create('2016-02-05T01:58:08.934Z').isSame(processed[1].timestamp));
		assert.ok(datetime.create('2016-02-04T19:29:32.439Z').isSame(processed[2].timestamp));
	});

	it('merge 2 sets of overlapping streams', function() {
		const firstChunk = streamUtil.normalize(require('./streams.limit-3.json'));
		const secondChunk = streamUtil.normalize(require('./streams.limit-2-page-1.json'));

		const combined = streamUtil.merge(firstChunk, secondChunk);
		assert.arrayOfObject(combined);
		assert.equal(4, combined.length);

		assert.equal('56b2d3d6aaebbc156d000002', combined[0].id);
		assert.equal('56b3a69caaebbc5aa9000001', combined[1].id);
		assert.equal('56b401b0aaebbc5e77000004', combined[2].id);
		assert.equal('56b4ea05aaebbc7e94000009', combined[3].id);
	});

	it('merge 3 sets of overlapping streams', function() {
		const firstChunk = streamUtil.normalize([{
			id: '1',
			timestamp: '2016-01-01T01:00:00Z'
		}, {
			id: '2',
			timestamp: '2016-01-01T02:00:00Z'
		}, {
			id: '3',
			timestamp: '2016-01-01T03:00:00Z'
		}]);
		const secondChunk = streamUtil.normalize([{
			id: '2.5',
			timestamp: '2016-01-01T02:30:00Z'
		}, {
			id: '4',
			timestamp: '2016-01-01T04:00:00Z'
		}]);
		const thirdChunk = streamUtil.normalize([{
			id: '3',
			timestamp: '2016-01-01T03:00:00Z'
		}, {
			id: '3.5',
			timestamp: '2016-01-01T03:30:00Z'
		}, {
			id: '5',
			timestamp: '2016-01-01T05:00:00Z'
		}]);

		const combined = streamUtil.merge(firstChunk, secondChunk, thirdChunk);
		assert.arrayOfObject(combined);
		assert.equal(7, combined.length);
		assert.equal('1', combined[0].id);
		assert.equal('2', combined[1].id);
		assert.equal('2.5', combined[2].id);
		assert.equal('3', combined[3].id);
		assert.equal('3.5', combined[4].id);
		assert.equal('4', combined[5].id);
		assert.equal('5', combined[6].id);
	});
});
