'use strict';

/* eslint no-console: "off" */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const https = require('https');
const semver = require('semver');

// 项目根目录
let ROOT = process.cwd();

// NPM 地址
// NOTE: 后续需要支持根据用户本地设置的 npm registry 自动替换
const NPM_BASE_URL = 'https://registry.npmjs.org/';

// 日志打印类型
const DEBUG_TYPES = {
  error: 'red',
  info: 'blue',
  warning: 'yellow',
  success: 'green'
};

// 小程序开发者工具配置文件映射
const DEV_TOOL_CONFIG_FILES = {
  // 微信小程序
  weapp: 'project.config.json',
  // 百度小程序
  swan : 'project.swan.json',
  // 头条小程序
  tt: 'project.tt.json',
  // 支付宝小程序
  alipay: 'project.alipay.json',
};

// 模版文件地址
const TEMPLATE_DIR = path.resolve(__dirname, '../templates/wechat-app');

// 小程序类型名称映射
const TYPE_NAME_MAPPINGS = {
  weapp: '微信',
  swan: '百度',
  tt: '头条',
  alipay: '支付宝',
};

// 判断是否为 ewa 目录
function isEwaProject() {
  return fs.existsSync(path.resolve(ROOT, '.ewa'));
}

// 根据构架类型选择输出文件夹
function outputDirByType(type) {
  if (!type) throw new Error('无效构建类型');
  if (type === 'weapp') return 'dist';
  return `dist-${type}`;
}

// 确保当前目录为 ewa 项目目录，否则报错
function ensureEwaProject(type = 'weapp') {
  if (isEwaProject()) {
    // 百度小程序的开发工具配置文件名称为 project.swan.json
    // 启动时检查该文件是否存在，如果不存在，则创建一个
    // 考虑模版里面增加支付宝，头条，百度配置
    // 配置文件映射关系为 project.[type].json
    // 如：
    //    微信 project.config.json => project.config.json
    //    百度 project.swan.json  => project.swan.json
    //    头条 project.tt.json => project.config.json
    //    支付宝 project.alipay.json => project.config.json
    let configFileName = DEV_TOOL_CONFIG_FILES[type];
    let configFile = path.resolve(ROOT, `src/${configFileName}`);

    // 如果开发者工具配置文件不存在, 则初始化一个
    if (!fs.existsSync(configFile)) {
      log(
        `${TYPE_NAME_MAPPINGS[type]}小程序开发者工具配置文件不存在：${configFileName}, 已为您创建`,
        'warning'
      );
      fs.copySync(
        path.resolve(TEMPLATE_DIR, `src/${configFileName}`),
        configFile
      );
    }
  } else {
    log('无法执行命令，不是一个有效的 ewa 项目', 'error');
    process.exit(0);
  }
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

  try {
    await Promise.all([
      versionCheck('ewa'),
      versionCheck('ewa-cli')
    ]);

    if (msg.length) {
      msg.unshift('发现新版本:');
      msg.unshift('');
      msg.push('请运行命令 `ewa upgrade` 更新至最新版');
      msg.push('');
      msg.map(m => log(m, 'success'));
    }
  } catch (error) {
    log('检查版本失败', 'warning');
  }
}

module.exports = {
  isEwaProject,
  ensureEwaProject,
  log,
  request,
  checkUpdates,
  outputDirByType
};
