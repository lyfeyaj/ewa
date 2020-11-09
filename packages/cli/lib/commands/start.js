'use strict';

const execSync = require('child_process').execSync;
const utils = require('../utils');

module.exports = async function start(type) {
  utils.ensureEwaProject();

  utils.checkUpdates();

  const ROOT = process.cwd();

  const script = require.resolve('ewa-webpack/lib/run.js');

  utils.log('正在启动项目实时编译...');

  execSync(
    `cd ${ROOT} && node ${script}`,
    {
      env: Object.assign({}, {
        NODE_ENV: 'development',
        EWA_ENV: type
      }, process.env),
      stdio: ['pipe', process.stdout, process.stderr]
    }
  );
};
