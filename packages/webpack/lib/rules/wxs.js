'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 处理 wxs 文件
module.exports = function wxsRule(options) {
  return {
    test: /\.wxs$/i,
    use: ExtractTextPlugin.extract([
      {
        loader: 'raw-loader',
        options: { esModule: false }
      },
      {
        loader: './loaders/wxs-transform-loader',
        options: { type: options.EWA_ENV }
      }
    ])
  };
};