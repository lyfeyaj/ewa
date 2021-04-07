'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 处理 json 文件
module.exports = function jsonRule(options = {}) {
  return {
    type: 'javascript/auto',
    test: /\.json$/i,
    use: ExtractTextPlugin.extract([
      {
        loader: 'raw-loader',
        options: { esModule: false }
      },
      {
        loader: './loaders/json-transform-loader',
        options: { type: options.EWA_ENV, ENTRY_DIR: options.ENTRY_DIR, GLOBAL_COMPONENTS: options.GLOBAL_COMPONENTS }
      }
    ])
  };
};