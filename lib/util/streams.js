const datetime = require('./datetime');

/* eslint-disable no-console */

const sortFunc = (a,b) => {
	return a.timestamp.diff(b.timestamp);
};

const mergeStreams = (...args) => {
	if (args.length === 1) {
		return args[0];
	}

	let ret = args[0].slice(0);

	for (let i=1, len=args.length; i < len; i++) {
		ret = ret.concat(args[i]);
	}

	ret = ret.sort(sortFunc);

	return ret.filter((item, i, self) => {
		return !(self[i+1] && item.id === self[i+1].id);
	});
};

const normalize = (stream) => {
	for (let i=0, len=stream.length; i < len; i++) {
		stream[i].timestamp = datetime.create(stream[i].timestamp);
	}
	return stream;
};

module.exports = {
	merge: mergeStreams,
	normalize: normalize
};

/* eslint-enable no-console */