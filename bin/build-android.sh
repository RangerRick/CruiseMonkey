#!/bin/sh

BUILD_NUMBER=`node bin/update-build-number.js`

export ANDROID_VERSION_CODE="$BUILD_NUMBER"

ionic build --release android && bin/sign-android.sh
