'use strict';

/* eslint no-console: "off" */

const nodemon = require('nodemon');
const bus = require('nodemon/lib/utils/bus');
const chokidar = require('chokidar');
const path = require('path');
const utils = require('../utils');

const ROOT = process.cwd();

const FAKE_WATCH_DIR = path.resolve(ROOT, '.ewa');

const configFile = path.resolve(__dirname, 'config.js');

const script = nodemon({
  exec: `npx webpack --config ${configFile} --watch`,
  watch: [FAKE_WATCH_DIR],
  ext: 'js'
});

const watcher = chokidar.watch(
  [
    path.resolve(ROOT, 'src/pages/**/*.{js,wxml,wxss,json}'),
    path.resolve(ROOT, 'src/components/**/*.{js,wxml,wxss,json}'),
    path.resolve(ROOT, '.ewa')
  ],
  {
    ignored: /(^|[/\\])\../,
    persistent: true
  }
);

function moniter(file) {
  utils.log(`Watching file: ${path.relative(ROOT, file)}`);
  bus.emit('restart', [file]);
}

watcher
  .on('add', moniter)
  .on('unlink', moniter)
  .on('unlinkDir', moniter);

// Capture ^C
process.once('SIGINT', function () {
  script.quitEmitted = true;
  script.emit('exit');
});

script.on('exit', function () {
  // Ignore exit event during restart
  if (script.quitEmitted) process.exit(0);
});

// Forward log messages and stdin
script.on('log', function (log){
  utils.log(log.colour);
});
