const datetime = require('../util/datetime');

const dateStringFormat='YYYY-MM-DDTHH:mm:ss.SSSZ';

function CMDay(d) {
	this.day = d;
	this._searchableDay = datetime.create(this.day).format('LLLL');
}

function CMEvent(data) {
	this._rawdata = {};
	if (data) {
		Object.assign(this._rawdata, data._rawdata ? data._rawdata : data);
	}

	this._day      = undefined;
	this._start    = undefined;
	this._end      = undefined;

	this._rawdata.type = 'event';

	if (this._rawdata.start_time === 'Invalid date') {
		this._rawdata.start_time = undefined;
	}
	if (this._rawdata.end_time === 'Invalid date') {
		this._rawdata.end_time = undefined;
	}
	if (this._rawdata.lastUpdated === 'Invalid date') {
		this._rawdata.lastUpdated = undefined;
	}
	if (this._rawdata.lastUpdated === undefined) {
		this._rawdata.lastUpdated = '1970-01-01 00:00';
	}

	this.updateDateStrings();

	delete this._rawdata.isNewDay;
}

function CMDeck(floor, amenities) {
	this.type = 'deck';
	this._floor = floor;
	this._amenities = [];

	for (let i=0, len=amenities.length, amenity; i < len; i++) {
		amenity = amenities[i];
		amenity.setDeck(this);
		this._amenities.push(amenity);
	}
}

function CMAmenity(id, summary, icon, category, description) {
	this.type = 'amenity';
	this._id = id;
	this._summary = summary;
	this._icon = icon;
	this._category = category;
	this._description = description;
	this._deck = undefined;
}

CMDay.prototype.getId = function() {
	return 'day-' + this.day.unix();
};

CMDay.prototype.getHash = function() {
	return this.getId();
};

CMDay.prototype.clone = function() {
	return new CMDay(this.day);
};

CMEvent._stringifyDate = function(date) {
	if (date === null || date === undefined) {
		return null;
	}
	return datetime.create(date).format(dateStringFormat);
};

CMEvent.prototype.clone = function() {
	const newobj = new CMEvent(this._rawdata);
	newobj._day   = datetime.create(this._day);
	newobj._start = datetime.create(this._start);
	newobj._end   = datetime.create(this._end);
	newobj._even  = !!this._even;

	return newobj;
};

CMEvent.prototype.updateDateStrings = function() {
	if (this._rawdata.start_time) {
		this._searchableStart = datetime.create(this._rawdata.start_time).format('LLLL');
	}
	if (this._rawdata.end_time) {
		this._searchableEnd = datetime.create(this._rawdata.end_time).format('LLLL');
	}
};

CMEvent.prototype.isEven = function() {
	return this._even || false;
};

CMEvent.prototype.setEven = function(bool) {
	this._even = bool;
};

CMEvent.prototype.getId = function() {
	return this._rawdata.id;
};

CMEvent.prototype.setId = function(id) {
	this._rawdata.id = id;
	this._hash = undefined;
};

CMEvent.prototype.getHash = function() {
	return this.getId();
};

CMEvent.prototype.getRevision = function() {
	return this._rawdata._rev;
};

CMEvent.prototype.setRevision = function(rev) {
	this._rawdata._rev = rev;
};

CMEvent.prototype.getSummary = function() {
	return this._rawdata.title;
};

CMEvent.prototype.setSummary = function(summary) {
	this._rawdata.title = summary;
	this._hash = undefined;
};

CMEvent.prototype.getFormattedDescription = function() {
	return this.getDescription().replace(/[\n\r]/gm, '<br>');
};

CMEvent.prototype.getDescription = function() {
	if (this._desc === undefined && this._rawdata.description) {
		if (angular.isArray(this._rawdata.description)) {
			this._desc = this._rawdata.description[0];
		} else if (this._rawdata.description.startsWith('["')) {
			this._desc = angular.fromJson(this._rawdata.description)[0];
		} else {
			this._desc = this._rawdata.description;
		}
	}
	return this._desc;
};

CMEvent.prototype.setDescription = function(description) {
	this._rawdata.description = description;
	this._desc = undefined;
	this._hash = undefined;
};

CMEvent.prototype.getDay = function() {
	if (this._day === undefined && this._rawdata['start_time'] !== undefined) {
		this._day = datetime.create(this._rawdata['start_time']).startOf('day');
	}
	return this._day;
};

/**
  * Get the start date as a Moment.js object.
  *
  * @return {Moment} the start date.
  */
CMEvent.prototype.getStart = function() {
	if (this._start === undefined && this._rawdata['start_time'] !== undefined) {
		this._start = datetime.create(this._rawdata['start_time']);
	}
	return this._start;
};

/**
  * Set the start date.  Accepts a moment, a Date, or a pre-formatted string.
  *
  * @param {Object} start The date to set.
  * @return {string} The stringified (rawdata) start date.
  */
CMEvent.prototype.setStart = function(start) {
	if (typeof start === 'string' || start instanceof String) {
		this._rawdata['start_time'] = start;
	} else {
		this._rawdata['start_time'] = CMEvent._stringifyDate(start);
	}
	this._start = undefined;
	this._day = undefined;
	this._hash = undefined;
	this.updateDateStrings();
	return this._rawdata['start_time'];
};

CMEvent.prototype.getStartString = function() {
	return this._rawdata['start_time'];
};

CMEvent.prototype.setStartString = function(start) {
	this._rawdata['start_time'] = start;
	this._start = undefined;
	this._day = undefined;
	this._hash = undefined;
	this.updateDateStrings();
};

/**
  * Get the end date as a Moment.js object.
  *
  * @return {Moment} The end date.
  */
CMEvent.prototype.getEnd = function() {
	if (this._end === undefined && this._rawdata['end_time']) {
		this._end = datetime.create(this._rawdata['end_time']);
	}
	return this._end;
};

/**
  * Set the end date.  Accepts a moment, a Date, or a pre-formatted string.
  *
  * @param {Object} end The date to set.
  * @return {string} The stringified (rawdata) end date.
  */
CMEvent.prototype.setEnd = function(end) {
	if (typeof end === 'string' || end instanceof String) {
		this._rawdata['end_time'] = end;
	} else if (end === undefined || end === null) {
		this._rawdata['end_time'] = null;
	} else {
		this._rawdata['end_time'] = CMEvent._stringifyDate(end);
	}
	this._end = undefined;
	this._hash = undefined;
	this.updateDateStrings();
	return this._rawdata['end_time'];
};

CMEvent.prototype.getEndString = function() {
	return this._rawdata['end_time'];
};

CMEvent.prototype.setEndString = function(end) {
	if (!end) {
		this._rawdata['end_time'] = null;
	} else {
		this._rawdata['end_time'] = end;
	}
	this._end = undefined;
	this._hash = undefined;
	this.updateDateStrings();
};

CMEvent.prototype.getLastUpdated = function() {
	return datetime.create(this._rawdata.lastUpdated);
};

CMEvent.prototype.refreshLastUpdated = function() {
	this._rawdata.lastUpdated = CMEvent._stringifyDate(datetime.create());
};

CMEvent.prototype.getAuthor = function() {
	if (this._rawdata.author && this._rawdata.author.username !== '') {
		return this._rawdata.author;
	}
	return undefined;
};

CMEvent.prototype.setAuthor = function(author) {
	this._rawdata.author = author;
	this._hash = undefined;
};

CMEvent.prototype.getLocation = function() {
	return this._rawdata.location;
};

CMEvent.prototype.setLocation = function(loc) {
	this._rawdata.location = loc;
	this._hash = undefined;
};

CMEvent.prototype.isOfficial = function() {
	return !!this._rawdata.official;
};

CMEvent.prototype.setOfficial = function(official) {
	this._rawdata.official = !!official;
	this._hash = undefined;
};

CMEvent.prototype.isFollowed = function() {
	return !!this._rawdata.following;
};

CMEvent.prototype.follow = function() {
	this._rawdata.following = true;
	this._hash = undefined;
};

CMEvent.prototype.unfollow = function() {
	this._rawdata.following = false;
	this._hash = undefined;
};

CMEvent.prototype.matchesDate = function matchesDate(m) {
	if (!m) {
		m = datetime.moment();
	}
	const start = this.getStart();
	if (start) {
		let end = this.getEnd();
		if (!end) {
			end = start.add(1, 'hour');
		}
		return m.isSameOrAfter(start) && m.isSameOrBefore(end);
	} else {
		return false;
	}
};

CMEvent.prototype.getDisplayTime = function() {
	const start = this.getStart();
	let end, ret;
	if (start) {
		ret = start.format('h:mma');
		end = this.getEnd();
		if (end) {
			ret += '-' + end.format('h:mma');
		}
		const tzString = end? end.format('z') : start.format('z');
		if (tzString) {
			ret += ' ' + tzString;
		}
		return ret;
	}
	return undefined;
};

CMEvent.prototype.toEditableBean = function() {
	const start = this.getStart();
	const end = this.getEnd();

	const bean = {
		id: this.getId(),
		revision: this.getRevision(),
		startDate: start? start.toDate() : undefined,
		endDate: end? end.toDate() : undefined,
		summary: this.getSummary(),
		description: this.getDescription(),
		location: this.getLocation(),
		isOfficial: this.isOfficial()
	};

	bean.isValid = function() {
		if (bean.summary === undefined || bean.summary.trim() === '') { return false; }
		if (bean.startDate === undefined || bean.startDate === '') { return false; }

		if (bean.endDate && datetime.create(bean.endDate).isBefore(datetime.create(bean.startDate))) {
			return false;
		}

		return true;
	};

	return bean;
};

CMEvent.prototype.fromEditableBean = function(bean) {
	'use strict';
	this.setId(bean.id);
	this.setRevision(bean.revision);
	this.setStart(datetime.create(bean.startDate));
	this.setEnd(bean.endDate? datetime.create(bean.endDate) : null);
	this.setSummary(bean.summary);
	this.setDescription(bean.description);
	this.setLocation(bean.location);
	this.setFollowing(bean.following);
	this.setOfficial(bean.isOfficial);
};

CMEvent.prototype.toString = function() {
	return 'CMEvent[id=' + this._rawdata.id + ',summary=' + this._rawdata.title + ',followed=' + this.isFollowed() + ',official=' + (this.isOfficial()? 'true':'false') + ']';
};

CMEvent.prototype.getRawData = function() {
	return this._rawdata;
};

CMEvent.prototype.matches = function(searchString) {
	if (searchString === undefined || searchString === null || searchString === '') {
		return true;
	}

	if (this.getSummary() && this.getSummary().contains(searchString)) {
		return true;
	} else if (this.getDescription() && this.getDescription().contains(searchString)) {
		return true;
	} else if (this.getLocation() && this.getLocation().contains(searchString)) {
		return true;
	} else if (this._searchableStart && this._searchableStart.contains(searchString)) {
		return true;
	} else if (this._searchableEnd && this._searchableEnd.contains(searchString)) {
		return true;
	}

	return false;
};

CMDeck.prototype.getFloor = function() {
	return this._floor;
};

CMDeck.prototype.getAmenities = function() {
	return this._amenities;
};

CMDeck.prototype.matches = function(/* searchString */) {
	return true;
};

CMDeck.prototype.toString = function() {
	let ret = 'CMDeck[floor=' + this._floor + ',amenities=[';
	for (let i=0, len=this._amenities.length; i < len; i++) {
		const amenity = this._amenities[i];
		ret += amenity.toString();
		if (i+1 !== this._amenities.length) {
			ret += ',';
		}
	}
	ret += ']]';
	return ret;
};

CMAmenity.prototype.getDeck = function() {
	return this._deck;
};
CMAmenity.prototype.setDeck = function(deck) {
	this._deck = deck;
};

CMAmenity.prototype.getUniqueId = function() {
	return this._deck.getFloor() + '-' + this._id;
};

CMAmenity.prototype.getId = function() {
	return this._id;
};

CMAmenity.prototype.getSummary = function() {
	return this._summary;
};

CMAmenity.prototype.getIcon = function() {
	return this._icon;
};

CMAmenity.prototype.getCategory = function() {
	return this._category;
};

CMAmenity.prototype.getDescription = function() {
	return this._description;
};

CMAmenity.prototype.matches = function(searchString) {
	if (!searchString) {
		return true;
	}

	if (this.getSummary() !== undefined && this.getSummary().contains(searchString)) {
		return true;
	} else if (this.getDescription() !== undefined && this.getDescription().contains(searchString)) {
		return true;
	} else {
		const asNumber = parseInt(searchString, 10);
		if (asNumber === this.getDeck().getFloor()) {
			return true;
		}
	}

	return false;
};

CMAmenity.prototype.toString = function() {
	return 'CMAmenity[deck=' + this._deck.getFloor() + ',id=' + this._id + ',summary=' + this._summary + ']';
};

module.exports = {
	CMDay: CMDay,
	CMEvent: CMEvent,
	CMDeck: CMDeck,
	CMAmenity: CMAmenity
};
