/* eslint-disable no-console */
const maps = {};
for (let d=1; d <= 11; d++) {
	const map = require('html!../decks/imagemaps/deck-' + d + '.html');

	const html = document.createElement('map');
	html.innerHTML = map;

	const root = html.querySelector('map');
	const id = root.getAttribute('id');

	const areas = html.querySelectorAll('area');

	maps[d] = {
		id: id,
		areas: []
	};

	for (let i=0, len=areas.length; i < len; i++) {
		const areaId = areas[i].getAttribute('id');
		maps[d].areas.push(areaId);
	}
}

//console.log(JSON.stringify(maps));

const prefixRE = /^deck-\d+-cabins?-([\d,-]*)$/;

const searchMap = (mapinfo, cabinNumber) => {
	if (!mapinfo) {
		return null;
	}
	for (let i=0, len=mapinfo.areas.length; i < len; i++) {
		const id = mapinfo.areas[i];

		const cabins = id.replace(prefixRE, '$1');
		if (cabins.indexOf('deck-') === 0) {
			//console.log('NO MATCH: ' + id);
			continue;
		}
		let cabinList = [];

		//console.log('cabins: ' + cabins);
		if (cabins.indexOf(',') >= 0) {
			cabinList = cabins.split(',').map((c) => {
				return parseInt(c, 10);
			});
		} else if (cabins.indexOf('-') >= 0) {
			const range = cabins.split('-');
			range[0] = parseInt(range[0], 10);
			range[1] = parseInt(range[1], 10);
			const min = Math.min(range[0], range[1]),
				max = Math.max(range[0], range[1]);

			for (let j=min; j <= max; j += 2) {
				cabinList.push(j);
			}
		} else {
			const cabin = parseInt(cabins, 10);
			if (cabin === cabinNumber) {
				// console.log('found an exact match: ' +cabinNumber + '='+cabin);
				return id;
			}
		}

		// console.log('id='+id+', cabinList='+cabinList);
		if (cabinList.indexOf(cabinNumber) >= 0) {
			return id;
		}
	}

	//console.log('no match in map ' + mapinfo.id);
	return null;
}

const findCabin = (cabinNumber) => {
	//console.log(new Date().getTime());
	cabinNumber = parseInt(cabinNumber, 10);
	//console.log('findCabin: ' + cabinNumber);
	const cabinS = ''+cabinNumber;
	let deck = parseInt(cabinS.charAt(0));
	//console.log('findCabin: searching deck ' + deck);

	const map = maps[deck];
	let match;
	if (map) {
		match = searchMap(maps[deck], cabinNumber);
	}

	if (!match) {
//		const keys = Object.keys(maps).reverse();
		for (let m=15; m > 1; m--) {
			deck = m;
			match = searchMap(maps[m], cabinNumber);
			if (match) {
				break;
			}
		}
	}

	//console.log(new Date().getTime());
	if (match) {
		//console.log('match: ' + match);
		return [deck, match];
	} else {
		console.log('no match.');
	}
	return null;
}

module.exports = { find: findCabin };

/* eslint-enable no-console */