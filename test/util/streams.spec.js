import { arrayOfObject, equal, ok } from 'assert-plus';
import moment from 'moment';

import { create } from '../../lib/util/datetime';
import { normalize, merge } from '../../lib/util/streams';

describe('Streams Utilities', function() {
	it('turn timestamp strings into moments', function() {
		const chunk = require('./streams.limit-3.json');
		arrayOfObject(chunk);
		equal(3, chunk.length);

		const processed = normalize(chunk);
		arrayOfObject(processed);
		equal(3, processed.length);
		for (let i=0, len=processed.length; i < len; i++) {
			ok(processed[i].timestamp instanceof moment, 'timestamp should be a moment');
		}
		ok(create('2016-02-05T18:29:25.240Z').isSame(processed[0].timestamp));
		ok(create('2016-02-05T01:58:08.934Z').isSame(processed[1].timestamp));
		ok(create('2016-02-04T19:29:32.439Z').isSame(processed[2].timestamp));
	});

	it('merge 2 sets of overlapping streams', function() {
		const firstChunk = normalize(require('./streams.limit-3.json'));
		const secondChunk = normalize(require('./streams.limit-2-page-1.json'));

		const combined = merge(firstChunk, secondChunk);
		arrayOfObject(combined);
		equal(4, combined.length);

		equal('56b2d3d6aaebbc156d000002', combined[0].id);
		equal('56b3a69caaebbc5aa9000001', combined[1].id);
		equal('56b401b0aaebbc5e77000004', combined[2].id);
		equal('56b4ea05aaebbc7e94000009', combined[3].id);
	});

	it('merge 3 sets of overlapping streams', function() {
		const firstChunk = normalize([{
			id: '1',
			timestamp: '2016-01-01T01:00:00Z'
		}, {
			id: '2',
			timestamp: '2016-01-01T02:00:00Z'
		}, {
			id: '3',
			timestamp: '2016-01-01T03:00:00Z'
		}]);
		const secondChunk = normalize([{
			id: '2.5',
			timestamp: '2016-01-01T02:30:00Z'
		}, {
			id: '4',
			timestamp: '2016-01-01T04:00:00Z'
		}]);
		const thirdChunk = normalize([{
			id: '3',
			timestamp: '2016-01-01T03:00:00Z'
		}, {
			id: '3.5',
			timestamp: '2016-01-01T03:30:00Z'
		}, {
			id: '5',
			timestamp: '2016-01-01T05:00:00Z'
		}]);

		const combined = merge(firstChunk, secondChunk, thirdChunk);
		arrayOfObject(combined);
		equal(7, combined.length);
		equal('1', combined[0].id);
		equal('2', combined[1].id);
		equal('2.5', combined[2].id);
		equal('3', combined[3].id);
		equal('3.5', combined[4].id);
		equal('4', combined[5].id);
		equal('5', combined[6].id);
	});
});
