'use strict';

/* eslint no-console: "off" */

const path = require('path');
const fs = require('fs');

function isEwaProject() {
  let ROOT = process.cwd();

  let ewaDir = path.resolve(ROOT, '.ewa');

  return fs.existsSync(ewaDir);
}

function checkEwaProject() {
  if (isEwaProject()) return;
  console.log('    无法执行命令，不是一个有效的 EWA 项目');
  process.exit(0);
}

module.exports = {
  isEwaProject,
  checkEwaProject
};
