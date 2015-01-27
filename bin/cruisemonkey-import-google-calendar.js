#!/usr/bin/env node
'use strict';

var ical = require('ical');
var moment = require('moment');
var uuid = require('node-uuid');
var cradle = require('cradle');
var deepcopy = require('deepcopy');

var db = new(cradle.Connection)().database('cruisemonkey-shadow');

db.exists(function(err, exists) {
	if (err) {
		console.log('error:',err);
	} else if (exists) {
		console.log('cruisemonkey-shadow exists');
	} else {
		db.create();
	}
});

var owners = {
};

var types = {
	featured: 'https://www.google.com/calendar/ical/jococruisecrazy.com_ie14k7pntcg75scemcsuo0mjmg%40group.calendar.google.com/public/basic.ics',
	shadow: 'https://www.google.com/calendar/ical/jococruisecrazy.com_nlt8jtla6h6imbo3khp342srtc%40group.calendar.google.com/public/basic.ics',
};

var format = 'YYYY-MM-DD HH:mm';
var now = moment().format(format);

function updateEvent(ev,type) {
	var uid = ev.uid.replace('@google.com', '');
	var id = 'event:2015:unofficial:' + uid;
	var start = moment(""+ev.start).format(format);
	var end = moment(""+ev.end).format(format);

	db.get(id, function(err, existing) {
		var changed = false;
		var username = owners[uid] || 'unofficial';

		if (!existing) {
			existing = {};
		}

		var doc;
		if (existing) {
			doc = deepcopy(existing);
		} else {
			doc = {
				type: 'event'
			}
		}

		if (start !== doc.start) {
			doc.start = start;
			changed = true;
		}

		if (start === end && doc.end) {
			delete doc.end;
			changed = true;
		} else if (start !== end && doc.end !== end) {
			doc.end = end;
			changed = true;
		}

		if (!doc.isPublic) {
			doc.isPublic = true;
			changed = true;
		}

		if (username !== doc.username) {
			doc.username = username;
			changed = true;
		}

		var summary = ev.summary;
		if (type === 'featured') {
			summary += ' [Featured]';
		}

		if (summary !== doc.summary) {
			doc.summary = summary;
			changed = true;
		}

		if (ev.location) {
			if (ev.location !== doc.location) {
				doc.location = ev.location;
				changed = true;
			}
		} else {
			if (doc.location) {
				delete doc.location;
				changed = true;
			}
		}

		if (ev.description) {
			if (ev.description !== doc.description) {
				doc.description = ev.description;
				changed = true;
			}
		} else {
			if (doc.description) {
				delete doc.description;
				changed = true;
			}
		}

		console.log(doc);
		if (changed) {
			console.log(id + ' has changed');
			console.log(existing);
			console.log(doc);
			db.save(id, doc);
		} else {
			console.log(id + ' has not changed');
		}
	});
}

function parseCalendar(type, url) {
	ical.fromURL(url, {}, function(err, data) {
		if (err) {
			console.log('ERROR:',err);
		} else {
			//console.log(data);

			var k, ev;
			for (k in data) {
				if (!data.hasOwnProperty(k)) {
					continue;
				}
				ev = data[k];
				if (ev && ev.summary) {
					updateEvent(ev,type);
				}
			}
		}
	});
}

for (var type in types) {
	parseCalendar(type, types[type]);
}
