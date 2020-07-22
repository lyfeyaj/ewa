'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 处理 json 文件
module.exports = function jsonRule() {
  return {
    type: 'javascript/auto',
    test: /\.json$/i,
    use: ExtractTextPlugin.extract([{
      loader: 'raw-loader',
      options: { esModule: false }
    }])
  };
};