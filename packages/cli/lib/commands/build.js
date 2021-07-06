'use strict';

/* eslint no-console: "off" */

const execSync = require('child_process').execSync;
const utils = require('../utils');

module.exports = function build(type) {
  utils.ensureEwaProject(type);

  const ROOT = process.cwd();

  const script = require.resolve('ewa-webpack/lib/run.js');

  utils.log('正在以生产模式编译项目...');

  execSync(
    `node "${script}"`,
    {
      cwd: ROOT,
      env: Object.assign({}, {
        NODE_ENV: 'production',
        EWA_ENV: type
      }, process.env),
      stdio: ['pipe', process.stdout, process.stderr]
    }
  );

  utils.log('编译完成 !', 'success');
};
