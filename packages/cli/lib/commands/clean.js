'use strict';

/* eslint no-console: "off" */

const rimraf = require('rimraf').sync;
const path = require('path');
const utils = require('../utils');

module.exports = function clean() {
  utils.checkEwaProject();

  const ROOT = process.cwd();

  const distDir = path.resolve(ROOT, 'dist/*');

  console.log('    正在清理 dist 目录... ');

  rimraf(distDir);

  console.log('    完成 !');
};
