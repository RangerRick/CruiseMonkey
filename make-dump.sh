#!/bin/sh -e

DB="$1"

if [ -z "$DB" ]; then
	echo "usage: $0 <database_url>"
	echo ""
	exit 1
fi

DB_NAME=`echo $DB | sed -e 's,.*/,,'`
mkdir -p "export/_attachments"
pouchdb-dump "$DB" -o "export/_attachments/$DB_NAME.txt" -s 200

JS_FILE="dump.js"

pushd "export/_attachments" >/dev/null 2>&1
	echo "var pouchdbExports = {}; pouchdbExports['${DB_NAME}'] = [" > "$JS_FILE"
	ls -1 $DB_NAME*.txt | sort -u | while read FILE; do
		echo "	'$FILE'," >> "$JS_FILE"
	done
	echo "];" >> "$JS_FILE"
popd >/dev/null 2>&1

pushd "export" >/dev/null 2>&1
	couchapp --verbose push "${DB}-export"
popd
