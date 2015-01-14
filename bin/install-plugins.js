#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either the identifier, the filesystem location or the URL
var addList = [
/* upstream cordova plugins */
//	'org.apache.cordova.camera',
	'org.apache.cordova.console',
//	'org.apache.cordova.device',
//	'org.apache.cordova.device-orientation',
	'org.apache.cordova.dialogs',
//	'org.apache.cordova.file',
	'org.apache.cordova.inappbrowser',
	'org.apache.cordova.network-information',
	'org.apache.cordova.splashscreen',
	'org.apache.cordova.statusbar',
//	'org.apache.cordova.vibration',

/* 3rd-party plugins */
	'https://github.com/VersoSolutions/CordovaClipboard.git',
	//'https://github.com/katzer/cordova-plugin-local-notifications.git',
	'de.appplant.cordova.plugin.local-notification',
	'https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git',
	'https://github.com/Paldom/SpinnerDialog.git',

/* android/ios only */
	'https://github.com/driftyco/ionic-plugins-keyboard.git',
	'https://github.com/RangerRick/cordova-certificate-plugin.git#4.0.x',
	'org.transistorsoft.cordova.plugin.background.fetch',
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

addList.forEach(function(plug) {
	console.log('*** Installing plugin: ' + plug);
	exec("cordova plugin add " + plug, puts);
});
