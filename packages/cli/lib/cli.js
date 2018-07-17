#!/usr/bin/env node

/* eslint "no-console": "off" */

'use strict';

require('yargs')
  .locale('zh_CN')
  .usage('$0 <cmd> [args]')
  .command(['new', 'create'], '创建新的微信小程序项目', (yargs) => {
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
  .command(['start', 'dev'], '启动 EWA 小程序项目实时编译', {}, (argv) => {
    require('./commands/start')(argv);
  })
  .command('build', '编译小程序静态文件', {}, (argv) => {
    require('./commands/build')(argv);
  })
  .command('clean', '清理小程序静态文件', {}, (argv) => {
    require('./commands/clean')(argv);
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
