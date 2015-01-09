#!/usr/bin/env node

// ================================================================
// Read the platforms/ios/<appname>/Classes/AppDelegate.m
// and comment out the following functions:
// 1. didRegisterForRemoteNotificationsWithDeviceToken
// 2. didFailToRegisterForRemoteNotificationsWithError
// ================================================================
var fs = require('fs');
var sys = require('sys')

sys.puts('');
sys.puts('# ================================================================');
sys.puts('# HOOK: ios-remote-notification-fix.js');
sys.puts('# ================================================================');

// The file to change (and its backup).
var fn = 'platforms/ios/CruiseMonkey/Classes/AppDelegate.m';
var fno = fn + '.orig';  // backup

// Make sure that this hook is re-entrant.
if (fs.existsSync(fn) && !fs.existsSync(fno)) {
	sys.puts('INFO: creating ' + fno);
	fs.writeFileSync(fno, fs.readFileSync(fn));
	fs.readFile(fn, function(err, data) {
		if (!data) {
			sys.puts('ERROR: could not read file: "' + fn + '"');
			process.exit(1);
		}
		sys.puts('INFO: read ' + fn);
		sys.puts('INFO:   ' + data.length + ' bytes');

		// Convert to lines for parsing.
		var lines = [];
		var line = '';
		for(var i=0; i<data.length; i++) {
			var ch = String.fromCharCode(data[i]);
			line += ch;
			if (data[i] == 10) {
				lines.push(line);
				line = '';
			}
		}
		if (line.length > 0) {
			lines.push(line);
		}
		sys.puts('INFO:   ' + lines.length + ' lines');

		// Filter out the functions in question using line parsing.
		var fcts = [ 'didRegisterForRemoteNotificationsWithDeviceToken',
					 'didFailToRegisterForRemoteNotificationsWithError'];
		var newlines = [];
		var start = 0;
		for(var i=0; i<lines.length; i++) {
			var line = lines[i];

			// See if one of the functions is found. If it is
			// we are one line beyond what needs to be filtered
			// out.
			//
			// Example:
			//
			//   - (void)								 application:(UIApplication*)application
			//	 didFailToRegisterForRemoteNotificationsWithError:(NSError*)error
			// {
			//	 // re-post ( broadcast )
			//	 [[NSNotificationCenter defaultCenter] postNotificationName:CDVRemoteNotificationError object:error];
			// }
			//
			var found = false;
			for(var j=0; j<fcts.length; j++) {
				if (line.indexOf(fcts[j]) >=0 ) {
					found = true;
					break
				}
			}

			// The function was found, ignore it.
			if (found) {
				// We are one past the lines to ignore.
				var end = i - 1;
				for(var j=start; j<end; j++) {
					newlines.push(lines[j]);
				}

				// Skip the function code and reset start.
				for(; i<lines.length; i++) {
					line = lines[i];
					var j = line.indexOf('}');
					if (j >= 0 && j <= 2) {
						// + 2 because we know by inspection that there is
						// a trailing empty line.
						start = i + 2;
						break;
					}
				}
			}
		}
		for(var i=start; i<lines.length; i++) {
			var line = lines[i];
			// Handle the case where the last line does not end with a new line.
			if (line.indexOf('\n') < 0) {
				line += '\n';
			}
			newlines.push(line);
		}
		var newdata = newlines.join('');
		sys.puts('INFO: writing ' + fn);
		sys.puts('INFO:   ' + newdata.length + ' bytes');
		sys.puts('INFO:   ' + newlines.length + ' lines');
		fs.writeFileSync(fn, newdata);
	});
}

sys.puts('# ================================================================');
sys.puts('# DONE: ios-remote-notification-fix.js');
sys.puts('# ================================================================');
