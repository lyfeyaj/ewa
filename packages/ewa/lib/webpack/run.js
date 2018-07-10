'use strict';

/* eslint no-console: "off" */

const nodemon = require('nodemon');
const bus = require('nodemon/lib/utils/bus');
const chokidar = require('chokidar');
const path = require('path');

const ROOT = process.cwd();

const script = nodemon({
  exec: `npx webpack --config ${path.join(__dirname, 'config.js')} --watch --progress --colors`,
  watch: ['.ewa'],
  ext: 'js'
});

const watcher = chokidar.watch(
  [
    path.join(ROOT, 'src/pages/**/*.{js,wxml,wxss,json}'),
    path.join(ROOT, 'src/components/**/*.{js,wxml,wxss,json}'),
    path.join(ROOT, '.ewa')
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
