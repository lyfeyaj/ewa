'use strict';

const path = require('path');

// 解析 js 文件
module.exports = function jsRule(options = {}) {
  return {
    test: /\.js$/,
    use: [{
      loader: './loaders/js-transform-loader',
      options: { type: options.EWA_ENV }
    }, {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,

        // 指定 babel 配置文件
        configFile: path.resolve(__dirname, '../utils/babelConfig.js')
      }
    }],
    exclude: /node_modules/,
  };
};