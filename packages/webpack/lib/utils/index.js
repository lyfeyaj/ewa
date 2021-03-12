'use strict';

/* eslint no-console: "off" */

const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

// 常量
const TS_PATTERN = /\.ts$/;
const CSS_PATTERN = /\.(less|sass|scss)$/;

const WXML_LIKE_PATTERN = /\.(swan|wxml|axml|ttml|qml)$/;
const WXSS_LIKE_PATTERN = /\.(wxss|css|acss|ttss|qss)$/;
const WXS_LIKE_PATTERN = /\.(wxs|sjs|qs)$/;

// 基于构建环境替换文件后缀
// NOTE: 仅支持 从 微信小程序 转换为其他小程序，不支持 其他小程序 转换为 微信小程序
// NOTE: 无关逻辑需要清理
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

  // 如果构建目标为 qq小程序
  if (target === 'qq') {
    if (WXML_LIKE_PATTERN.test(file)) return file.replace(WXML_LIKE_PATTERN, '.qml');
    if (WXSS_LIKE_PATTERN.test(file)) return file.replace(WXSS_LIKE_PATTERN, '.qss');
    if (WXS_LIKE_PATTERN.test(file)) return file.replace(WXS_LIKE_PATTERN, '.qs');
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
function buildDynamicEntries(baseDir, simplifyPath = false, target = '') {
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

  // 标记为入口文件夹
  let entryDirs = { [baseDir]: true };

  let entries = {};

  // 遍历所有的微信文件用于生成 entry 对象
  wxFiles.map(function (file) {
    // 标记为微信页面或组件文件夹
    entryDirs[path.dirname(file)] = true;

    let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);

    // 根据构建类型决定文件后缀名
    relativePath = chooseCorrectExtnameByBuildTarget(relativePath, target);

    entries[relativePath] = file;
  });

  // 仅当被标记为微信小程序的页面或者组件文件夹的内容才会被作为 entry
  otherFiles.forEach(function (file) {
    if (entryDirs[path.dirname(file)]) {
      let relativePath = resolveOrSimplifyPath(baseDir, file, simplifyPath);

      let entryName = relativePath;

      // 支持直接使用 ts
      if (TS_PATTERN.test(relativePath)) entryName = relativePath.replace(TS_PATTERN, '.js');

      // 支持直接使用 less 或 scss, 需要对应的 cssParser 设置支持
      if (CSS_PATTERN.test(relativePath)) entryName = relativePath.replace(CSS_PATTERN, '.wxss');

      // 根据构建类型决定文件后缀名
      entryName = chooseCorrectExtnameByBuildTarget(entryName, target);

      // 选择合适的小程序开发工具配置文件
      if (/project\.(config|swan|alipay|tt|qq)\.json$/.test(file)) {
        if (target === 'weapp' && entryName === 'project.config.json') {
          entries[entryName] = file;
        }
        if ((target === 'tt' && entryName === 'project.tt.json') || (target === 'qq' && entryName === 'project.qq.json')) {
          entries['project.config.json'] = file;
        }
        if (target === 'alipay' && entryName === 'project.alipay.json') {
          entries['mini.project.json'] = file;
        }
        if (target === 'swan' && entryName === 'project.swan.json') {
          entries[entryName] = file;
        }
      } else {
        // 如果 已存在，则提示错误
        // js 文件优先级 高于 ts
        // wxss 文件优先级 高于 less 和 sass
        if (entries[entryName]) {
          log(`入口文件 \`${entryName}\` 已存在，忽略文件 \`${relativePath}\``, 'warning');
          return;
        }

        // 添加入 entry 对象
        entries[entryName] = file;
      }
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
