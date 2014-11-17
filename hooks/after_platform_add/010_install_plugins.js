#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either the identifier, the filesystem location or the URL
var pluginlist = [
	// upstream cordova plugins
	'org.apache.cordova.camera',
//	'org.apache.cordova.console',
//	'org.apache.cordova.device',
//	'org.apache.cordova.device-orientation',
	'org.apache.cordova.dialogs',
	'org.apache.cordova.file',
	'org.apache.cordova.network-information',
	'org.apache.cordova.splashscreen',
	'org.apache.cordova.statusbar',
	'org.apache.cordova.vibration',

	// 3rd-party plugins
	'de.appplant.cordova.plugin.local-notification',
	'https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin',
	'https://github.com/VersoSolutions/CordovaClipboard',
	'https://github.com/VitaliiBlagodir/cordova-plugin-datepicker',
	//'org.pbernasconi.progressindicator',
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
	if (stdout) {
		console.log('INFO:  ' + stdout);
	}
	if (stderr) {
		console.log('DEBUG: ' + stderr);
	}
	if (error) {
		console.log('ERROR: ' + error);
	}
}

pluginlist.forEach(function(plug) {
	exec("cordova plugin add " + plug, puts);
});
