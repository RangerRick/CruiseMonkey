#!/bin/sh

mkdir -p temp
if [ -d "temp/cordova-android" ]; then
	pushd temp/cordova-android
		git pull
	popd
else
	git clone --branch crosswalk-engine https://github.com/RangerRick/cordova-android.git temp/cordova-android
fi
pushd temp/cordova-android
	npm install
popd

if [ -d "temp/cordova-crosswalk-engine" ]; then
	pushd "temp/cordova-crosswalk-engine"
		git pull
	popd
else
	git clone https://github.com/RangerRick/cordova-crosswalk-engine.git "temp/cordova-crosswalk-engine"
fi
pushd "temp/cordova-crosswalk-engine"
	sh -e fetch_libs.sh
	sh -e override.sh
popd

#if [ -d "temp/crosswalk" ]; then
#	pushd "temp/crosswalk"
#		git pull
#	popd
#else
#	git clone --branch "crosswalk-8" https://github.com/crosswalk-project/crosswalk.git "temp/crosswalk"
#fi
#pushd "temp/crosswalk"
#	
#popd

cordova plugin remove org.apache.cordova.engine.crosswalk
cordova platform remove android
cordova platform add temp/cordova-android
cordova plugin add temp/cordova-crosswalk-engine
pushd platforms/android
	android update lib-project --path "../../temp/cordova-crosswalk-engine/libs/xwalk_core_library" --target 4
popd
