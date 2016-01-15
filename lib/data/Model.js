'use strict';

//var inputTypes = require('modernizr/feature-detects/inputtypes');
var inputTypes;
var moment = require('moment');

var dateStringFormat='YYYY-MM-DD HH:mm';
if (inputTypes && inputTypes['datetime-local']) {
	dateStringFormat='YYYY-MM-DDTHH:mm';
} else {
	console.log('datetime-local not supported, or Modernizr not available');
}

function CMDay(d) {
	'use strict';
	this.day = d;
}

function CMEvent(data) {
	'use strict';

	var self = this;

	self._rawdata  = angular.copy(data) || {};
	self._favorite = undefined;
	self._day      = undefined;
	self._start    = undefined;
	self._end      = undefined;

	self._rawdata.type = 'event';

	if (self._rawdata.start === 'Invalid date') {
		self._rawdata.start = undefined;
	}
	if (self._rawdata.end === 'Invalid date') {
		self._rawdata.end = undefined;
	}
	if (self._rawdata.lastUpdated === 'Invalid date') {
		self._rawdata.lastUpdated = undefined;
	}
	if (self._rawdata.lastUpdated === undefined) {
		self._rawdata.lastUpdated = '1970-01-01 00:00';
	}

	delete self._rawdata.isFavorite;
	delete self._rawdata.isNewDay;
}

function CMFavorite(data) {
	'use strict';

	var self = this;

	self._rawdata  = angular.copy(data) || {};
	self._rawdata.type = 'favorite';
	self._event = undefined;

	if (self._rawdata.lastUpdated === 'Invalid date') {
		self._rawdata.lastUpdated = undefined;
	}
	if (self._rawdata.lastUpdated === undefined) {
		self._rawdata.lastUpdated = '1970-01-01 00:00';
	}
}

function CMDeck(floor, amenities) {
	var self = this;

	self.type = 'deck';
	self._floor = floor;
	self._amenities = [];

	for (var i=0, len=amenities.length, amenity; i < len; i++) {
		amenity = amenities[i];
		amenity.setDeck(self);
		self._amenities.push(amenity);
	}
}

function CMAmenity(id, summary, icon, category, description) {
	var self = this;

	self.type = 'amenity';
	self._id = id;
	self._summary = summary;
	self._icon = icon;
	self._category = category;
	self._description = description;
	self._deck = undefined;
}

CMDay.prototype.getId = function() {
	'use strict';
	return 'day-' + this.day.unix();
};
CMDay.prototype.clone = function() {
	'use strict';
	return new CMDay(this.day);
};

CMEvent._stringifyDate = function(date) {
	'use strict';

	if (date === null || date === undefined) {
		return undefined;
	}
	return moment(date).format('YYYY-MM-DD HH:mm');
};

CMEvent.prototype.clone = function() {
	'use strict';
	var newobj = new CMEvent(this._rawdata);
	if (this._favorite !== undefined) {
		newobj.setFavorite(new CMFavorite(this._favorite.getRawData()));
		newobj.getFavorite().setEvent(newobj);
	}
	newobj._day   = angular.copy(this._day);
	newobj._start = angular.copy(this._start);
	newobj._end   = angular.copy(this._end);
	newobj._even  = angular.copy(this._even);

	return newobj;
};

CMEvent.prototype.isEven = function() {
	'use strict';
	return this._even || false;
};
CMEvent.prototype.setEven = function(bool) {
	'use strict';
	this._even = bool;
};

CMEvent.prototype.getId = function() {
	'use strict';
	return this._rawdata.id;
};
CMEvent.prototype.setId = function(id) {
	'use strict';
	this._rawdata.id = id;
};

CMEvent.prototype.getRevision = function() {
	'use strict';
	return this._rawdata._rev;
};
CMEvent.prototype.setRevision = function(rev) {
	'use strict';
	this._rawdata._rev = rev;
};

CMEvent.prototype.getSummary = function() {
	'use strict';
	return this._rawdata.title;
};
CMEvent.prototype.setSummary = function(summary) {
	'use strict';
	this._rawdata.title = summary;
};

CMEvent.prototype.getFormattedDescription = function() {
	'use strict';
	return this._rawdata.description.replace(/[\n\r]/gm, '<br>');
};
CMEvent.prototype.getDescription = function() {
	'use strict';
	return this._rawdata.description;
};
CMEvent.prototype.setDescription = function(description) {
	'use strict';
	this._rawdata.description = description;
};

CMEvent.prototype.getDay = function() {
	'use strict';
	if (this._day === undefined && this._rawdata['start_time'] !== undefined) {
		this._day = moment(this._rawdata['start_time']).startOf('day');
	}
	return this._day;
};

/**
  * Get the start date as a Moment.js object.
  *
  * @return {Moment} the start date.
  */
CMEvent.prototype.getStart = function() {
	'use strict';
	if (this._start === undefined && this._rawdata['start_time'] !== undefined) {
		this._start = moment(this._rawdata['start_time']);
	}
	return this._start;
};

/**
  * Set the start date.  Accepts a moment, a Date, or a pre-formatted string.
  *
  * @param {start} The date to set.
  */
CMEvent.prototype.setStart = function(start) {
	'use strict';
	if (typeof start === 'string' || start instanceof String) {
		this._rawdata['start_time'] = start;
	} else {
		this._rawdata['start_time'] = CMEvent._stringifyDate(start);
	}
	this._start = undefined;
	this._day = undefined;
};

CMEvent.prototype.getStartString = function() {
	'use strict';
	return this._rawdata['start_time'];
};

CMEvent.prototype.setStartString = function(start) {
	'use strict';
	this._rawdata['start_time'] = start;
	this._start = undefined;
	this._day = undefined;
};

/**
  * Get the end date as a Moment.js object.
  *
  * @return {Moment} the end date.
  */
CMEvent.prototype.getEnd = function() {
	'use strict';
	if (this._end === undefined && this._rawdata['end_time'] !== undefined) {
		this._end = moment(this._rawdata['end_time']);
	}
	return this._end;
};

/**
  * Set the end date.  Accepts a moment, a Date, or a pre-formatted string.
  *
  * @param {end} The date to set.
  */
CMEvent.prototype.setEnd = function(end) {
	'use strict';
	if (typeof end === 'string' || end instanceof String) {
		this._rawdata['end_time'] = end;
	} else {
		this._rawdata['end_time'] = CMEvent._stringifyDate(end);
	}
	this._end = undefined;
};

CMEvent.prototype.getEndString = function() {
	'use strict';
	return this._rawdata['end_time'];
};
CMEvent.prototype.setEndString = function(end) {
	'use strict';
	this._rawdata['end_time'] = end;
	this._end = undefined;
};

CMEvent.prototype.getLastUpdated = function() {
	'use strict';
	return moment(this._rawdata.lastUpdated);
};
CMEvent.prototype.refreshLastUpdated = function() {
	'use strict';
	this._rawdata.lastUpdated = CMEvent._stringifyDate(moment());
};

CMEvent.prototype.getUsername = function() {
	'use strict';
	if (this._rawdata.author !== undefined && this._rawdata.author !== '') {
		return this._rawdata.author;
	}
	return undefined;
};
CMEvent.prototype.setUsername = function(username) {
	'use strict';
	this._rawdata.author = username;
};

CMEvent.prototype.getLocation = function() {
	'use strict';
	return this._rawdata.location;
};
CMEvent.prototype.setLocation = function(loc) {
	'use strict';
	this._rawdata.location = loc;
};

CMEvent.prototype.getVisibility = function() {
	'use strict';
	return this._rawdata.visibility? this._rawdata.visibility : 'self';
};
CMEvent.prototype.setVisibility = function(vis) {
	'use strict';
	this._rawdata.visibility = vis;
};

CMEvent.prototype.isFavorite = function() {
	'use strict';
	if (this._rawdata.author && this._rawdata.favorites) {
		return this._rawdata.favorites.indexOf(this._rawdata.author) >= 0;
	} else {
		return false;
	}
};
CMEvent.prototype.getFavorite = function() {
	'use strict';
	return this._favorite;
};
CMEvent.prototype.setFavorite = function(fav) {
	'use strict';
	this._favorite = fav;
};

CMEvent.prototype.getDisplayTime = function() {
	'use strict';
	var start = this.getStart(), end, ret;
	if (start) {
		ret = start.format('h:mma');
		end = this.getEnd();
		if (end) {
			ret += '-' + end.format('h:mma');
		}
		return ret;
	}
	return undefined;
};

CMEvent.prototype.toEditableBean = function() {
	'use strict';
	var end = this.getEnd();

	var bean = {
		id: this.getId(),
		revision: this.getRevision(),
		startDate: this.getStart().toDate(),
		endDate: end? end.toDate() : undefined,
		summary: this.getSummary(),
		description: this.getDescription(),
		location: this.getLocation(),
		isPublic: this.getVisibility() === 'all',
	};

	bean.isValid = function() {
		if (bean.summary === undefined || bean.summary.trim() === '') { return false; }
		if (bean.startDate === undefined || bean.startDate === '') { return false; }

		if (bean.endDate && moment(bean.endDate).isBefore(moment(bean.startDate))) {
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
	this.setStart(moment(bean.startDate));
	this.setEnd(bean.endDate? moment(bean.endDate) : undefined);
	this.setSummary(bean.summary);
	this.setDescription(bean.description);
	this.setLocation(bean.location);
	this.setVisibility(bean.isPublic? 'all':'self');
};

CMEvent.prototype.toString = function() {
	'use strict';
	return 'CMEvent[id=' + this._rawdata.id + ',summary=' + this._rawdata.title + ',favorite=' + this.isFavorite() + ',visibility=' + this.visibility() + ']';
};

CMEvent.prototype.getRawData = function() {
	'use strict';
	return this._rawdata;
};

CMEvent.prototype.matches = function(searchString) {
	'use strict';
	if (searchString === undefined || searchString === '') {
		return true;
	}

	if (this.getSummary() !== undefined && this.getSummary().contains(searchString)) {
		return true;
	} else if (this.getDescription() !== undefined && this.getDescription().contains(searchString)) {
		return true;
	} else if (this.getLocation() !== undefined && this.getLocation().contains(searchString)) {
		return true;
	} else if (this.getUsername().contains(searchString)) {
		return true;
	}

	return false;
};

CMFavorite.prototype.getId = function() {
	'use strict';
	return this._rawdata._id;
};
CMFavorite.prototype.setId = function(id) {
	'use strict';
	this._rawdata._id = id;
};
CMFavorite.prototype.getEventId = function() {
	'use strict';
	return this._rawdata.eventId;
};
CMFavorite.prototype.setEventId = function(eventId) {
	'use strict';
	this._rawdata.eventId = eventId;
};
CMFavorite.prototype.getUsername = function() {
	'use strict';
	return this._rawdata.username;
};
CMFavorite.prototype.setUsername = function(username) {
	'use strict';
	this._rawdata.username = username;
};

CMFavorite.prototype.getEvent = function() {
	'use strict';
	return this._event;
};
CMFavorite.prototype.setEvent = function(ev) {
	'use strict';
	this._event = ev;
};

CMFavorite.prototype.getLastUpdated = function() {
	'use strict';
	return moment(this._rawdata.lastUpdated);
};
CMFavorite.prototype.refreshLastUpdated = function() {
	'use strict';
	this._rawdata.lastUpdated = CMEvent._stringifyDate(moment());
};

CMFavorite.prototype.toString = function() {
	'use strict';
	return 'CMFavorite[id=' + this.getId() + ',username=' + this.getUsername() + ',eventId=' + this.getEventId() + ']';
};

CMFavorite.prototype.getRawData = function() {
	'use strict';
	return this._rawdata;
};

CMDeck.prototype.getFloor = function() {
	return this._floor;
};

CMDeck.prototype.getAmenities = function() {
	return this._amenities;
};

CMDeck.prototype.matches = function(searchString) {
	return true;
};

CMDeck.prototype.toString = function() {
	var ret = 'CMDeck[floor=' + this._floor + ',amenities=[';
	for (var i=0, len=this._amenities.length, amenity; i < len; i++) {
		var amenity = this._amenities[i];
		ret += amenity.toString();
		if (index+1 !== this._amenities.length) {
			ret += ',';
		}
	}
	ret += ']]';
	return ret;
};

CMAmenity.prototype.getDeck = function() {
	'use strict';
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
		var asNumber = parseInt(searchString, 10);
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
	CMFavorite: CMFavorite,
	CMDeck: CMDeck,
	CMAmenity: CMAmenity,
};