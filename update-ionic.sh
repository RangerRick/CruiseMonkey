#!/bin/sh -ev

cp "$0" /tmp/ >/dev/null 2>&1

pushd `dirname $0` >/dev/null 2>&1
MYPATH=`pwd`
MYNAME=`basename $0`

if [ "$MYPATH" != "/tmp" ]; then
	echo "Restarting myself as '/tmp/$MYNAME'."
	exec "/tmp/$MYNAME" "$MYPATH"
fi

COMMIT="unknown"
CMDIR="$1"
echo "CruiseMonkey is '$CMDIR'."

pushd "${CMDIR}/ionic" >/dev/null 2>&1
	rm -rf dist
	git pull
	grunt
	COMMIT=`git log -1 | grep -E '^commit' | cut -d' ' -f2`
popd >/dev/null 2>&1

git checkout ionic-pristine
rsync -avr ionic/dist/js/ionic* app/scripts/angular-3rdparty/
rsync -avr ionic/dist/fonts/ app/fonts/
rsync -avr ionic/scss/ app/styles/
git add app/scripts/angular-3rdparty/ionic* app/fonts app/styles/_* app/styles/ionic* app/styles/themes
git commit -m "pristine ionic $COMMIT"
git checkout master
git merge ionic-pristine
