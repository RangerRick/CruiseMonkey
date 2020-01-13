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
		80: require('./images/' + e + '-80.png').default,
		500: require('./images/' + e + '-500.png').default,
	};
	return ':' + e + ':';
});

// console.log('emoji:', urlCache);

module.exports = {
	list: () => {
		return emoji;
	},
	tokens: () => {
		return tokens;
	},
	small: (name) => {
		return urlCache[name]['80'];
	},
	large: (name) => {
		return urlCache[name]['500'];
	}
};