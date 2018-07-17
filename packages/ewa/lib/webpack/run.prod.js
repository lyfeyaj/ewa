'use strict';

/* eslint no-console: "off" */

const path = require('path');
const execSync = require('child_process').execSync;

const configFile = path.resolve(__dirname, 'config.js');

module.exports = function(webpack) {
  let cmd = [
    webpack,
    '--config',
    configFile,
    '--progress',
    '--colors',
    '--display=errors-only'
  ].join(' ');

  execSync(cmd, {
    env: process.env,
    stdio: ['pipe', process.stdout, process.stderr]
  });
};
