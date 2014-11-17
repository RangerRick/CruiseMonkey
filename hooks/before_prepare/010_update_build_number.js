#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

if (rootdir) {
	var ourconfigfile = path.join(rootdir, "package.json");
	var configobj = JSON.parse(fs.readFileSync(ourconfigfile, 'utf8'));
	var buildNumber = configobj['build'];
	buildNumber = buildNumber + 1;

	configobj['build'] = buildNumber;
	fs.writeFileSync(ourconfigfile, JSON.stringify(configobj, null, '  '), 'utf8');
}
