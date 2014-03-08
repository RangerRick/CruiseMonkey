#!/bin/sh -ev

pushd `dirname $0`
MYPATH=`pwd`
MYNAME=`basename $0`

if [ "$MYPATH" != "/tmp" ]; then
	cp "$0" /tmp/ || :
	echo "Restarting myself as '/tmp/$MYNAME'."
	exec "/tmp/$MYNAME" "$MYPATH"
fi

COMMIT="unknown"
CMDIR="$1"
echo "CruiseMonkey is '$CMDIR'."

pushd "${CMDIR}/ionic"
	rm -rf dist
	git checkout master
	git pull
	npm install && sudo npm install -g gulp protractor
	gulp build --release
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
	if git diff HEAD --quiet; then
		echo "No changes."
		git checkout "$CURRENT_BRANCH"
	else
		git commit -m "pristine ionic $COMMIT"
		git checkout "$CURRENT_BRANCH"
		git merge ionic-pristine
	fi
	git stash pop
popd
