#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

function replace_string_in_file(filename, to_replace, replace_with) {
  var data = fs.readFileSync(filename, 'utf8');

  var result = data.replace(new RegExp(to_replace, "g"), replace_with);
  fs.writeFileSync(filename, result, 'utf8');
}

var target = "stage";
if (process.env.TARGET) {
  target = process.env.TARGET;
}

if (rootdir) {
  var ourconfigfile = path.join(rootdir, "package.json");
  var configobj = JSON.parse(fs.readFileSync(ourconfigfile, 'utf8'));

  // CONFIGURE HERE
  // with the names of the files that contain tokens you want replaced.  Replace files that have been copied via the prepare step.
  var filestoreplace = [
    // android
    "platforms/android/assets/www/scripts/cruisemonkey/Config.js",
    "platforms/android/assets/www/index.html",
    "platforms/android/AndroidManifest.xml",
    // ios
    "platforms/ios/www/scripts/cruisemonkey/Config.js",
    "platforms/ios/www/index.html",
  ];
  filestoreplace.forEach(function(val, index, array) {
    var fullfilename = path.join(rootdir, val);
    if (fs.existsSync(fullfilename)) {
      replace_string_in_file(fullfilename, '\\*\\*\\*VERSION\\*\\*\\*', configobj.version);
      replace_string_in_file(fullfilename, 'var isMobile = false', 'var isMobile = true');
      replace_string_in_file(fullfilename, 'android\\:versionCode="[^"]*"', 'android:versionCode="' + configobj.build + '"');
      replace_string_in_file(fullfilename, 'android\\:versionName="[^"]*"', 'android:versionName="' + configobj.version + '"');
    } else {
      //console.log("missing: "+fullfilename);
    }
  });

}
