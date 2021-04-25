'use strict';

const webpack = require('webpack');
const path = require('path');
const { existsSync } = require('fs');

const WebpackBar = require('webpackbar');
const NodeSourcePlugin = require('webpack/lib/node/NodeSourcePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const NodeCommonModuleTemplatePlugin = require('./plugins/NodeCommonModuleTemplatePlugin');
const AutoCleanUnusedFilesPlugin = require('./plugins/AutoCleanUnusedFilesPlugin');
const EnsureVendorsExistancePlugin = require('./plugins/EnsureVendorsExistancePlugin');
const utils = require('./utils');

// 常量
const NODE_ENV = process.env.NODE_ENV || 'development';
const EWA_ENV = process.env.EWA_ENV || 'weapp';
const IS_DEV = NODE_ENV === 'development';
const ROOT = process.cwd();
const ENTRY_DIR = path.join(ROOT, 'src');
const OUTPUT_DIR = path.join(ROOT, EWA_ENV === 'weapp' ? 'dist' : `dist-${EWA_ENV}`);
const USER_CONFIG_FILE = path.join(ROOT, 'ewa.config.js');
const APP_JSON_FILE = path.join(ENTRY_DIR, 'app.json');
const OUTPUT_GLOBAL_OBJECT_MAP = {
  weapp: 'wx',
  swan: 'swan',
  tt: 'tt',
  qq: 'qq',
  alipay: 'my',
};
const OUTPUT_GLOBAL_OBJECT = OUTPUT_GLOBAL_OBJECT_MAP[EWA_ENV];
const TYPE_NAME_MAPPINGS = {
  weapp: '微信小程序',
  swan: '百度小程序',
  tt: '字节小程序',
  qq: 'QQ小程序',
  alipay: '支付宝小程序',
};

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
const USER_CONFIG = existsSync(USER_CONFIG_FILE) ? require(USER_CONFIG_FILE) : {};
const APP_JSON_CONFIG = existsSync(APP_JSON_FILE) ? require(APP_JSON_FILE) : {};
const GLOBAL_COMPONENTS = APP_JSON_CONFIG.usingComponents || {};

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

  const copyPluginPatterns = [
    {
      from: path.posix.join(
        // Fix for #46, add glob support for windows
        process.platform === 'win32' ? ROOT.replace(/\\/g, '/') : ROOT,
        `src/**/*.{${options.copyFileTypes.join(',')}}`
      ),
      to: OUTPUT_DIR,
      context: path.resolve(ROOT, 'src'),
      noErrorOnMissing: true
    }
  ];
  // 支付宝单独开了一个开发中初始编译配置的json文件，放在.kaitian文件夹下
  if (EWA_ENV === 'alipay') {
    copyPluginPatterns.push({
      from: path.resolve(
        ROOT,
        'src/.kaitian'
      ),
      to: OUTPUT_DIR + '/.kaitian',
      noErrorOnMissing: true
    });
  }

  // 插件
  let plugins = [
    new webpack.EnvironmentPlugin(['NODE_ENV', 'EWA_ENV']),
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
      commonModuleName: options.commonModuleName,
      OUTPUT_GLOBAL_OBJECT
    }),
    new CopyWebpackPlugin({
      patterns: copyPluginPatterns
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

  // 添加 公共模块文件生成检查
  plugins.push(new EnsureVendorsExistancePlugin({
    commonModuleName: options.commonModuleName
  }));

  // 开发环境下增加 eslint 检查
  if (IS_DEV) {
    const eslintConfigFile = path.resolve(ROOT, '.eslintrc.js');
    const eslintWebpackConfig = {
      context: ENTRY_DIR,
      eslintPath: path.dirname(require.resolve('eslint/package.json')),
      extensions: ['js', 'ts'],
      cache: true,
      fix: true,
      overrideConfig: {
        parser: path.dirname(require.resolve('@babel/eslint-parser/package.json')),
        parserOptions: {
          babelOptions: {
            // 指定 babel 配置文件
            configFile: path.resolve(__dirname, './utils/babelConfig.js')
          }
        }
      }
    };

    // 如果项目根目录 eslint 配置存在，则优先使用
    if (existsSync(eslintConfigFile)) {
      eslintWebpackConfig.overrideConfigFile = eslintConfigFile;
    }

    plugins.push(new ESLintWebpackPlugin(eslintWebpackConfig));
  }

  plugins = plugins.concat(options.plugins);

  // Loaders
  let rules = [];

  let ruleOpts = { ...options, IS_DEV, ROOT, OUTPUT_DIR, ENTRY_DIR, EWA_ENV, GLOBAL_COMPONENTS };
  const { cssRule, cssExtensions } = require('./rules/css')(ruleOpts);

  // 不同文件类型的处理
  rules = rules.concat([
    require('./rules/ts')(ruleOpts),
    require('./rules/js')(ruleOpts),
    require('./rules/image')(ruleOpts),
    require('./rules/wxml')(ruleOpts),
    require('./rules/json')(ruleOpts),
    require('./rules/wxs')(ruleOpts),
    cssRule,

    // 修复 regenerator-runtime 导致使用 Function 的报错问题
    {
      test: /regenerator-runtime/,
      use: [{
        loader: './loaders/fix-regenerator-loader',
        options: { type: options.EWA_ENV }
      }]
    }
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
  const devtool = IS_DEV ? 'source-map' : false;

  // 构建模式
  const mode = IS_DEV ? 'development' : 'production';

  // 打印构建信息
  utils.log(`构建类型: ${TYPE_NAME_MAPPINGS[EWA_ENV]}`);
  utils.log(`构建目录: ${OUTPUT_DIR}`);

  // Webpack 配置
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
    entry: utils.buildDynamicEntries(ENTRY_DIR, options.simplifyPath, EWA_ENV),
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
    },

    // 优化 loader 解析目录，方便用户自定义 webpack 配置
    resolveLoader: {
      modules: [
        'node_modules',
        path.resolve(ROOT, './node_modules')
      ]
    }
  };

  // 允许自定义 webpack 配置
  if (typeof options.webpack === 'function') {
    return options.webpack(config) || config;
  }

  return config;
}

module.exports = makeConfig();

