'use strict';

if (typeof Array.prototype.remove !== 'function') {
	Array.prototype.remove = (item) => {
		const a = [item];
		let what, L = a.length, ax;
		while (L && this.length) {
			what = a[--L];
			while ((ax = this.indexOf(what)) !== -1) {
				this.splice(ax, 1);
			}
		}
		return this;
	};
}

if (!Array.prototype.includes) {
	Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
		const O = Object(this);
		const len = parseInt(O.length) || 0;
		if (len === 0) {
			return false;
		}
		// eslint-disable-next-line prefer-rest-params
		const n = parseInt(arguments[1]) || 0;
		let k;
		if (n >= 0) {
			k = n;
		} else {
			k = len + n;
			if (k < 0) {k = 0;}
		}
		let currentElement;
		while (k < len) {
			currentElement = O[k];
			if (searchElement === currentElement ||
				searchElement !== searchElement && currentElement !== currentElement) { // NaN !== NaN
				return true;
			}
			k++;
		}
		return false;
	};
}