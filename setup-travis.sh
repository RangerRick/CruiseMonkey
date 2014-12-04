#!/bin/bash

node_modules/.bin/pouchdb-server -m -p 5999 &
perl -pi -e 's,5984,5999,g' spec/*
#sleep 5
#pushd couchdb
#	couchapp --verbose push http://localhost:5999/test-pristine
#popd
