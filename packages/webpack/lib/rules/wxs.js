'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 处理 wxs 文件
module.exports = function wxsRule() {
  return {
    test: /\.(wxs|sjs)$/i,
    use: ExtractTextPlugin.extract([{
      loader: 'raw-loader',
      options: { esModule: false }
    }])
  };
};