'use strict';

/* eslint no-console: "off" */

// Modules
const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils');
const install = require('./install');

// Constants
const ROOT = process.cwd();
const TEMPLATE_DIR = path.resolve(__dirname, '../../template');

module.exports = function create(argv) {
  const projectName = argv.projectName || '';
  const projectDir = path.resolve(ROOT, projectName);

  if (!projectName) return utils.log('请输入项目名称', 'error');

  if (fs.existsSync(projectDir)) {
    return utils.log('文件或文件夹已存在, 请尝试更换项目名称', 'error');
  }

  utils.log(`初始化 ewa 项目: ${projectName}`);

  // 拷贝项目文件
  fs.copySync(TEMPLATE_DIR, projectDir, {
    filter: function(src) {
      if (/(dist|node_modules)(\/|\\)/i.test(src)) return false;
      return true;
    }
  });

  // 执行安装流程
  install(projectDir);
};
