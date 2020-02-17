const emoji = [
	'pirate',
	'zombie',
	'joco',
	'towel-monkey',
	'ship',
	'ship-front',
	'tropical-drink',
	'buffet',
	'hottub',
	'fez',
	'die',
	'die-ship'
];

const urlCache = {};
const tokens = emoji.map((e) => {
	urlCache[e] = {
		small: require('./images/' + e + '-80.png').default,
		large: require('./images/' + e + '-500.png').default,
	};
	return ':' + e + ':';
});

module.exports = {
	list: () => {
		return emoji;
	},
	tokens: () => {
		return tokens;
	},
	small: (name) => {
		return urlCache[name]['small'];
	},
	large: (name) => {
		return urlCache[name]['large'];
	}
};
