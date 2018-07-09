'use strict';

/* eslint no-console: "off" */

const nodemon = require('nodemon');
const bus = require('nodemon/lib/utils/bus');
const chokidar = require('chokidar');

const script = nodemon({
  exec: 'npm run webpack',
  watch: ['.ewa'],
  ext: 'js'
});

const watcher = chokidar.watch(
  [
    './src/pages/**/*.{js,wxml,wxss,json}',
    './src/components/**/*.{js,wxml,wxss,json}',
    './ewa'
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
