#!/bin/sh

DATESTAMP=`date '+%Y%m%d%H%M%S'`
sed -e "s,@date@,$DATESTAMP,g" package.json.in > package.json
VERSION=`grep '"version":' package.json | sed -e 's,  "version": ",,' -e 's/", *$//'`
sed -e "s/'config.app.version', '[^']*/'config.app.version', '$VERSION/" app/scripts/cruisemonkey/Config.js > app/scripts/cruisemonkey/Config.js.bak
mv app/scripts/cruisemonkey/Config.js.bak app/scripts/cruisemonkey/Config.js
grunt build
