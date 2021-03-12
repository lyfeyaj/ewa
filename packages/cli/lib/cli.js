#!/usr/bin/env node

/* eslint "no-console": "off" */

'use strict';

const BUILD_TARGET_TYPES_CONFIG = {
  alias: 't',
  // describe: '构建目标 `weapp` 或 `swan` 或 `alipay` 或 `tt`',
  describe: '构建目标 `weapp` 或 `swan` 或 `tt` 或 `qq`',
  type: 'string',
  // choices: ['weapp', 'swan', 'alipay', 'tt'],
  choices: ['weapp', 'swan', 'tt', 'qq'],
  default: 'weapp',
  demandOption: false
};

// 命令行配置
require('yargs')
  .locale('zh_CN')
  .usage('$0 <cmd> [args]')
  .command(['new <projectName>', 'create'], '创建新的微信小程序项目', (yargs) => {
    yargs
      .positional('projectName', {
        describe: '项目名称'
      });
  }, (argv) => {
    require('./commands/create')(argv);
  })
  .command('init', '在现有的小程序项目中初始化 EWA', {}, (argv) => {
    require('./commands/init')(argv);
  })
  .command(['start', 'dev'], '启动 EWA 小程序项目实时编译', (yargs) => {
    yargs.option('type', BUILD_TARGET_TYPES_CONFIG);
  }, (argv) => {
    require('./commands/start')(argv.type);
  })
  .command('build', '编译小程序静态文件', (yargs) => {
    yargs.option('type', BUILD_TARGET_TYPES_CONFIG);
  }, (argv) => {
    require('./commands/build')(argv.type);
  })
  .command('clean', '清理小程序静态文件', (yargs) => {
    yargs.option('type', BUILD_TARGET_TYPES_CONFIG);
  }, (argv) => {
    require('./commands/clean')(argv.type);
  })
  .command('upgrade', '升级 EWA 工具', {}, (argv) => {
    require('./commands/upgrade')(argv);
  })
  .command(['generate <type> <name>', 'g'], '快速生成模版', (yargs) => {
    yargs
      .positional('type', {
        describe: '类型 `page` 或 `component` 或 `template`',
        choices: ['page', 'component', 'template'],
        type: 'string'
      }).positional('name', {
        describe: '名称',
        type: 'string'
      }).option('target-dir', {
        alias: 'd',
        describe: '目标文件夹，默认为 src，也可以指定为 src 中的某个子目录',
        type: 'string',
        demandOption: false
      }).option('index', {
        alias: 'i',
        describe: '生成的文件名称为 [name]/index，默认为 [name]/[name]',
        type: 'boolean',
        demandOption: false
      });
  }, (argv) => {
    require('./commands/generate')(
      argv.type,
      argv.name,
      argv.targetDir,
      argv.index
    );
  })
  .options({
    version: {
      alias: 'v',
      describe: '当前版本号'
    }
  })
  .help('help', '获取使用帮助')
  .alias('help', 'h')
  .default('help')
  .demandCommand(1, '请输入命令来启动相应的功能')
  .fail(function (msg, err, yargs) {
    if (err) throw err;

    console.error('出错啦!');
    console.error(msg);
    console.error('\n用法: ', yargs.help());

    process.exit(1);
  })
  .strict(true)
  .argv;