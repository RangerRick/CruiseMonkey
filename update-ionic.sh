#!/bin/sh -ev

cp "$0" /tmp/ || :

pushd `dirname $0`
MYPATH=`pwd`
MYNAME=`basename $0`

if [ "$MYPATH" != "/tmp" ]; then
	echo "Restarting myself as '/tmp/$MYNAME'."
	exec "/tmp/$MYNAME" "$MYPATH"
fi

COMMIT="unknown"
CMDIR="$1"
echo "CruiseMonkey is '$CMDIR'."

pushd "${CMDIR}/ionic"
	rm -rf dist
	git pull
	npm install
	grunt
	COMMIT=`git log -1 | grep -E '^commit' | cut -d' ' -f2`
popd

pushd "${CMDIR}"
	CURRENT_BRANCH=`git branch | grep -E '^\*' | awk '{ print $2 }'`
	git stash
	git checkout ionic-pristine
	rsync -avr ionic/dist/js/ionic* app/scripts/angular-3rdparty/
	rsync -avr ionic/dist/fonts/ app/fonts/
	rsync -avr ionic/scss/ app/styles/
	git add app/scripts/angular-3rdparty/ionic* app/fonts app/styles/_* app/styles/ionic* app/styles/themes
	git commit -m "pristine ionic $COMMIT"
	git checkout "$CURRENT_BRANCH"
	git merge ionic-pristine
	git stash pop
popd
