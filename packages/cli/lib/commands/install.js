'use strict';

/* eslint no-console: "off" */

const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const utils = require('../utils');

module.exports = function install(projectDir, successTip) {
  const projectName = path.basename(projectDir);

  // 重命名 gitignore => .gitignore
  // https://github.com/npm/npm/issues/3763
  // 仅当 有 gitignore 但 没有 .gitignore 的时候
  let gitignoreFile = path.resolve(projectDir, 'gitignore');
  let dotGitignoreFile = path.resolve(projectDir, '.gitignore');
  if (fs.existsSync(gitignoreFile) && !fs.existsSync(dotGitignoreFile)) {
    fs.moveSync(gitignoreFile, dotGitignoreFile);
  }

  successTip = successTip || `cd ${projectName} && npm start`;

  // 修改项目名称
  const targetPackageFile = path.resolve(projectDir, 'package.json');
  const packageInfo = fs.readJsonSync(targetPackageFile);
  packageInfo.name = packageInfo.description = projectName;
  fs.writeJsonSync(targetPackageFile, packageInfo);

  utils.log(`项目: ${projectName} 创建成功`, 'success');
  utils.log('正在安装依赖...');

  let loadingTip;
  let tip = setTimeout(function() {
    utils.log('努力安装中, 请耐心等待...');

    loadingTip = setInterval(function() {
      utils.log('.........................');
    }, 10000);
  }, 10000);

  exec(
    'npm i',
    { cwd: projectDir },
    function(err) {
      if (err) return utils.log(err, 'error');

      if (tip) clearTimeout(tip);
      if (loadingTip) clearInterval(loadingTip);

      utils.log('安装完成 ^_^ !', 'success');
      utils.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~', 'success');
      utils.log('欢迎使用 ewa 工具, 运行命令:  ', 'success');
      console.log('');
      console.log(`            ${successTip}`);
      console.log('');
      utils.log('即可启动项目 ~ Enjoy!', 'success');
      utils.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~', 'success');
    }
  );
};
