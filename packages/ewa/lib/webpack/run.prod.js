'use strict';

/* eslint no-console: "off" */

const path = require('path');
const execSync = require('child_process').execSync;

const configFile = path.resolve(__dirname, 'config.js');

module.exports = function(webpack) {
  execSync(`${webpack} --config ${configFile} --progress`);
};
