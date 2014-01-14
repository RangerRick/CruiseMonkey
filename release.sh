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

install -d -m 755 platforms/{ios,android/assets,web}/www

rsync -avr --delete www/ platforms/ios/www/
rsync -avr --delete www/ platforms/android/assets/www/
rsync -avr --delete www/ platforms/web/www/

rm -rf platforms/ios/www/*.png

mv platforms/ios/www/_cordova.js platforms/ios/www/cordova.js
mv platforms/ios/www/_cordova_plugins.js platforms/ios/www/cordova_plugins.js
mv platforms/ios/www/scripts/3rdparty/_testflight.js platforms/ios/www/scripts/3rdparty/testflight.js

mv platforms/android/assets/www/_cordova.js platforms/android/assets/www/cordova.js
mv platforms/android/assets/www/_cordova_plugins.js platforms/android/assets/www/cordova_plugins.js
mv platforms/android/assets/www/scripts/3rdparty/_testflight.js platforms/android/assets/www/scripts/3rdparty/testflight.js

cordova build "$@"
