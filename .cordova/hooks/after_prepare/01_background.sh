#!/bin/sh

plutil -replace UIApplicationExitsOnSuspend -bool NO platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist

if [ `grep -c 'UIBackgroundModes' platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist` -eq 0 ]; then
	/usr/libexec/PlistBuddy -c 'add :UIBackgroundModes array' platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
fi

if [ `grep -c '>location<' platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist` -eq 0 ]; then
	/usr/libexec/PlistBuddy -c 'Add :UIBackgroundModes:0 string location' platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
fi

if [ `grep -c '>fetch<' platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist` -eq 0 ]; then
	/usr/libexec/PlistBuddy -c 'Add :UIBackgroundModes:0 string fetch' platforms/ios/CruiseMonkey/CruiseMonkey-Info.plist
fi
