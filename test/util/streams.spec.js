'use strict';

var assert = require('assert-plus');
var moment = require('moment');

var datetime = require('../../lib/util/datetime');
var streamUtil = require('../../lib/util/streams');

describe('Streams Utilities', function() {
	it('turn timestamp strings into moments', function() {
		var chunk = require('./streams.limit-3.json');
		assert.arrayOfObject(chunk);
		assert.equal(3, chunk.length);

		var processed = streamUtil.normalize(chunk);
		assert.arrayOfObject(chunk);
		assert.equal(3, chunk.length);
		for (var i=0, len=chunk.length; i < len; i++) {
			assert.ok(chunk[i].timestamp instanceof moment, 'timestamp should be a moment');
		}
		assert.ok(datetime.create('2016-02-05T18:29:25.240Z').isSame(chunk[0].timestamp));
		assert.ok(datetime.create('2016-02-05T01:58:08.934Z').isSame(chunk[1].timestamp));
		assert.ok(datetime.create('2016-02-04T19:29:32.439Z').isSame(chunk[2].timestamp));
	});

	it('merge 2 sets of overlapping streams', function() {
		var firstChunk = streamUtil.normalize(require('./streams.limit-3.json'));
		var secondChunk = streamUtil.normalize(require('./streams.limit-2-page-1.json'));

		var combined = streamUtil.merge(firstChunk, secondChunk);
		assert.arrayOfObject(combined);
		assert.equal(4, combined.length);

		assert.equal('56b2d3d6aaebbc156d000002', combined[0].id);
		assert.equal('56b3a69caaebbc5aa9000001', combined[1].id);
		assert.equal('56b401b0aaebbc5e77000004', combined[2].id);
		assert.equal('56b4ea05aaebbc7e94000009', combined[3].id);
	});

	it('merge 3 sets of overlapping streams', function() {
		var firstChunk = streamUtil.normalize([{
			id: '1',
			timestamp: '2016-01-01T01:00:00Z'
		}, {
			id: '2',
			timestamp: '2016-01-01T02:00:00Z'
		}, {
			id: '3',
			timestamp: '2016-01-01T03:00:00Z'
		}]);
		var secondChunk = streamUtil.normalize([{
			id: '2.5',
			timestamp: '2016-01-01T02:30:00Z'
		}, {
			id: '4',
			timestamp: '2016-01-01T04:00:00Z'
		}]);
		var thirdChunk = streamUtil.normalize([{
			id: '3',
			timestamp: '2016-01-01T03:00:00Z'
		}, {
			id: '3.5',
			timestamp: '2016-01-01T03:30:00Z'
		}, {
			id: '5',
			timestamp: '2016-01-01T05:00:00Z'
		}]);

		var combined = streamUtil.merge(firstChunk, secondChunk, thirdChunk);
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
