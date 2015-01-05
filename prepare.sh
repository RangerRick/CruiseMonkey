#!/bin/sh

NPM=`which npm 2>/dev/null`
if [ -z "$NPM" ]; then
	echo "You must install node.js (and npm) before running this script!  http://nodejs.org/"
	exit 1
fi

sudo npm install -g bower cordova ionic || exit 1
npm install || exit 1
bower install || exit 1

bin/install-plugins.js || exit 1

echo "<html><head><title>CruiseMonkey</title></head><body>" > .index.html
commonmark README.markdown >> .index.html
echo "</body></html>" >> .index.html
mv .index.html index.html

echo "Now, run 'ionic platform ios' or 'ionic platform android' to set up your build."
