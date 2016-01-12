if (typeof String.prototype.capitalize !== 'function') {
	String.prototype.capitalize = function() {
		'use strict';
		return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
	};
}
if (typeof String.prototype.startsWith !== 'function') {
	String.prototype.startsWith = function(str) {
		'use strict';
		return this.lastIndexOf(str, 0) === 0;
	};
}
if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		'use strict';
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}
if (typeof String.prototype.contains !== 'function') {
	String.prototype.contains = function(comparator) {
		'use strict';
		if (comparator === undefined || comparator === null) {
			return true;
		}
		return (this.toLowerCase().indexOf(comparator.toLowerCase()) > -1);
	};
}

var removeFromArray = function(arr, item) {
	'use strict';
	var what, a = [item], L = a.length, ax;
	while (L && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
};

var arrayIncludes = function(arr, searchElement) {
	'use strict';
	var O = Object(arr);
	var len = parseInt(O.length) || 0;
	if (len === 0) {
		return false;
	}
	var n = 0;
	var k;
	if (n >= 0) {
		k = n;
	} else {
		k = len + n;
		if (k < 0) {k = 0;}
	}
	var currentElement;
	while (k < len) {
		currentElement = O[k];
		if (searchElement === currentElement ||
			 (searchElement !== searchElement && currentElement !== currentElement)) {
			return true;
		}
		k++;
	}
	return false;
};
