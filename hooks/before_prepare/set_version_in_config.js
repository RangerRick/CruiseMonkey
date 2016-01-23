#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

function replace_string_in_file(filename, to_replace, replace_with) {
	var data = fs.readFileSync(filename, 'utf8');

	var result = data.replace(new RegExp(to_replace, "g"), replace_with);
	fs.writeFileSync(filename, result, 'utf8');
}

if (rootdir) {
	var configfile = path.join(rootdir, 'package.json'),
		configobj = JSON.parse(fs.readFileSync(configfile, 'utf8'));

	var filestoreplace = [
		'config.xml'
	];
	filestoreplace.forEach(function(val, index, array) {
		var fullfilename = path.join(rootdir, val);
		if (fs.existsSync(fullfilename)) {
			replace_string_in_file(fullfilename, ' version="\\d+\\.\\d+\\.\\d+"', ' version="' + configobj.version + '"');
			replace_string_in_file(fullfilename, 'ios-CFBundleVersion="[^"]*"', 'ios-CFBundleVersion="' + configobj.build + '"');
			replace_string_in_file(fullfilename, 'android-versionCode="[^"]*"', 'android-versionCode="' + configobj.build + '"');
		} else {
			console.log("missing: "+fullfilename);
		}
	});

}
