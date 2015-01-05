#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var lineReader = require('line-reader');

var rootdir = process.argv[2];

deleteFolderRecursive = function(path) {
	var files = [];
	if( fs.existsSync(path) ) {
		files = fs.readdirSync(path);
		files.forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

if (rootdir) {

	// go through each of the platform directories that have been prepared
	var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

	for (var x=0; x < platforms.length; x++) {
		var platform = platforms[x].trim().toLowerCase();
		var wwwpath;

		if(platform == 'android') {
			wwwpath = path.join('platforms', platform, 'assets', 'www');
		} else {
			wwwpath = path.join('platforms', platform, 'www');
		}

		var excludefile = path.join('www', '.cordovaignore');
		lineReader.eachLine(excludefile, function(line, last) {
			console.log('excluding: ' + line.trim());
			deleteFolderRecursive(path.join(wwwpath, line.trim()));
		});
	}

} else {
	console.warn('No rootdir specified!');
}
