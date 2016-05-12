#!/usr/bin/env node
'use strict';
var spawnSync = require('child_process').spawnSync;
var fs = require('fs');
var semver = require('semver');

// Log the packaging environment to be included in the npm bundle
var lsExit = spawnSync('npm', ['ls']).status;
var npmVersion = spawnSync('npm', ['-v']).stdout.toString().trim();

var info = {
  'versions': process.versions,
  'platform': process.platform,
  'arch': process.arch,
  'npm ls exit code': lsExit,
  'npm version': npmVersion
};

fs.writeFileSync('.pre-publish-info', JSON.stringify(info, null, 2) + '\n');

if (lsExit !== 0) {
  console.error('ls exited with a', lsExit);
  process.exit(1);
}

// if (!semver.gt(npmVersion, '3.0.0') && !process.env.CI) {
//   console.log('npm version must be above 3.0.0 <', npmVersion);
//   process.exit(1);
// }

