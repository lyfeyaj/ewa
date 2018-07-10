'use strict';

/* eslint no-console: "off" */

const nodemon = require('nodemon');
const bus = require('nodemon/lib/utils/bus');
const chokidar = require('chokidar');
const path = require('path');

const ROOT = process.cwd();

const FAKE_WATCH_DIR = path.resolve(ROOT, '.ewa');

const webpackBin = path.resolve(__dirname, '../../node_modules/.bin/webpack');
const configFile = path.resolve(__dirname, 'config.js');

const script = nodemon({
  exec: `${webpackBin} --config ${configFile} --watch`,
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
  nodemonLog(file);
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
  nodemonLog(log.colour);
});

function nodemonLog(message){
  console.log('[' + new Date().toString().split(' ')[4] + '] ' + message);
}
