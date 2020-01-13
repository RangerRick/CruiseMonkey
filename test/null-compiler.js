const uuid = require('uuid/index');

require.extensions['.png'] = () => {
	return uuid.v4() + '.png';
};
