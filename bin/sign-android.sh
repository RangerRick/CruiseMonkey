#!/bin/sh

EXTRA_ARGS=""
if [ -n "$SIGNING_PASS" ]; then
	EXTRA_ARGS="-storepass $SIGNING_PASS -keypass $SIGNING_PASS"
fi

rsync -avr "platforms/android/ant-build/MainActivity-release-unsigned.apk" "platforms/android/ant-build/CruiseMonkey-release-signed.apk"
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/share/android/android-release-key.keystore $EXTRA_ARGS "platforms/android/ant-build/CruiseMonkey-release-signed.apk" ranger
rm -f "platforms/android/ant-build/CruiseMonkey-release.apk"
zipalign -v 4 "platforms/android/ant-build/CruiseMonkey-release-signed.apk" "platforms/android/ant-build/CruiseMonkey-release.apk"
