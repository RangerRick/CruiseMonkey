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
