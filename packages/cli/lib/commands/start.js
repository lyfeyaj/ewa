'use strict';

const path = require('path');
const utils = require('../utils');

module.exports = function start() {
  utils.checkEwaProject();

  const ROOT = process.cwd();

  const runEwa = path.resolve(ROOT, 'node_modules/ewa/lib/webpack/run.js');

  require(runEwa);
};
