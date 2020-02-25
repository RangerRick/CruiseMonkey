#!/usr/bin/env node

const fs = require('fs');
const { writeFileSync, readFileSync } = fs;

const args = process.argv.slice(2);
const newVersion = args[0];

const conf = require('../package.json');
const oldBuildNumber = conf['build'];
var newBuildNumber = oldBuildNumber + 1;

conf['build'] = newBuildNumber;
if (newVersion) {
  conf['version'] = newVersion;
}
writeFileSync('./package.json', JSON.stringify(conf, null, '  ') + '\n', 'utf8');

const gradle_versionName_regexp = new RegExp(`versionName "\\S*"`, 'mgu');
const gradle_versionCode_regexp = new RegExp(`versionCode ${oldBuildNumber}`, 'mgu');
let build_gradle = readFileSync('./android/app/build.gradle').toString().replace(gradle_versionCode_regexp, `versionCode ${newBuildNumber}`);
if (newVersion) {
  build_gradle = build_gradle.replace(gradle_versionName_regexp, `versionName "${newVersion}"`);
}
writeFileSync('./android/app/build.gradle', build_gradle);

const project_version_regexp = new RegExp(`CURRENT_PROJECT_VERSION = ${oldBuildNumber}`, 'mgu');
const project_marketing_regexp = new RegExp(`MARKETING_VERSION = .*;`, 'mgu');
let project_pbxproj = readFileSync('./ios/App/App.xcodeproj/project.pbxproj').toString().replace(project_version_regexp, `CURRENT_PROJECT_VERSION = ${newBuildNumber}`);
if (newVersion) {
  project_pbxproj = project_pbxproj.replace(project_marketing_regexp, `MARKETING_VERSION = ${newVersion};`);
}
writeFileSync('./ios/App/App.xcodeproj/project.pbxproj', project_pbxproj);

console.log(`${oldBuildNumber} -> ${newBuildNumber}`);
