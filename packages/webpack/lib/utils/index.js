'use strict';

/* eslint no-console: "off" */

const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

// 常量
const TS_PATTERN = /\.ts$/;
const CSS_PATTERN = /\.(less|sass|scss)$/;

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
  // 查找所有微信小程序文件
  let wxFiles = glob.sync(
    path.join(baseDir, '**/*.{wxss,wxs,wxml}')
  );

  // 其他小程序相关文件
  // 支持 scss 和 less 当做 wxss 用
  // 支持 ts 编译为 js
  let otherFiles = glob.sync(
    path.join(baseDir, '**/*.{ts,js,json,scss,sass,less}')
  );

  let entryDirs = { [baseDir]: true };

  let entries = {};

  // 遍历所有的微信文件用于生成 entry 对象
  wxFiles.map(function(file) {
    // 标记为微信页面或组件文件夹
    entryDirs[path.dirname(file)] = true;

    let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);

    entries[relativePath] = file;
  });

  // 仅当被标记为微信小程序的页面或者组件文件夹的内容才会被作为 entry
  otherFiles.map(function(file) {
    if (entryDirs[path.dirname(file)]) {
      let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);

      // 支持直接使用 ts
      if (TS_PATTERN.test(relativePath)) relativePath = relativePath.replace(TS_PATTERN, '.js');

      // 支持直接使用 less 或 scss, 需要对应的 cssParser 设置支持
      if (CSS_PATTERN.test(relativePath)) relativePath = relativePath.replace(CSS_PATTERN, '.wxss');

      // 如果 已存在，则提示错误
      // js 文件优先级 高于 ts
      // wxss 文件优先级 高于 less 和 sass
      if (entries[relativePath]) {
        log(`入口文件 \`${relativePath}\` 已存在，忽略 \`${file}\``);
        return;
      }

      // 添加入 entry 对象
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
