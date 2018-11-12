'use strict';

module.exports = {
  // 公用代码库 (node_modules 打包生成的文件)名称，默认为 vendors.js
  commonModuleName: 'vendors.js',

  // 通用模块匹配模式，默认为 /[\\/](node_modules|utils|vendor)[\\/].+\.js/
  // 如需添加多个文件夹，可自定义正则，如 /[\\/](node_modules|utils|custom_dirname)[\\/].+\.js/
  commonModulePattern: /[\\/](node_modules|utils|vendor)[\\/].+\.js/,

  // 是否简化路径，作用于 page 和 component，如 index/index.wxml=> index.wxml，默认为 false
  simplifyPath: false,

  // 文件夹快捷引用
  aliasDirs: [
    'apis',
    'assets',
    'constants',
    'utils'
  ],

  // 需要拷贝的文件类型
  copyFileTypes: [
    'png',
    'jpeg',
    'jpg',
    'gif',
    'svg',
    'ico'
  ],

  // webpack loader 规则
  rules: [],

  // webpack 插件
  plugins: [],

  // 开发环境下是否自动清理无用文件，默认为 true
  autoCleanUnusedFiles: true,

  // css 解析器，sass 或者 less，默认为 sass
  cssParser: 'sass',

  // 嫌不够灵活？直接修改 webpack 配置
  webpack: function(config) {
    return config;
  }
};
