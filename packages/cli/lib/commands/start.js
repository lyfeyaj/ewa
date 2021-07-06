'use strict';

const execSync = require('child_process').execSync;
const utils = require('../utils');

module.exports = async function start(type) {
  utils.ensureEwaProject(type);

  utils.checkUpdates();

  const ROOT = process.cwd();

  const script = require.resolve('ewa-webpack/lib/run.js');

  utils.log('正在启动项目实时编译...');

  execSync(
    `node "${script}"`,
    {
      cwd: ROOT,
      env: Object.assign({}, {
        NODE_ENV: 'development',
        EWA_ENV: type
      }, process.env),
      stdio: ['pipe', process.stdout, process.stderr]
    }
  );
};
