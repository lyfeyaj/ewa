'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 处理 wxml 文件
module.exports = function wxmlRule(options = {}) {
  let htmlOptions = {
    attributes: false,
    minimize: false,
    esModule: false
  };

  // 非开发环境开启压缩
  if (!options.IS_DEV) {
    htmlOptions.minimize = {
      collapseWhitespace: true,
      conservativeCollapse: true,
      caseSensitive: true,
      minifyCSS: false,
      removeComments: true,
      keepClosingSlash: true,
      removeAttributeQuotes: false,
      removeEmptyElements: false,
      ignoreCustomFragments: [
        /<%[\s\S]*?%>/,
        /<\?[\s\S]*?\?>/,

        // 忽略 wxs、qs 和 sjs 标签的处理
        /<wxs[\s\S]*?<\/wxs>/,
        /<sjs[\s\S]*?<\/sjs>/,
        /<qs[\s\S]*?<\/qs>/,

        // 忽略 {{ }} 中间内容的处理
        /{{[\s\S]*?}}/,
      ],
    };
  }

  let htmlRules = [
    {
      loader: 'raw-loader',
      options: { esModule: false }
    },
    'extract-loader',
    {
      loader: './loaders/fix-unary-element-loader',
      options: { action: 'removePrefix' }
    },
    {
      loader: 'html-loader',
      options: htmlOptions
    },
    {
      loader: './loaders/fix-unary-element-loader',
      options: { action: 'addPrefix' }
    },
    {
      loader: './loaders/wxml-transform-loader',
      options: { type: options.EWA_ENV, ENTRY_DIR: options.ENTRY_DIR }
    },
  ];

  // 开启缓存
  if (options.cache) htmlRules = ['cache-loader'].concat(htmlRules);

  return {
    test: /\.wxml$/i,
    use: ExtractTextPlugin.extract(htmlRules)
  };
};