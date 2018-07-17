'use strict';

const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const NodeSourcePlugin = require('webpack/lib/node/NodeSourcePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodeCommonModuleTemplatePlugin = require('./NodeCommonModuleTemplatePlugin');
const utils = require('../utils');

// 常量
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';
const ROOT = process.cwd();
const ENTRY_DIR = path.join(ROOT, 'src');
const OUTPUT_DIR = path.join(ROOT, 'dist');
const OUTPUT_GLOBAL_OBJECT = '(function(){var a=getApp()||wx;a.__g=a.__g||{};return a.__g;})()';

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
const DEFAULT_COMMON_MODULE_PATTERN = /[\\/]node_modules[\\/]/;

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
 *   webpack: 修改并自定义 webpack 配置，如：function(config) { return config; }
 */
module.exports = function makeConfig(options = {}) {
  options = Object.assign({
    commonModuleName: DEFAULT_COMMON_MODULE_NAME,
    commonModulePattern: DEFAULT_COMMON_MODULE_PATTERN,
    aliasDirs: DEFAULT_ALIAS_DIRS,
    copyFileTypes: DEFAULT_COPY_FILE_TYPES
  }, options);

  options.simplifyPath = options.simplifyPath === true;
  options.rules = options.rules || [];
  options.plugins = options.plugins || [];

  const aliasDirs = {};
  options.aliasDirs.forEach(d => aliasDirs[d] = path.join(ENTRY_DIR, `${d}/`));

  // 判断是否为 page 或者 component
  function isPageOrComponent(file) {
    if (!options.simplifyPath) return false;
    return !!(~file.indexOf('components/') || ~file.indexOf('pages/'));
  }

  // 去除 components 和 pages 重复路径, 如 navbar/navbar.js => navbar.js
  function resolvePath(filepath) {
    let relativePath = path.relative(ENTRY_DIR, filepath);
    if (isPageOrComponent(relativePath)) {
      let extname = path.extname(relativePath);
      let name = path.basename(relativePath, extname);
      return relativePath.replace(`${name}/${name}${extname}`, `${name}${extname}`);
    } else {
      return relativePath;
    }
  }

  // 构建 entries
  function buildDynamicEntries() {
    let entries = glob.sync(path.join(ENTRY_DIR, '**/*.{js,wxss,wxml,json}'));
    let result = {};
    entries.map(function(filename) {
      let relativePath = resolvePath(filename);

      result[relativePath] = filename;
    });
    return result;
  }

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
    new webpack.NamedModulesPlugin(),
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
  ].concat(options.plugins);

  // Loaders
  let rules = [];

  if (IS_DEV) {
    // do nothing
    rules.push(
      {
        enforce: 'pre',
        test: /\.js$/,
        include: utils.pathToRegExp(ENTRY_DIR),
        use: [{
          loader: 'eslint-loader',
          options: {
            fix: true
          }
        }]
      }
    );
  }

  rules = rules.concat([
    // 解析 js 文件
    {
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            require('babel-preset-env'),
            require('babel-preset-es2016'),
            require('babel-preset-es2017')
          ],
          plugins: [
            [require('babel-plugin-transform-runtime'), {
              'helpers': false,
              'polyfill': true,
              'regenerator': true,
              'moduleName': 'babel-runtime'
            }]
          ]
        }
      }],
      exclude: /node_modules/
    },

    // 解析并抽离 wxss 文件
    {
      test: /\.(css|scss|sass|wxss)$/,
      use:   ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: { minimize: !IS_DEV }
          },
          // PostCSS 配置
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                let ps = [
                  require('autoprefixer')({
                    remove: false,
                    browsers: ['> 1%']
                  })
                ];

                if (!IS_DEV) {
                  ps = ps.concat(
                    require('cssnano')({
                      preset: [
                        'default',
                        {
                          discardComments: { removeAll: true },
                          calc: false
                        }
                      ]
                    })
                  );
                }
                return ps;
              },
              sourceMap: 'inline'
            }
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              // resolve-url-loader 需要开启 sourceMap 才能工作
              sourceMap: true
            }
          }
        ]
      })
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
      test: /\.wxml$/i,
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
    entry: buildDynamicEntries(),
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
      extensions: ['.js', '.coffee', '.html', '.css', '.scss', '.sass', '.wxml', '.wxss'],
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
