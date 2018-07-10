'use strict';

/* eslint no-console: "off" */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

function isEwaProject() {
  let ROOT = process.cwd();

  let ewaDir = path.resolve(ROOT, '.ewa');

  return fs.existsSync(ewaDir);
}

function checkEwaProject() {
  if (isEwaProject()) return;
  log('无法执行命令，不是一个有效的 EWA 项目', 'error');
  process.exit(0);
}

const DEBUG_TYPES = {
  error: 'red',
  info: 'blue',
  warning: 'yellow',
  success: 'green'
};

function log(msg, type = 'info') {
  let color = DEBUG_TYPES[type] || 'blue';
  console.log(
    `[${new Date().toString().split(' ')[4]}]`,
    chalk[color]('[ewa] ' + msg)
  );
}

module.exports = {
  isEwaProject,
  checkEwaProject,
  log
};
