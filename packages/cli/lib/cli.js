#!/usr/bin/env node

'use strict';

require('yargs') // eslint-disable-line
  .command('new [dir]', 'start the server', (yargs) => {
    yargs
      .positional('dir', {
        describe: 'directory to initialize new wechat app program',
        default: '.'
      });
  }, (argv) => {
    if (argv.verbose) console.info(`start server on: ${argv.port}`);
  })
  .option('verbose', {
    alias: 'v',
    default: false
  })
  .help()
  .argv;
