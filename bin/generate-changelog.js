#!/usr/bin/env node

var fs = require('fs');

require('conventional-changelog')({
  repository: '.',
  version: require('../package.json').version
}, function(err, log) {
  fs.writeFile('CHANGELOG.md', log);
});

