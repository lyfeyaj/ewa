'use strict';

/* eslint no-console: "off" */

const path = require('path');
const execSync = require('child_process').execSync;
const utils = require('../utils');

module.exports = function start() {
  utils.checkEwaProject();

  const ROOT = process.cwd();

  const script = path.resolve(ROOT, 'node_modules/ewa/lib/webpack/run.js');
  const crossEnv = path.resolve(__dirname, '../../node_modules/.bin/cross-env');

  console.log('    正在以生产模式构建项目...');

  execSync(`cd ${ROOT} && ${crossEnv} NODE_ENV=production node ${script}`);

  console.log('    完成 !');
};
