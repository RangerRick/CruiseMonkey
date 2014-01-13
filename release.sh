#!/bin/sh

DATESTAMP=`date '+%Y%m%d%H%M%S'`
sed -e "s,@date@,$DATESTAMP,g" package.json.in > package.json
grunt build
