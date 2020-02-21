#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var conf = require('../package.json');
const oldBuildNumber = conf['build'];
var newBuildNumber = oldBuildNumber + 1;

conf['build'] = newBuildNumber;
fs.writeFileSync('./package.json', JSON.stringify(conf, null, '  ') + '\n', 'utf8');

const gradle_regexp = new RegExp(`versionCode ${oldBuildNumber}`, 'mgu');
const build_gradle = fs.readFileSync('./android/app/build.gradle').toString().replace(gradle_regexp, `versionCode ${newBuildNumber}`);
console.log('build_gradle:', build_gradle);
fs.writeFileSync('./android/app/build.gradle', build_gradle);

const project_regexp = new RegExp(`CURRENT_PROJECT_VERSION = ${oldBuildNumber}`, 'mgu');
const project_pbxproj = fs.readFileSync('./ios/App/App.xcodeproj/project.pbxproj').toString().replace(project_regexp, `CURRENT_PROJECT_VERSION = ${newBuildNumber}`);
fs.writeFileSync('./ios/App/App.xcodeproj/project.pbxproj', project_pbxproj);

console.log(`${oldBuildNumber} -> ${newBuildNumber}`);
