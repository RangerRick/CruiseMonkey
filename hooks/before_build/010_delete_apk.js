#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

String.prototype.endsWith = function(s) {
	return this.length >= s.length && this.substr(this.length - s.length) == s;
};

var deleteApksRecursive = function(p) {
	var files = [];
	if (fs.existsSync(p)) {
		files = fs.readdirSync(p);
		files.forEach(function(file) {
			var curFile = path.join(p, file);
			if (fs.lstatSync(curFile).isDirectory()) {
				deleteApksRecursive(curFile);
			} else {
				if (file.endsWith('.apk')) {
					console.info('*** Deleting: ' + curFile);
					fs.unlinkSync(curFile);
				}
			}
		});
	}
};

if (rootdir) {
	deleteApksRecursive(path.join('platforms', 'android'));
} else {
	console.warn('No rootdir specified!');
}
