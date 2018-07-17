'use strict';

/* eslint no-console: "off" */

const fs = require('fs-extra');
const path = require('path');
const utils = require('../utils');

module.exports = function clean() {
  utils.checkEwaProject();

  const ROOT = process.cwd();

  const distDir = path.resolve(ROOT, 'dist');

  utils.log('正在清理 dist 目录... ');

  fs.emptyDirSync(distDir);

  utils.log('清理完成 !', 'success');
};
