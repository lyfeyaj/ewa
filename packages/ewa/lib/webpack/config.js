'use strict';

const fs = require('fs');
const path = require('path');
// const webpack = require('webpack');
const makeConfig = require('./makeConfig');

const USER_CONFIG_FILE = path.join(
  process.cwd(),
  'ewa.config.js'
);

let config = {};

if (fs.existsSync(USER_CONFIG_FILE)) {
  config = require(USER_CONFIG_FILE);
}

module.exports = makeConfig(config);
