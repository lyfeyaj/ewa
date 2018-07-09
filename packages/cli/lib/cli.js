#!/usr/bin/env node

/* eslint no-console: "off" */

'use strict';

require('yargs')
  .command('new [dir]', 'start the server', (yargs) => {
    yargs
      .positional('dir', {
        describe: 'directory to initialize new wechat app program',
        default: '.'
      });
  }, (argv) => {
    require('./commands/create')(argv);
  })
  .command('init', 'init wechat app project', {}, (argv) => {
    require('./commands/init')(argv);
  })
  .command('start', 'start ewa build server', {}, (argv) => {
    require('./commands/start')(argv);
  })
  .command('build', 'build static files', {}, (argv) => {
    require('./commands/build')(argv);
  })
  .help()
  .argv;
