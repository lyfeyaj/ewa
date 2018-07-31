'use strict';

const utils = require('../utils');
const execSync = require('child_process').execSync;

// 升级 EWA 工具
module.exports = function upgrade() {
  // 升级全局 ewa-cli
  utils.log('正在升级 EWA 工具...');

  execSync('npm i ewa-cli@latest -g');

  if (utils.isEwaProject()) {
    execSync('npm i -D ewa-cli@latest ewa@latest');
  }

  utils.log('升级完成！', 'success');
};
