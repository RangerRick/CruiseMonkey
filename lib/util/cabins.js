'use strict';

/* eslint-disable no-console */
var maps = {};
for (var d=1; d <= 11; d++) {
	var map = require('html!../decks/imagemaps/deck-' + d + '.html');

	var html = document.createElement('map');
	html.innerHTML = map;

	var root = html.querySelector('map');
	var id = root.getAttribute('id');

	var areas = html.querySelectorAll('area');

	maps[d] = {
		id: id,
		areas: []
	};

	for (var i=0, len=areas.length; i < len; i++) {
		var areaId = areas[i].getAttribute('id');
		maps[d].areas.push(areaId);
	}
}

//console.log(JSON.stringify(maps));

var prefixRE = /^deck-\d+-cabins?-([\d,-]*)$/;

function searchMap(mapinfo, cabinNumber) {
	if (!mapinfo) {
		return null;
	}
	for (var i=0, len=mapinfo.areas.length; i < len; i++) {
		var id = mapinfo.areas[i];

		var cabins = id.replace(prefixRE, '$1');
		if (cabins.indexOf('deck-') === 0) {
			//console.log('NO MATCH: ' + id);
			continue;
		}
		var cabinList = [];

		//console.log('cabins: ' + cabins);
		if (cabins.indexOf(',') >= 0) {
			cabinList = cabins.split(',').map(function(c) {
				return parseInt(c, 10);
			});
		} else if (cabins.indexOf('-') >= 0) {
			var range = cabins.split('-');
			range[0] = parseInt(range[0], 10);
			range[1] = parseInt(range[1], 10);
			var min = Math.min(range[0], range[1]),
				max = Math.max(range[0], range[1]);

			for (var j=min; j <= max; j += 2) {
				cabinList.push(j);
			}
		} else {
			var cabin = parseInt(cabins, 10);
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

function findCabin(cabinNumber) {
	//console.log(new Date().getTime());
	cabinNumber = parseInt(cabinNumber, 10);
	//console.log('findCabin: ' + cabinNumber);
	var cabinS = ''+cabinNumber;
	var deck = parseInt(cabinS.charAt(0));
	//console.log('findCabin: searching deck ' + deck);

	var map = maps[deck];
	var match;
	if (map) {
		match = searchMap(maps[deck], cabinNumber);
	}

	if (!match) {
		var keys = Object.keys(maps).reverse();
		for (var m=15; m > 1; m--) {
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

module.exports = {
	find: findCabin
};

/* eslint-enable no-console */