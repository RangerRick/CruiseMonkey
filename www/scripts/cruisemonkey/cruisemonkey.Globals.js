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
		return comparator === undefined? true : (this.toLowerCase().indexOf(comparator.toLowerCase()) > -1);
	};
}

if (typeof String.prototype.hashCode !== 'function') {
	/* jshint bitwise: false */
	String.prototype.hashCode = function() {
		'use strict';
		var hash=0, i, char;
		if (this.length === 0) { return hash; }
		for (i=0; i < this.length; i++) {
			char = this.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // convert to 32-bit integer
		}
		return hash;
	};
}

if (typeof Array.prototype.remove !== 'function') {
	'use strict';
	Array.prototype.remove = function() {
		var what, a = arguments, L = a.length, ax;
		while (L && this.length) {
			what = a[--L];
			while ((ax = this.indexOf(what)) !== -1) {
				this.splice(ax, 1);
			}
		}
		return this;
	};
}
