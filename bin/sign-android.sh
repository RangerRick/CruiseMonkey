#!/bin/sh

EXTRA_ARGS=""
if [ -n "$SIGNING_PASS" ]; then
	EXTRA_ARGS="-storepass $SIGNING_PASS -keypass $SIGNING_PASS"
fi

sign_jar() {
	local JAR="$1";
}

find platforms/android -name \*-debug.apk -o -name \*-release-unsigned.apk | while read APKFILE; do
	SIGNME=`echo "$APKFILE" | perl -p -e 's,-[^\-]*.apk,-signme.apk,g'`
	SIGNED=`echo "$APKFILE" | perl -p -e 's,-[^\-]*.apk,-signed.apk,g'`

	echo "source APK: $APKFILE"
	echo "signing: $SIGNME"

	rsync -avr "$APKFILE" "$SIGNME"
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/share/android/android-release-key.keystore $EXTRA_ARGS "$SIGNME" ranger
	rm -f "$SIGNED"
	zipalign -v 4 "$SIGNME" "$SIGNED"

	echo "signed: $SIGNED"
done
