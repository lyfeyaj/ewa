'use strict';

/* eslint no-console: "off" */

// Modules
const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const utils = require('../utils');

// Constants
const ROOT = process.cwd();
const TEMPLATE_DIR = path.resolve(__dirname, '../../template');

module.exports = function create(argv) {
  const projectName = argv.projectName;
  const projectDir = path.resolve(ROOT, projectName);

  utils.log(`初始化EWA项目: ${projectName}`);

  fs.copySync(TEMPLATE_DIR, projectDir, {
    filter: function(src) {
      if (/dist|node_modules\//i.test(src)) return false;
      return true;
    }
  });

  utils.log(`项目: ${projectName} 创建成功`, 'success');
  utils.log('正在安装依赖...');

  let tip = setInterval(function() {
    utils.log('努力安装中，请耐心等待...');
  }, 10000);

  exec(`cd ${projectDir} && npm i`, function(err) {
    if (err) return utils.log(err, 'error');

    if (tip) clearInterval(tip);

    utils.log('安装完成 ^_^ ！', 'success');
    utils.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~', 'success');
    utils.log('欢迎使用 EWA 工具，运行命令:  ', 'success');
    console.log('');
    console.log(`            cd ${projectName} && npm start`);
    console.log('');
    utils.log('即可启动项目。 Enjoy!', 'success');
    utils.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~', 'success');
  });
};
