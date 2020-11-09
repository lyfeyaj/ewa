'use strict';

/* eslint no-console: "off" */

const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

// 基于构建环境替换文件后缀
// NOTE: 仅支持 从 微信小程序 转换为其他小程序，不支持 其他小程序 转换为 微信小程序
// NOTE: 无关逻辑需要清理
const WXML_LIKE_PATTERN = /\.(swan|wxml|axml|ttml)$/;
const WXSS_LIKE_PATTERN = /\.(wxss|css|acss|ttss)$/;
const WXS_LIKE_PATTERN = /\.(wxs|sjs)$/;
function chooseCorrectExtnameByBuildTarget(file, target) {
  // 替换 ts 后缀 为 js 文件
  if (/\.ts$/.test(file)) return file.replace(/\.ts$/, '.js');

  // 如果构建目标为 微信小程序
  if (target === 'weapp') {
    if (WXML_LIKE_PATTERN.test(file)) return file.replace(WXML_LIKE_PATTERN, '.wxml');
    if (WXSS_LIKE_PATTERN.test(file)) return file.replace(WXSS_LIKE_PATTERN, '.wxss');
    if (WXS_LIKE_PATTERN.test(file)) return file.replace(WXS_LIKE_PATTERN, '.wxs');
  }

  // 如果构建目标为 百度小程序
  if (target === 'swan') {
    if (WXML_LIKE_PATTERN.test(file)) return file.replace(WXML_LIKE_PATTERN, '.swan');
    if (WXSS_LIKE_PATTERN.test(file)) return file.replace(WXSS_LIKE_PATTERN, '.css');
    if (WXS_LIKE_PATTERN.test(file)) return file.replace(WXS_LIKE_PATTERN, '.sjs');
  }

  // 如果构建目标为 支付宝小程序
  if (target === 'alipay') {
    if (WXML_LIKE_PATTERN.test(file)) return file.replace(WXML_LIKE_PATTERN, '.axml');
    if (WXSS_LIKE_PATTERN.test(file)) return file.replace(WXSS_LIKE_PATTERN, '.acss');
    if (WXS_LIKE_PATTERN.test(file)) return file.replace(WXS_LIKE_PATTERN, '.sjs');
  }

  // 如果构建目标为 字节小程序
  if (target === 'tt') {
    if (WXML_LIKE_PATTERN.test(file)) return file.replace(WXML_LIKE_PATTERN, '.ttml');
    if (WXSS_LIKE_PATTERN.test(file)) return file.replace(WXSS_LIKE_PATTERN, '.ttss');
    if (WXS_LIKE_PATTERN.test(file)) return file.replace(WXS_LIKE_PATTERN, '.sjs');
  }

  // 其他文件直接返回
  return file;
}

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
function buildDynamicEntries(baseDir, simplifyPath = false, target = 'weapp') {
  let wxFiles = glob.sync(
    path.join(baseDir, '**/*.{wxss,wxs,sjs,wxml,swan,css,acss,ttml,ttss}')
  );

  let otherFiles = glob.sync(
    path.join(baseDir, '**/*.{ts,js,json}')
  );

  let entryDirs = { [baseDir]: true };

  let entries = {};

  wxFiles.map(function(file) {
    // 标记为微信页面或组件文件夹
    entryDirs[path.dirname(file)] = true;

    let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);
    relativePath = chooseCorrectExtnameByBuildTarget(relativePath, target);
    entries[relativePath] = file;
  });

  otherFiles.map(function(file) {
    if (entryDirs[path.dirname(file)]) {
      let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);
      relativePath = chooseCorrectExtnameByBuildTarget(relativePath, target);
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
