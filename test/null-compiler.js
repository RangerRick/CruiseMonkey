var uuid = require('uuid');

require.extensions['.png'] = function() {
	return uuid.v4() + '.png';
};
