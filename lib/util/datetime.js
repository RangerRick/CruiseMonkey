'use strict';

var moment = require('moment-timezone');
moment.locale('en', {
	relativeTime: {
		future : 'in %s',
		past : '%s ago',
		s : 'a few seconds',
		m : '1 minute',
		mm : '%d minutes',
		h : '1 hour',
		hh : '%d hours',
		d : '1 day',
		dd : '%d days',
		M : '1 month',
		MM : '%d months',
		y : '1 year',
		yy : '%d years'
	}
});

module.exports = {
	create: function(d) {
		return moment.tz(d, 'America/New_York');
	},
	tz: moment.tz,
	moment: moment
};
