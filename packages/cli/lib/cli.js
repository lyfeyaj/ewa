#!/usr/bin/env node

'use strict';

require('yargs')
  .usage('$0 <cmd> [args]')
  .command('new [projectName]', '创建新的微信小程序项目', (yargs) => {
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
  .command('start', '启动 EWA 小程序项目实时编译', {}, (argv) => {
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
  .argv;
