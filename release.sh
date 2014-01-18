#!/bin/bash -e

DONT_SIGN=false
SKIP_BUILD=false
while getopts "ds" opt; do
	case $opt in
		d)
			echo "don't sign" >&2
			DONT_SIGN=true
			;;
		s)
			echo "skip build" >&2
			SKIP_BUILD=true
			;;
		\?)
			echo "Invalid argument: -$OPTARG" >&2
			exit 1
			;;
	esac
done

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

if $SKIP_BUILD; then
	echo "Skipping build."
	exit 0
fi

cordova build --release

if $DONT_SIGN; then
	:
else
	jarsigner -keystore ~/share/android/android-release-key.keystore -digestalg SHA1 -sigalg MD5withRSA platforms/android/bin/CruiseMonkey-release-unsigned.apk ranger
	zipalign -v 4 platforms/android/bin/CruiseMonkey-release-unsigned.apk platforms/android/bin/CruiseMonkey-release-signed.apk
fi
