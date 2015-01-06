#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files

var fs = require('fs.extra');
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

  var replaceContents = function(configobj, fullfilename) {
    // update the contents
    if (fs.existsSync(fullfilename)) {
      replace_string_in_file(fullfilename, '\\*\\*\\*VERSION\\*\\*\\*', configobj.version);
      replace_string_in_file(fullfilename, '\\*\\*\\*BUILD\\*\\*\\*', configobj.build);
      replace_string_in_file(fullfilename, 'var isMobile = false', 'var isMobile = true');
      replace_string_in_file(fullfilename, 'android\\:versionCode="[^"]*"', 'android:versionCode="' + configobj.build + '"');
      replace_string_in_file(fullfilename, 'android\\:versionName="[^"]*"', 'android:versionName="' + configobj.version + '"');
      replace_string_in_file(fullfilename, 'android\\:minSdkVersion="[^"]*"', 'android:minSdkVersion="' + configobj.minSdk + '"');
    } else {
      console.log('!!! missing ' + fullfilename);
    }
  }

if (rootdir) {
  var ourconfigfile = path.join(rootdir, "package.json");
  var configobj = JSON.parse(fs.readFileSync(ourconfigfile, 'utf8'));

  var roots = [
    'platforms/android/assets/www',
    'platforms/android',
    'platforms/ios/www',
  ];

  // CONFIGURE HERE
  // with the names of the files that contain tokens you want replaced.  Replace files that have been copied via the prepare step.
  var filestoreplace = [
    'scripts/cruisemonkey/Config.js',
    'index.html',
    'AndroidManifest.xml',
  ];

  roots.forEach(function(root) {
    filestoreplace.forEach(function(file) {
      var sourcefilename = rootdir + '/www/' + file;
      var fullfilename = rootdir + '/' + root + '/' + file;

      console.log('*** processing: ' + file);

      if (fs.existsSync(sourcefilename) && fs.existsSync(fullfilename)) {
        // if we have a pristine version of the file, copy it over first
        console.log('    ' + sourcefilename + ' -> ' + fullfilename);
        fs.unlinkSync(fullfilename);
        fs.copy(sourcefilename, fullfilename, function(err) {
          if (err) { throw err; }
          replaceContents(configobj, fullfilename);
        });
      } else {
        // source file does not exist, just do a normal replace
        replaceContents(configobj, fullfilename);
      }

    });
  });

}
