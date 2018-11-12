'use strict';

/* eslint no-console: "off" */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const https = require('https');
const semver = require('semver');

let ROOT = process.cwd();
const NPM_BASE_URL = 'https://registry.npmjs.org/';
const DEBUG_TYPES = {
  error: 'red',
  info: 'blue',
  warning: 'yellow',
  success: 'green'
};

// 判断是否为 ewa 目录
function isEwaProject() {
  let ewaDir = path.resolve(ROOT, '.ewa');

  return fs.existsSync(ewaDir);
}

// 检查是否为 ewa 目录
function ensureEwaProject() {
  if (isEwaProject()) return;
  log('无法执行命令，不是一个有效的 ewa 项目', 'error');
  process.exit(0);
}

// Log
function log(msg, type = 'info') {
  let color = DEBUG_TYPES[type] || 'blue';
  console.log(
    `[${new Date().toString().split(' ')[4]}]`,
    chalk[color]('[ewa] ' + msg)
  );
}

// 基础 https 请求
function request(url) {
  return new Promise(function(resolve ,reject) {
    https.get(url, res => {
      let buffers = [];

      res.on('data', function(buffer) {
        buffers.push(buffer);
      });

      res.on('end', function() {
        resolve(JSON.parse(Buffer.concat(buffers).toString('utf8')));
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

async function checkUpdates() {
  const packageFile = path.resolve(ROOT, 'package.json');
  if (!fs.existsSync(packageFile)) return;

  const packageInfo = fs.readJsonSync(packageFile);

  let msg = [];

  async function versionCheck(name) {
    let version = (packageInfo.dependencies || {})[name];
    version = version || (packageInfo.devDependencies || {})[name];

    version = version ? version.replace(/[<>^=~ ]/ig, '') : null;

    let latest = await request(NPM_BASE_URL + `${name}/latest`);
    if (version != null && latest && semver.gt(latest.version, version)) {
      msg.push(`${name}@${latest.version}, 当前版本为 ${version}`);
    }
  }

  await versionCheck('ewa');
  await versionCheck('ewa-cli');

  if (msg.length) {
    msg.unshift('发现新版本:');
    msg.unshift('');
    msg.push('请运行命令 `ewa upgrade` 更新至最新版');
    msg.push('');
    msg.map(m => log(m, 'warning'));
  }
}

module.exports = {
  isEwaProject,
  ensureEwaProject,
  log,
  request,
  checkUpdates
};
