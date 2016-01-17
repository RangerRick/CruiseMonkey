'use strict';

//var inputTypes = require('modernizr/feature-detects/inputtypes');
var inputTypes;
var moment = require('moment');
require('moment-timezone');

var dateStringFormat='YYYY-MM-DDTHH:mm:ss.SSSZ';
//if (inputTypes && inputTypes['datetime-local']) {
//	dateStringFormat='YYYY-MM-DDTHH:mm';
//} else {
//	/* eslint-disable no-console */
//	console.log('datetime-local not supported, or Modernizr not available');
//	/* eslint-enable no-console */
//}

function CMDay(d) {
	this.day = d;
}

function CMEvent(data) {
	var self = this;

	self._rawdata  = angular.copy(data) || {};
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

	delete self._rawdata.isNewDay;
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
	return 'day-' + this.day.unix();
};

CMDay.prototype.clone = function() {
	return new CMDay(this.day);
};

CMEvent._stringifyDate = function(date) {
	if (date === null || date === undefined) {
		return undefined;
	}
	return moment(date).format(dateStringFormat);
};

CMEvent.prototype.clone = function() {
	var newobj = new CMEvent(this._rawdata);
	newobj._day   = angular.copy(this._day);
	newobj._start = angular.copy(this._start);
	newobj._end   = angular.copy(this._end);
	newobj._even  = angular.copy(this._even);

	return newobj;
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
};

CMEvent.prototype.getFormattedDescription = function() {
	return this._rawdata.description.replace(/[\n\r]/gm, '<br>');
};

CMEvent.prototype.getDescription = function() {
	return this._rawdata.description;
};

CMEvent.prototype.setDescription = function(description) {
	this._rawdata.description = description;
};

CMEvent.prototype.getDay = function() {
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
	if (this._start === undefined && this._rawdata['start_time'] !== undefined) {
		this._start = moment(this._rawdata['start_time']);
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
	return this._rawdata['start_time'];
};

CMEvent.prototype.getStartString = function() {
	return this._rawdata['start_time'];
};

CMEvent.prototype.setStartString = function(start) {
	this._rawdata['start_time'] = start;
	this._start = undefined;
	this._day = undefined;
};

/**
  * Get the end date as a Moment.js object.
  *
  * @return {Moment} The end date.
  */
CMEvent.prototype.getEnd = function() {
	if (this._end === undefined && this._rawdata['end_time'] !== undefined) {
		this._end = moment(this._rawdata['end_time']);
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
	} else {
		this._rawdata['end_time'] = CMEvent._stringifyDate(end);
	}
	this._end = undefined;
	return this._rawdata['end_time'];
};

CMEvent.prototype.getEndString = function() {
	return this._rawdata['end_time'];
};

CMEvent.prototype.setEndString = function(end) {
	this._rawdata['end_time'] = end;
	this._end = undefined;
};

CMEvent.prototype.getLastUpdated = function() {
	return moment(this._rawdata.lastUpdated);
};

CMEvent.prototype.refreshLastUpdated = function() {
	this._rawdata.lastUpdated = CMEvent._stringifyDate(moment());
};

CMEvent.prototype.getUsername = function() {
	if (this._rawdata.author !== undefined && this._rawdata.author !== '') {
		return this._rawdata.author;
	}
	return undefined;
};

CMEvent.prototype.setUsername = function(username) {
	this._rawdata.author = username;
};

CMEvent.prototype.getLocation = function() {
	return this._rawdata.location;
};

CMEvent.prototype.setLocation = function(loc) {
	this._rawdata.location = loc;
};

CMEvent.prototype.getVisibility = function() {
	return this._rawdata.visibility? this._rawdata.visibility : 'self';
};

CMEvent.prototype.setVisibility = function(vis) {
	this._rawdata.visibility = vis;
};

CMEvent.prototype.isOfficial = function() {
	return this._rawdata.official;
};

CMEvent.prototype.setOfficial = function(official) {
	this._rawdata.official = official;
};

CMEvent.prototype.getFavorites = function() {
	return this._rawdata.favorites;
};

CMEvent.prototype.isFavorite = function(username) {
	if (this._rawdata.favorites) {
		return this._rawdata.favorites.indexOf(username) >= 0;
	} else {
		return false;
	}
};

CMEvent.prototype.addFavorite = function(username) {
	if (this.isFavorite(username)) {
		// already a favorite, do nothing
		return;
	} else {
		this._rawdata.favorites.push(username);
	}
};

CMEvent.prototype.removeFavorite = function(username) {
	this._rawdata.favorites.remove(username);
};

CMEvent.prototype.getDisplayTime = function() {
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
		isOfficial: this.isOfficial()
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
	this.setOfficial(bean.isOfficial);
};

CMEvent.prototype.toString = function() {
	return 'CMEvent[id=' + this._rawdata.id + ',summary=' + this._rawdata.title + ',favorites=' + this.getFavorites() + ',visibility=' + this.getVisibility() + ',official=' + this.isOfficial() + ']';
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
	} else if (this.getUsername().contains(searchString)) {
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
	CMDeck: CMDeck,
	CMAmenity: CMAmenity
};