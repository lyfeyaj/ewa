'use strict';

const utils = require('../utils');

module.exports = async function start() {
  utils.ensureEwaProject();

  utils.checkUpdates();

  utils.log('正在启动项目实时编译...');

  const runEwa = require.resolve('ewa-webpack/lib/webpack/run.js');

  require(runEwa);
};
