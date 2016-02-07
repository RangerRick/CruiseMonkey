'use strict';

var datetime = require('./datetime');

/* eslint-disable no-console */

var sortFunc = function(a,b) {
	return a.timestamp.diff(b.timestamp);
};

var mergeStreams = function() {
	var args = Array.prototype.slice.call(arguments);

	if (args.length === 1) {
		return args[0];
	}

	var ret = args[0].slice(0);

	for (var i=1, len=args.length; i < len; i++) {
		ret = ret.concat(args[i]);
	}

	ret = ret.sort(sortFunc);

	var len = ret.length;
	return ret.filter(function(item, i, self) {
		return !(self[i+1] && item.id === self[i+1].id);
	});
};

var normalize = function(stream) {
	for (var i=0, len=stream.length; i < len; i++) {
		stream[i].timestamp = datetime.create(stream[i].timestamp);
	}
	return stream;
};

module.exports = {
	merge: mergeStreams,
	normalize: normalize
};

/* eslint-enable no-console */