'use strict';

/* eslint no-console: "off" */

const path = require('path');
const execSync = require('child_process').execSync;

const webpackBin = path.resolve(__dirname, '../../node_modules/.bin/webpack');
const configFile = path.resolve(__dirname, 'config.js');

execSync(`${webpackBin} --config ${configFile}`);
