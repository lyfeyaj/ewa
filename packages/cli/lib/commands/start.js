'use strict';

const path = require('path');
const utils = require('../utils');

module.exports = async function start() {
  utils.ensureEwaProject();

  const ROOT = process.cwd();

  await utils.checkUpdates();

  utils.log('正在启动项目实时编译...');

  const runEwa = path.resolve(ROOT, 'node_modules/ewa/lib/webpack/run.js');

  require(runEwa);
};
