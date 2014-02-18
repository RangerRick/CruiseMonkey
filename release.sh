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

prepare_ionic_scroll() {
	local wwwdir="$1";
	local ismobile=$2;

	echo "- preparing $wwwdir..."
	rm -rf "$wwwdir"/cruisemonkey*.png
	if $ismobile; then
		perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' "$wwwdir"/index.html
	else
		perl -pi.bak -e 's,var isMobile = true,var isMobile = false,g' "$wwwdir"/index.html
	fi
	perl -pi.bak -e 's,overflow-scroll="true",overflow-scroll="false",g' "$wwwdir"/template/*.html
	find * -name \*.bak -exec rm -rf {} \;
	chmod -R uga+rw "$wwwdir"
}

prepare_browser_scroll() {
	local wwwdir="$1";
	local ismobile=$2;

	echo "- preparing $wwwdir..."
	rm -rf "$wwwdir"/cruisemonkey*.png
	if $ismobile; then
		perl -pi.bak -e 's,var isMobile = false,var isMobile = true,g' "$wwwdir"/index.html
	else
		perl -pi.bak -e 's,var isMobile = true,var isMobile = false,g' "$wwwdir"/index.html
	fi
	perl -pi.bak -e 's,overflow-scroll="false",overflow-scroll="true",g' "$wwwdir"/template/*.html
	find * -name \*.bak -exec rm -rf {} \;
}

chmod -R uga+rw www

# Web
#prepare_browser_scroll "platforms/web/www" false
prepare_ionic_scroll "platforms/web/www" false

if $ANDROID; then
	rm -rf platforms/android/bin
	VERSIONCODE=`cat platforms/android/AndroidManifest.xml | grep android:versionCode | sed -e 's,^.*android:versionCode=",,' -e 's,".*$,,'`
	NEWVERSIONCODE="$(($VERSIONCODE + 1))"
	perl -pi.bak -e "s,android:versionCode=\"$VERSIONCODE\",android:versionCode=\"$NEWVERSIONCODE\"," platforms/android/AndroidManifest.xml
	ARGS=""
	APKIN="CruiseMonkey-debug.apk"
	APKOUT="CruiseMonkey-install.apk"
	# if $SIGN is set, we can't do a debug release
	if $SIGN; then
		ARGS="--release"
		APKIN="CruiseMonkey-release-unsigned.apk"
	fi

	cordova prepare android $ARGS
	if $DEBUG; then
		perl -pi.bak -e 's,android:debuggable="false",android:debuggable="true",g' platforms/android/AndroidManifest.xml
	else
		perl -pi.bak -e 's,android:debuggable="true",android:debuggable="false",g' platforms/android/AndroidManifest.xml
	fi
	prepare_ionic_scroll "platforms/android/assets/www" true
	if ! $PREPARE; then
		rm -rf platforms/android/bin/*.apk
		cordova compile android $ARGS
		if $SIGN; then
			jarsigner -storepass "$SIGNING_PASS" -keystore ~/share/android/android-release-key.keystore -digestalg SHA1 -sigalg MD5withRSA "platforms/android/bin/$APKIN" ranger
		fi
		zipalign -v 4 "platforms/android/bin/$APKIN" "platforms/android/bin/$APKOUT"
	fi
fi
if $IOS; then
	ARGS=""
	if ! $DEBUG; then
		ARGS="--release"
	fi
	cordova prepare ios $ARGS
	prepare_ionic_scroll "platforms/ios/www" true
	/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
	/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $SHORTVERSION" platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
	if ! $PREPARE; then
		echo 'You must build the iOS app in Xcode.'
	fi
fi
if $BLACKBERRY; then
	ARGS=""
	if $SIGN; then
		ARGS="--keystorepass $SIGNING_PASS"
	fi
	if ! $DEBUG; then
		ARGS="--release $ARGS"
	fi
	cordova prepare blackberry10 $ARGS
	prepare_ionic_scroll "platforms/blackberry10/www" true
	if ! $PREPARE; then
		cordova compile blackberry10 $ARGS
	fi
fi
if $WP7; then
	ARGS=""
	if ! $DEBUG; then
		ARGS="--release"
	fi
	cordova prepare wp7 $ARGS
	prepare_browser_scroll "platforms/wp7/www" true
	if ! $PREPARE; then
		cordova compile wp7 $ARGS
	fi
fi
