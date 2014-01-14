#!/bin/sh -ev

DATESTAMP=`date '+%Y%m%d%H%M%S'`
sed -e "s,@date@,$DATESTAMP,g" package.json.in > package.json
VERSION=`grep '"version":' package.json | sed -e 's,  "version": ",,' -e 's/", *$//'`
SHORTVERSION=`echo $VERSION | sed -e 's,\+.*$,,'`
sed -e "s/'config.app.version', '[^']*/'config.app.version', '$VERSION/" app/scripts/cruisemonkey/Config.js > app/scripts/cruisemonkey/Config.js.bak
mv app/scripts/cruisemonkey/Config.js.bak app/scripts/cruisemonkey/Config.js
#/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
#/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $SHORTVERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist

grunt build

rsync -avr --delete www/ platforms/ios/www/
rsync -avr --delete www/ platforms/android/assets/www/
rsync -avr --delete www/ platforms/web/www/

echo "" > platforms/web/www/cordova.js
echo "" > platforms/web/www/cordova_plugins.js
echo "" > platforms/web/www/scripts/3rdparty/testflight.js

cordova build
