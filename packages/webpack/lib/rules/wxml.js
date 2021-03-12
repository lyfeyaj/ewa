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
      loader: './loaders/wxml-transform-loader',
      options: { type: options.EWA_ENV, ENTRY_DIR: options.ENTRY_DIR }
    },
    {
      loader: './loaders/fix-unary-element-loader',
      options: { action: 'addPrefix' }
    },
  ];

  // 开启缓存
  if (options.cache) htmlRules = ['cache-loader'].concat(htmlRules);

  return {
    test: /\.wxml$/i,
    use: ExtractTextPlugin.extract(htmlRules)
  };
};