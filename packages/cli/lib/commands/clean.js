'use strict';

/* eslint no-console: "off" */

const fs = require('fs-extra');
const path = require('path');
const utils = require('../utils');

module.exports = function clean(type) {
  utils.ensureEwaProject(type);

  const ROOT = process.cwd();

  const distDirName = utils.outputDirByType(type);
  const distDirPath = path.resolve(ROOT, distDirName);

  utils.log(`正在清理 ${distDirName} 目录... `);

  fs.emptyDirSync(distDirPath);

  utils.log('清理完成 !', 'success');
};
