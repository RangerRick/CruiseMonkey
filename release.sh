#!/bin/bash -e

DONT_SIGN=false
SKIP_BUILD=false
DEBUG=false
while getopts "dsx" opt; do
	case $opt in
		d)
			echo "don't sign" >&2
			DONT_SIGN=true
			;;
		s)
			echo "skip build" >&2
			SKIP_BUILD=true
			;;
		x)
			echo "debug" >&2
			DEBUG=true
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

rm -rf www platforms/{ios,android/assets,wp7,web}/www

if $DEBUG; then
	grunt build
	cp -R app/* www/
	cp -R .tmp/* www/
else
	grunt build
fi

find * -name config.xml -exec perl -pi.bak -e "s/version=\"[^\"]*\"/version=\"$SHORTVERSION\"/" {} \; 2>/dev/null || :
mkdir -p platforms/{ios,android/assets,wp7,web}

cp -R www platforms/ios/
cp -R www platforms/android/assets/
cp -R www platforms/wp7/
cp -R www platforms/web/

chmod -R 666 www platforms/{ios,android/assets,wp7,web}/www

# iOS
rm -rf platforms/ios/www/cruisemonkey*.png
mv platforms/ios/www/_cordova.js platforms/ios/www/cordova.js
mv platforms/ios/www/_cordova_plugins.js platforms/ios/www/cordova_plugins.js
mv platforms/ios/www/scripts/3rdparty/_testflight.js platforms/ios/www/scripts/3rdparty/testflight.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' platforms/ios/www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' platforms/ios/www/template/*.html

# WP7
rm -rf platforms/wp7/www/cruisemonkey*.png
mv platforms/wp7/www/_cordova.js platforms/wp7/www/cordova.js
mv platforms/wp7/www/_cordova_plugins.js platforms/wp7/www/cordova_plugins.js
mv platforms/wp7/www/scripts/3rdparty/_testflight.js platforms/wp7/www/scripts/3rdparty/testflight.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' platforms/wp7/www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' platforms/wp7/www/template/*.html

# Android
rm -rf platforms/android/assets/www/cruisemonkey*.png
mv platforms/android/assets/www/_cordova.js platforms/android/assets/www/cordova.js
mv platforms/android/assets/www/_cordova_plugins.js platforms/android/assets/www/cordova_plugins.js
mv platforms/android/assets/www/scripts/3rdparty/_testflight.js platforms/android/assets/www/scripts/3rdparty/testflight.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' platforms/android/assets/www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' platforms/android/assets/www/template/*.html

# Source WWW
rm -rf www/cruisemonkey*.png
mv www/_cordova.js www/cordova.js
mv www/_cordova_plugins.js www/cordova_plugins.js
mv www/scripts/3rdparty/_testflight.js www/scripts/3rdparty/testflight.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' www/template/*.html

find platforms/{ios,android/assets,wp7,web}/www -name \*.bak -exec rm -rf {} \;

chmod -R 666 www platforms/{ios,android/assets,wp7,web}

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
