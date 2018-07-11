'use strict';

/* eslint no-console: "off" */

// Modules
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const utils = require('../utils');
const install = require('./install');

// Constants
const ROOT = process.cwd();
const TEMPLATE_DIR = path.resolve(__dirname, '../../template');
const TMP_SRC = path.resolve(ROOT, '__tmp_src__');
const COPY_FILE_OR_DIRS =[
  '.ewa',
  '.eslintrc.js',
  ['gitignore', '.gitignore'],
  'package.json'
];

function isDir(file) {
  return fs.statSync(file).isDirectory();
}

module.exports = function init() {
  utils.log('正在初始化 ewa 项目...');

  // 创建临时源代码文件夹
  utils.log(`创建临时文件夹 ${TMP_SRC}`);
  fs.ensureDirSync(TMP_SRC);

  // 拷贝文件至 src 中
  utils.log('准备移动文件或文件夹...');
  glob.sync(path.resolve(ROOT, '*')).map(source => {
    if (source === TMP_SRC) return;

    let basename = path.basename(source);

    let dest = path.resolve(TMP_SRC, basename);

    utils.log(`正在移动 ${path.relative(ROOT, source)} 至 ${path.relative(ROOT, dest)}`);
    fs.moveSync(source, dest, { overwrite: true });
  });
  utils.log('重命名 __tmp_src__ 为 src');
  fs.moveSync(TMP_SRC, path.resolve(ROOT, 'src'));
  utils.log('文件移动完成', 'success');

  utils.log('正在添加必要的文件...');
  COPY_FILE_OR_DIRS.map(file => {
    let source;
    let dest;

    if (Array.isArray(file)) {
      source = path.resolve(TEMPLATE_DIR, file[0]);
      dest = path.resolve(ROOT, file[1]);
    } else {
      source = path.resolve(TEMPLATE_DIR, file);
      dest = path.resolve(ROOT, file);
    }

    // 如果文件已存在，则不拷贝
    if (fs.existsSync(dest)) return;

    // 创建文件夹
    if (isDir(source)) fs.ensureDirSync(dest);

    fs.copySync(source, dest);
  });
  utils.log('文件添加完成', 'success');

  // 执行安装流程
  install(ROOT, 'npm start');
};
