'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 处理 wxml 文件
module.exports = function wxmlRule() {
  return {
    test: /\.(wxml|wxs)$/i,
    use: ExtractTextPlugin.extract([
      'raw-loader',
      'extract-loader',
      {
        loader: 'html-loader',
        options: {
          attrs: false,
          minimize: true,
          minifyCSS: false,
          removeComments: true,
          removeAttributeQuotes: false,
          removeEmptyElements: false,
          keepClosingSlash: true
        }
      }
    ])
  };
};