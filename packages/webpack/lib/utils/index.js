'use strict';

/* eslint no-console: "off" */

const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

// 判断是否为 page 或者 component
function isPageOrComponent(file) {
  return !!(~file.indexOf('components/') || ~file.indexOf('pages/'));
}

// 去除 components 和 pages 重复路径, 如 navbar/navbar.js => navbar.js
function resolveOrSimplifyPath(baseDir, filepath, simplifyPath) {
  let relativePath = baseDir ? path.relative(baseDir, filepath) : filepath;
  if (simplifyPath && isPageOrComponent(relativePath)) {
    let extname = path.extname(relativePath);
    let name = path.basename(relativePath, extname);
    return relativePath.replace(`${name}/${name}${extname}`, `${name}${extname}`);
  } else {
    return relativePath;
  }
}

// 构建 entries
function buildDynamicEntries(baseDir, simplifyPath = false) {
  let wxFiles = glob.sync(
    path.join(baseDir, '**/*.{wxss,wxs,wxml}')
  );

  let otherFiles = glob.sync(
    path.join(baseDir, '**/*.{js,json}')
  );

  let entryDirs = { [baseDir]: true };

  let entries = {};

  wxFiles.map(function(file) {
    // 标记为微信页面或组件文件夹
    entryDirs[path.dirname(file)] = true;

    let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);
    entries[relativePath] = file;
  });

  otherFiles.map(function(file) {
    if (entryDirs[path.dirname(file)]) {
      let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);
      entries[relativePath] = file;
    }
  });

  return entries;
}

function escapeRegExpString(str) {
  // eslint-disable-next-line
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function pathToRegExp(p) {
  return new RegExp('^' + escapeRegExpString(p));
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
  resolveOrSimplifyPath,
  buildDynamicEntries,
  escapeRegExpString,
  isPageOrComponent,
  pathToRegExp,
  log
};
