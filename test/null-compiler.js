var uuid = require('uuid/index');

require.extensions['.png'] = function() {
	return uuid.v4() + '.png';
};
