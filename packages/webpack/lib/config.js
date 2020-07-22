'use strict';

const webpack = require('webpack');
const path = require('path');
const { existsSync } = require('fs');

const WebpackBar = require('webpackbar');
const NodeSourcePlugin = require('webpack/lib/node/NodeSourcePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodeCommonModuleTemplatePlugin = require('./plugins/NodeCommonModuleTemplatePlugin');
const AutoCleanUnusedFilesPlugin = require('./plugins/AutoCleanUnusedFilesPlugin');
const utils = require('./utils');

// 常量
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';
const ROOT = process.cwd();
const ENTRY_DIR = path.join(ROOT, 'src');
const OUTPUT_DIR = path.join(ROOT, 'dist');
const OUTPUT_GLOBAL_OBJECT = 'wx';
const USER_CONFIG_FILE = path.join(ROOT, 'ewa.config.js');

// 默认常量
const DEFAULT_COMMON_MODULE_NAME = 'vendors.js';
const DEFAULT_ALIAS_DIRS = [
  'apis',
  'assets',
  'constants',
  'utils'
];
const DEFAULT_COPY_FILE_TYPES = [
  'png',
  'jpeg',
  'jpg',
  'gif',
  'svg',
  'ico',
  'webp',
  'apng'
];
const DEFAULT_COMMON_MODULE_PATTERN = /[\\/](node_modules|utils|vendor)[\\/].+\.js/;
const DEFAULT_CSS_PARSER = 'sass';
const USER_CONFIG = existsSync(USER_CONFIG_FILE) ? require(USER_CONFIG_FILE): {};

/**
 * 生成 webpack 配置
 * options:
 *   commonModuleName: 通用代码名称，默认为 vendors.js
 *   commonModulePattern: 通用模块匹配模式，默认为 /[\\/]node_modules[\\/]/
 *   simplifyPath: 是否简化路径，作用于 page 和 component，如 index/index.wxml=> index.wxml，默认为 false
 *   aliasDirs: 文件夹快捷引用
 *   copyFileTypes: 需要拷贝的文件类型
 *   rules: webpack loader 规则
 *   plugins: webpack plugin
 *   autoCleanUnusedFiles: 开发环境下是否自动清理无用文件，默认为 true
 *   cssParser: sass 或者 less，默认为 sass
 *   hashedModuleIds: 是否开启 hashed module id
 *   cache: 是否开启缓存, 默认为 true
 *   webpack: 修改并自定义 webpack 配置，如：function(config) { return config; }
 */
function makeConfig() {
  let options = Object.assign({
    commonModuleName: DEFAULT_COMMON_MODULE_NAME,
    commonModulePattern: DEFAULT_COMMON_MODULE_PATTERN,
    aliasDirs: DEFAULT_ALIAS_DIRS,
    copyFileTypes: DEFAULT_COPY_FILE_TYPES,
    cssParser: DEFAULT_CSS_PARSER
  }, USER_CONFIG);

  options.simplifyPath = options.simplifyPath === true;
  options.autoCleanUnusedFiles = options.autoCleanUnusedFiles !== false;
  options.cache = options.cache !== false;
  options.rules = options.rules || [];
  options.plugins = options.plugins || [];

  const aliasDirs = {};
  options.aliasDirs.forEach(d => aliasDirs[d] = path.join(ENTRY_DIR, `${d}/`));

  // 插件
  let plugins = [
    new WebpackBar(),
    // Mock node env
    new NodeSourcePlugin({
      console: false,
      global: true,
      process: true,
      __filename: 'mock',
      __dirname: 'mock',
      Buffer: true,
      setImmediate: true
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new ExtractTextPlugin({ filename: '[name]' }),
    new NodeCommonModuleTemplatePlugin({
      commonModuleName: options.commonModuleName
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            ROOT,
            `src/**/*.{${options.copyFileTypes.join(',')}}`
          ),
          to: OUTPUT_DIR,
          context: path.resolve(ROOT, 'src')
        }
      ]
    })
  ];

  // 生产环境进一步压缩代码
  if (!IS_DEV && options.hashedModuleIds !== false) {
    plugins.push(
      new webpack.HashedModuleIdsPlugin(
        !options.hashedModuleIds || options.hashedModuleIds === true ? {
          hashFunction: 'md5',
          hashDigest: 'base64',
          hashDigestLength: 4
        } : options.hashedModuleIds
      )
    );
  } else {
    // 允许模块命名，方便调试
    plugins.push(
      new webpack.NamedModulesPlugin()
    );
  }

  // 开发环境下，自动清理无用的文件
  if (IS_DEV && options.autoCleanUnusedFiles) {
    plugins.push(new AutoCleanUnusedFilesPlugin({
      // 排除拷贝的文件
      exclude: options.copyFileTypes.map(fileType => {
        return `**/*.${fileType}`;
      }).concat([
        // 排除公共库文件 和 对应的 sourceMap 文件
        options.commonModuleName,
        `${options.commonModuleName}.map`
      ])
    }));
  }

  plugins = plugins.concat(options.plugins);

  // Loaders
  let rules = [];

  if (IS_DEV) {
    // 开发环境下增加 eslint 检查
    rules.push(
      {
        enforce: 'pre',
        test: /\.js$/,
        include: utils.pathToRegExp(ENTRY_DIR),
        use: [{
          loader: 'eslint-loader',
          options: {
            cache: true,
            fix: true
          }
        }]
      }
    );
  }

  let ruleOpts = { ...options, IS_DEV, ROOT, OUTPUT_DIR, ENTRY_DIR };
  const { cssRule, cssExtensions } = require('./rules/css')(ruleOpts);

  // 不同文件类型的处理
  rules = rules.concat([
    require('./rules/ts')(ruleOpts),
    require('./rules/js')(ruleOpts),
    require('./rules/image')(ruleOpts),
    require('./rules/wxml')(ruleOpts),
    require('./rules/json')(ruleOpts),
    require('./rules/wxs')(ruleOpts),
    cssRule
  ]);

  // 构建优化
  const optimization = {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: options.commonModulePattern,
          name: options.commonModuleName,
          chunks: 'all'
        }
      }
    }
  };

  // 开发工具
  const devtool = IS_DEV ? 'source-map' : '';

  // 构建模式
  const mode = IS_DEV ? 'development' : 'production';

  const config = {
    stats: {
      // copied from `'minimal'`
      all: false,
      modules: true,
      maxModules: 0,
      errors: true,
      warnings: true,
      // our additional options
      moduleTrace: true,
      errorDetails: true,
      builtAt: true,
      colors: {
        green: '\u001b[32m',
      },
      outputPath: true,
      timings: true,
    },
    devtool,
    mode,
    context: __dirname,
    entry: utils.buildDynamicEntries(ENTRY_DIR, options.simplifyPath),
    target: 'node',
    output: {
      path: OUTPUT_DIR,
      filename: '[name]',
      globalObject: OUTPUT_GLOBAL_OBJECT
    },
    optimization,
    module: { rules },
    plugins,
    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, '../node_modules'),
        path.resolve(__dirname, '../../'),
        path.resolve(__dirname, '../../../node_modules')
      ],
      extensions: ['.ts', '.js', '.html', '.wxml', '.wxs'].concat(cssExtensions),
      alias: Object.assign(aliasDirs, {
        '@': path.resolve(ROOT, 'src/')
      })
    }
  };

  // 允许自定义 webpack 配置
  if (typeof options.webpack === 'function') {
    return options.webpack(config) || config;
  }

  return config;
}

module.exports = makeConfig();

