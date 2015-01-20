/*global moment: true*/
/*global Modernizr: true*/

function stringifyDate(date) {
	'use strict';

	if (date === null || date === undefined) {
		return undefined;
	}
	return moment(date).format("YYYY-MM-DD HH:mm");
}

var dateStringFormat="YYYY-MM-DD HH:mm";
if (Modernizr.inputtypes["datetime-local"]) {
	dateStringFormat="YYYY-MM-DDTHH:mm";
}

var epochZero = stringifyDate(moment(0));

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
		self._rawdata.lastUpdated = moment(epochZero);
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
		self._rawdata.lastUpdated = moment(epochZero);
	}
}

CMDay.prototype.getId = function() {
	'use strict';
	return 'day-' + this.day.unix();
};
CMDay.prototype.clone = function() {
	'use strict';
	return new CMDay(this.day);
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
	return this._rawdata._id;
};
CMEvent.prototype.setId = function(id) {
	'use strict';
	this._rawdata._id = id;
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
	return this._rawdata.summary;
};
CMEvent.prototype.setSummary = function(summary) {
	'use strict';
	this._rawdata.summary = summary;
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
	if (this._day === undefined && this._rawdata.start !== undefined) {
		this._day = moment(this._rawdata.start).startOf('day');
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
	if (this._start === undefined && this._rawdata.start !== undefined) {
		this._start = moment(this._rawdata.start);
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
		this._rawdata.start = start;
	} else {
		this._rawdata.start = stringifyDate(start);
	}
	this._start = undefined;
	this._day = undefined;
};

CMEvent.prototype.getStartString = function() {
	'use strict';
	return this._rawdata.start;
};

CMEvent.prototype.setStartString = function(start) {
	'use strict';
	this._rawdata.start = start;
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
	if (this._end === undefined && this._rawdata.end !== undefined) {
		this._end = moment(this._rawdata.end);
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
		this._rawdata.end = end;
	} else {
		this._rawdata.end = stringifyDate(end);
	}
	this._end = undefined;
};

CMEvent.prototype.getEndString = function() {
	'use strict';
	return this._rawdata.end;
};
CMEvent.prototype.setEndString = function(end) {
	'use strict';
	this._rawdata.end = end;
	this._end = undefined;
};

CMEvent.prototype.getLastUpdated = function() {
	'use strict';
	return moment(this._rawdata.lastUpdated);
};
CMEvent.prototype.refreshLastUpdated = function() {
	'use strict';
	this._rawdata.lastUpdated = stringifyDate(moment());
};

CMEvent.prototype.getUsername = function() {
	'use strict';
	if (this._rawdata.username !== undefined && this._rawdata.username !== '') {
		return this._rawdata.username;
	}
	return undefined;
};
CMEvent.prototype.setUsername = function(username) {
	'use strict';
	this._rawdata.username = username;
};

CMEvent.prototype.getLocation = function() {
	'use strict';
	return this._rawdata.location;
};
CMEvent.prototype.setLocation = function(loc) {
	'use strict';
	this._rawdata.location = loc;
};

CMEvent.prototype.isPublic = function() {
	'use strict';
	return this._rawdata.isPublic;
};
CMEvent.prototype.setPublic = function(pub) {
	'use strict';
	this._rawdata.isPublic = pub;
};

CMEvent.prototype.isFavorite = function() {
	'use strict';
	return this._favorite !== undefined;
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
		isPublic: this.isPublic()
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
	this.setPublic(bean.isPublic);
};

CMEvent.prototype.toString = function() {
	'use strict';
	return 'CMEvent[id=' + this._rawdata._id + ',summary=' + this._rawdata.summary + ',favorite=' + this.isFavorite() + ',public=' + this.isPublic() + ']';
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
	this._rawdata.lastUpdated = stringifyDate(moment());
};

CMFavorite.prototype.toString = function() {
	'use strict';
	return 'CMFavorite[id=' + this.getId() + ',username=' + this.getUsername() + ',eventId=' + this.getEventId() + ']';
};

CMFavorite.prototype.getRawData = function() {
	'use strict';
	return this._rawdata;
};

