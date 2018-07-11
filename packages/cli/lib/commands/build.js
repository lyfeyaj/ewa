'use strict';

/* eslint no-console: "off" */

const path = require('path');
const execSync = require('child_process').execSync;
const utils = require('../utils');

module.exports = function start() {
  utils.checkEwaProject();

  const ROOT = process.cwd();

  const script = path.resolve(ROOT, 'node_modules/ewa/lib/webpack/run.js');

  utils.log('正在以生产模式构建项目...');

  execSync(`cd ${ROOT} && npx --quiet cross-env NODE_ENV=production node ${script}`);

  utils.log('完成 !', 'success');
};
