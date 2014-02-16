#!/bin/bash -e

SIGN=true
DEBUG=false
ANDROID=false
IOS=false
BLACKBERRY=false
WP7=false
PREPARE=false
while getopts "aibwdxph" opt; do
	case $opt in
		d)
			echo "- Don't Sign" >&2
			SIGN=false
			;;
		x)
			echo "- Using raw HTML/JavaScript (Debug)" >&2
			DEBUG=true
			;;
		p)
			echo "- Only do 'cordova prepare'" >&2
			PREPARE=true
			;;
		a)
			echo "- Build Android" >&2
			ANDROID=true
			;;
		i)
			echo "- Build iOS" >&2
			IOS=true
			;;
		b)
			echo "- Build Blackberry 10" >&2
			BLACKBERRY=true
			;;
		w)
			echo "- Build Windows Phone" >&2
			WP7=true
			;;
		h)
			cat <<END
usage: $0 [options]

	-h		This help
	-d		Don't Sign/Encrypt
	-x		Debug Mode (copies raw HTML/JavaScript rather than minified)
	-p		Only do 'cordova prepare' rather than 'cordova build'

	-a		Build Android
	-i		Build iOS
	-b		Build Blackberry 10
	-w		Build Windows Phone 7

END
			exit 0
			;;
		\?)
			echo "Invalid argument: -$OPTARG" >&2
			exit 1
			;;
	esac
done

if $SIGN && [ -z "$SIGNING_PASS" ]; then
	echo "You need to set \$SIGNING_PASS if you want to sign."
	exit 1
fi

DATESTAMP=`date '+%Y%m%d%H%M%S'`
VERSION=`grep '"version":' package.json | sed -e 's,  "version": ",,' -e 's/", *$//'`
SHORTVERSION=$VERSION
sed -e "s/'config.app.version', '[^']*/'config.app.version', '$VERSION/" app/scripts/cruisemonkey/Config.js > app/scripts/cruisemonkey/Config.js.bak
mv app/scripts/cruisemonkey/Config.js.bak app/scripts/cruisemonkey/Config.js

rm -rf "/Users/ranger/Library/Application Support/Ofi Labs"
rm -rf www platforms/{ios,android/assets,wp7,web}/www

if $DEBUG; then
	grunt build
	cp -R app/* www/
	cp -R .tmp/* www/
else
	grunt build
fi

#find * -name config.xml -exec perl -pi.bak -e "s/version=\"[^\"]*\"/version=\"$SHORTVERSION\"/" {} \; 2>/dev/null || :
mkdir -p platforms/{ios,android/assets,blackberry10,wp7,web}

cp -R www platforms/ios/
cp -R www platforms/android/assets/
cp -R www platforms/blackberry10/
cp -R www platforms/wp7/
cp -R www platforms/web/

chmod -R uga+rw www platforms/{ios,android/assets,blackberry10,wp7,web}/www

# iOS
rm -rf platforms/ios/www/cruisemonkey*.png
mv platforms/ios/www/_cordova.js platforms/ios/www/cordova.js
mv platforms/ios/www/_cordova_plugins.js platforms/ios/www/cordova_plugins.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' platforms/ios/www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' platforms/ios/www/template/*.html

# WP7
rm -rf platforms/wp7/www/cruisemonkey*.png
mv platforms/wp7/www/_cordova.js platforms/wp7/www/cordova.js
mv platforms/wp7/www/_cordova_plugins.js platforms/wp7/www/cordova_plugins.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' platforms/wp7/www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' platforms/wp7/www/template/*.html

# Blackberry 10
rm -rf platforms/blackberry10/www/cruisemonkey*.png
mv platforms/blackberry10/www/_cordova.js platforms/blackberry10/www/cordova.js
mv platforms/blackberry10/www/_cordova_plugins.js platforms/blackberry10/www/cordova_plugins.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' platforms/blackberry10/www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' platforms/blackberry10/www/template/*.html

# Android
rm -rf platforms/android/assets/www/cruisemonkey*.png
mv platforms/android/assets/www/_cordova.js platforms/android/assets/www/cordova.js
mv platforms/android/assets/www/_cordova_plugins.js platforms/android/assets/www/cordova_plugins.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' platforms/android/assets/www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' platforms/android/assets/www/template/*.html

# Source WWW
rm -rf www/cruisemonkey*.png
mv www/_cordova.js www/cordova.js
mv www/_cordova_plugins.js www/cordova_plugins.js
perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' www/index.html
perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' www/template/*.html

find * -name \*.bak -exec rm -rf {} \;

chmod -R uga+rw www platforms/{ios,android/assets,blackberry10,wp7,web}

BUILDCMD="build"
if $PREPARE; then
	BUILDCMD="prepare"
fi

if $ANDROID; then
	rm -rf platforms/android/bin
	VERSIONCODE=`cat platforms/android/AndroidManifest.xml | grep android:versionCode | sed -e 's,^.*android:versionCode=",,' -e 's,".*$,,'`
	NEWVERSIONCODE="$(($VERSIONCODE + 1))"
	perl -pi.bak -e "s,android:versionCode=\"$VERSIONCODE\",android:versionCode=\"$NEWVERSIONCODE\"," platforms/android/AndroidManifest.xml
	if $SIGN; then
		perl -pi.bak -e 's,android:debuggable="true",android:debuggable="false",g' platforms/android/AndroidManifest.xml
		cordova $BUILDCMD --release android
		if [ $BUILDCMD = "build" ]; then
			jarsigner -storepass "$SIGNING_PASS" -keystore ~/share/android/android-release-key.keystore -digestalg SHA1 -sigalg MD5withRSA platforms/android/bin/CruiseMonkey-release-unsigned.apk ranger
			zipalign -v 4 platforms/android/bin/CruiseMonkey-release-unsigned.apk platforms/android/bin/CruiseMonkey-release-signed.apk
		fi
	else
		perl -pi.bak -e 's,android:debuggable="false",android:debuggable="true",g' platforms/android/AndroidManifest.xml
		cordova $BUILDCMD android
	fi
fi
if $IOS; then
	/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
	/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $SHORTVERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
	if $SIGN; then
		cordova prepare --release ios
	else
		cordova prepare ios
	fi
	/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
	/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $SHORTVERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
fi
if $BLACKBERRY; then
	if $SIGN; then
		cordova $BUILDCMD blackberry10
	else
		cordova $BUILDCMD --release blackberry10 --keystorepass "$SIGNING_PASS"
	fi
fi
if $WP7; then
	if $SIGN; then
		cordova $BUILDCMD --release wp7
	else
		cordova $BUILDCMD wp7
	fi
fi
