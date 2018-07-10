'use strict';

const fs = require('fs');
const path = require('path');
// const webpack = require('webpack');
const makeConfig = require('./makeConfig');

const USER_CONFIG_FILE = path.join(
  process.cwd(),
  'ewa.config.js'
);

let config = {};

if (fs.existsSync(USER_CONFIG_FILE)) {
  config = require(USER_CONFIG_FILE);
}

// webpack(makeConfig(config), (err, stats) => {
//   if (err || stats.hasErrors()) {
//     // 在这里处理错误
//     console.log(err, stats);
//   }
//   // 处理完成
// });

module.exports = makeConfig(config);
