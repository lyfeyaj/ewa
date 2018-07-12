'use strict';

/* eslint no-console: "off" */

const nodemon = require('nodemon');
const chokidar = require('chokidar');
const path = require('path');
const utils = require('../utils');

const ROOT = process.cwd();

const FAKE_WATCH_DIR = path.resolve(ROOT, '.ewa');

const configFile = path.resolve(__dirname, 'config.js');

module.exports = function(webpack) {
  const script = nodemon({
    exec: `${webpack} --config ${configFile} --watch`,
    watch: [FAKE_WATCH_DIR],
    ext: 'js'
  });

  const watcher = chokidar.watch(
    [
      path.resolve(ROOT, 'src/pages/**/*.{js,wxml,wxss,json}'),
      path.resolve(ROOT, 'src/components/**/*.{js,wxml,wxss,json}'),
      path.resolve(ROOT, 'src/templates/**/*.{js,wxml,wxss,json}'),
      path.resolve(ROOT, '.ewa')
    ],
    {
      ignored: /(^|[/\\])\../,
      persistent: true
    }
  );

  function moniter(file) {
    utils.log(`Watching file: ${path.relative(ROOT, file)}`);
    script.emit('restart', [file]);
  }

  // Delay 5 seconds watching target files
  setTimeout(() => {
    watcher
      .on('add', moniter)
      .on('unlink', moniter)
      .on('unlinkDir', moniter);
  }, 5000);

  // Capture ^C
  process.once('SIGINT', function() {
    script.emit('quit', 130);
  });

  script.on('quit', function() {
    process.exit(0);
  });

  // Forward log messages and stdin
  script.on('log', function(log) {
    utils.log(log.colour);
  });
};
