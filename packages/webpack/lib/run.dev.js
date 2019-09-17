'use strict';

/* eslint no-console: "off" */

const nodemon = require('nodemon');
const chokidar = require('chokidar');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const utils = require('./utils');

const ROOT = process.cwd();

const FAKE_WATCH_DIR = path.resolve(ROOT, '.ewa') + '/';

const CONFIG_FILE = path.resolve(__dirname, 'config.js');

// 需要监听的文件夹
const WATCH_PATTERNS = [
  'pages',
  'components',
  'templates',
  'packages'
].map(dir => {
  return path.resolve(ROOT, `src/${dir}/**/*.{js,wxml,wxss,json}`);
});

module.exports = function(webpack) {
  // nodemon 实例
  const script = nodemon({
    exec: `${webpack} --config ${CONFIG_FILE} --watch`,
    watch: [FAKE_WATCH_DIR],
    ext: 'js'
  });

  // 添加文件夹监听
  const watcher = chokidar.watch(
    WATCH_PATTERNS.concat(FAKE_WATCH_DIR),
    {
      ignored: /(^|[/\\])\../,
      persistent: true
    }
  );

  // 额外添加文件夹监听
  // 遍历所有pattern，搜集所有的文件夹
  let watchedDirs = [];
  WATCH_PATTERNS.map(pattern => {
    glob.sync(pattern).map(file => {
      let dir = fs.statSync(file).isDirectory() ? file : path.dirname(file);
      if (watchedDirs.indexOf(dir) === -1) {
        watchedDirs.push(dir);
        watcher.add(dir);
      }
    });
  });

  function restart(file) {
    script.emit('restart', [file]);
  }

  // 监听文件夹
  function addDir(file) {
    // 监听文件夹
    if (fs.statSync(file).isFile()) {
      let dir = path.dirname(file);
      if (watchedDirs.indexOf(dir) === -1) {
        utils.log(`Watching directory: ${path.relative(ROOT, dir)}`);
        watchedDirs.push(dir);
        watcher.add(dir);
      }
    }
  }

  // 去除监听文件夹
  function unlinkDir(dir) {
    utils.log(`Watching directory deleted: ${path.relative(ROOT, dir)}`);

    let index = watchedDirs.indexOf(dir);
    if (index !== -1) {
      watchedDirs.splice(index, 1);
    }

    restart();
  }

  // Delay 5 seconds watching target files
  setTimeout(() => {
    watcher
      .on('add', file => {
        utils.log(`Watching file: ${path.relative(ROOT, file)}`);
        restart();
      })
      .on('add', addDir)
      .on('unlink', file => {
        utils.log(`Watching file deleted: ${path.relative(ROOT, file)}`);
        restart();
      })
      .on('unlinkDir', unlinkDir);
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
