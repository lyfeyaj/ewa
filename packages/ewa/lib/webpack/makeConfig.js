'use strict';

const webpack = require('webpack');
const path = require('path');

const NodeSourcePlugin = require('webpack/lib/node/NodeSourcePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodeCommonModuleTemplatePlugin = require('./plugins/NodeCommonModuleTemplatePlugin');
const AutoCleanUnusedFilesPlugin = require('./plugins/AutoCleanUnusedFilesPlugin');
const utils = require('../utils');
const helpers = require('./helpers');

// 常量
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';
const ROOT = process.cwd();
const ENTRY_DIR = path.join(ROOT, 'src');
const OUTPUT_DIR = path.join(ROOT, 'dist');
const OUTPUT_GLOBAL_OBJECT = 'wx';

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
  'ico'
];
const DEFAULT_COMMON_MODULE_PATTERN = /[\\/](node_modules|utils|vendor)[\\/].+\.js/;
const DEFAULT_CSS_PARSER = 'sass';

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
 *   webpack: 修改并自定义 webpack 配置，如：function(config) { return config; }
 */
module.exports = function makeConfig(options = {}) {
  options = Object.assign({
    commonModuleName: DEFAULT_COMMON_MODULE_NAME,
    commonModulePattern: DEFAULT_COMMON_MODULE_PATTERN,
    aliasDirs: DEFAULT_ALIAS_DIRS,
    copyFileTypes: DEFAULT_COPY_FILE_TYPES,
    cssParser: DEFAULT_CSS_PARSER
  }, options);

  options.simplifyPath = options.simplifyPath === true;
  options.autoCleanUnusedFiles = options.autoCleanUnusedFiles !== false;
  options.rules = options.rules || [];
  options.plugins = options.plugins || [];

  const aliasDirs = {};
  options.aliasDirs.forEach(d => aliasDirs[d] = path.join(ENTRY_DIR, `${d}/`));

  // 插件
  let plugins = [
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
    new CopyWebpackPlugin([
      {
        from: path.resolve(
          ROOT,
          `src/**/*.{${options.copyFileTypes.join(',')}}`
        ),
        to: OUTPUT_DIR,
        context: path.resolve(ROOT, 'src')
      }
    ])
  ];

  // 生产环境进一步压缩代码
  if (!IS_DEV) {
    plugins.push(
      new webpack.HashedModuleIdsPlugin({
        hashFunction: 'md5',
        hashDigest: 'base64',
        hashDigestLength: 4
      })
    );
  }

  // 开发环境下，自动清理无用的文件
  if (IS_DEV && options.autoCleanUnusedFiles) {
    plugins.push(new AutoCleanUnusedFilesPlugin({
      // 排除拷贝的文件
      exclude: options.copyFileTypes.map(fileType => {
        return `**/*.${fileType}`;
      })
    }));

    // 允许模块命名，方便调试
    plugins.push(
      new webpack.NamedModulesPlugin()
    );
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

  // 不同文件类型的处理
  rules = rules.concat([
    // 解析 js 文件
    {
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          // 让 babel 根据文件判断是 commonjs 或者 esmodule
          sourceType: 'unambiguous',
          presets: [[require('@babel/preset-env'), { targets: { ios: '7' } }]],
          plugins: [
            [
              require('@babel/plugin-transform-runtime'),
              {
                helpers: true,
                corejs: false,
                regenerator: true
              }
            ],
            require('@babel/plugin-proposal-class-properties'),
            [
              require('@babel/plugin-proposal-decorators'),
              { decoratorsBeforeExport: true }
            ],
            require('@babel/plugin-proposal-export-namespace-from'),
            require('@babel/plugin-proposal-function-sent'),
            require('@babel/plugin-proposal-json-strings'),
            require('@babel/plugin-proposal-numeric-separator'),
            require('@babel/plugin-proposal-throw-expressions'),
            require('@babel/plugin-syntax-dynamic-import'),
            require('@babel/plugin-syntax-import-meta'),
            require('@babel/plugin-transform-async-to-generator'),
            require('@babel/plugin-transform-regenerator'),
          ]
        }
      }],
      exclude: /node_modules/
    },

    // 处理图片, 小程序不支持本地的背景图片, 这里采用 base64 编码的 datauri
    {
      test: /\.(jpe?g|png|gif|svg)$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            // 16k
            limit: 8192 * 2
          }
        }
      ]
    },

    // 处理 wxml 文件
    {
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
            removeAttributeQuotes: false
          }
        }
      ])
    },

    // 处理 json 文件
    {
      type: 'javascript/auto',
      test: /\.json$/i,
      use: ExtractTextPlugin.extract(['raw-loader'])
    }
  ]);

  // 解析并抽离 wxss 文件
  let cssPattern;
  let cssRules = [];
  let cssExtensions = ['.css', '.wxss'];
  if (options.cssParser === 'sass') {
    cssPattern = /\.(css|scss|sass|wxss)$/;
    cssRules = [
      { loader: 'resolve-url-loader' },
      { loader: './loaders/fix-import-wxss-loader.js' },
      {
        loader: 'sass-loader',
        options: {
          // resolve-url-loader 需要开启 sourceMap 才能工作
          sourceMap: true
        }
      },
      {
        loader: './loaders/import-wxss-loader.js',
        options: { simplifyPath: options.simplifyPath }
      }
    ];
    cssExtensions = cssExtensions.concat(['.scss', '.sass']);
  } else if (cssPattern === 'less') {
    cssPattern = /\.(css|less|wxss)$/;
    cssRules = [
      { loader: './loaders/fix-import-wxss-loader.js' },
      { loader: 'less-loader', options: { sourceMap: true } },
      {
        loader: './loaders/import-wxss-loader.js',
        options: { simplifyPath: options.simplifyPath }
      }
    ];
    cssExtensions = cssExtensions.concat(['.less']);
  }

  rules.push({
    test: cssPattern,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [{
        loader: 'css-loader',
        options: {
          minimize: !IS_DEV,
          // 不处理 css 的 @import, 充分利用 wxss 本身的 @import
          import: false
        }
      },
      // PostCSS 配置
      {
        loader: 'postcss-loader',
        options: {
          plugins: function() {
            let p = [
              require('autoprefixer')({ remove: false, browsers: ['iOS 7']})
            ];

            if (!IS_DEV) {
              p = p.concat(
                require('cssnano')({
                  preset: [
                    'default',
                    {
                      discardComments: { removeAll: true },
                      // calc 无法计算 rpx，此处禁止
                      calc: false
                    }
                  ]
                })
              );
            }

            return p;
          },
          sourceMap: 'inline'
        }
      }].concat(cssRules)
    })
  });

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

  // 是否是开发环境

  let config = {
    devtool,
    mode,
    context: __dirname,
    entry: helpers.buildDynamicEntries(ENTRY_DIR, options.simplifyPath),
    target: 'node',
    output: {
      path: OUTPUT_DIR,
      filename: '[name]',
      globalObject: OUTPUT_GLOBAL_OBJECT
    },
    optimization,
    module: { rules },
    plugins: plugins,
    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, '../../node_modules')
      ],
      extensions: ['.js', '.html', '.wxml', '.wxs'].concat(cssExtensions),
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
};
