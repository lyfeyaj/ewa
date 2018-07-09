const webpack = require('webpack');
const Template = require('webpack/lib/Template');
const path = require('path');
const glob = require('glob');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const ENTRY_DIR = path.join(__dirname, 'src');
const OUTPUT_DIR = path.join(__dirname, 'dist');
const VENDOR_NAME = 'vendors.js';

// eslint-disable-next-line
function escapeRegExpString(str) { return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'); }
function pathToRegExp(p) { return new RegExp('^' + escapeRegExpString(p)); }

// 外部引用文件夹
const externalDirs = [
  'apis',
  'constants',
  'utils'
];
// const externalsRegExp = new RegExp(`^(${externalDirs.join('|')})`, 'i');
const externalAlias = {};
externalDirs.map(d => externalAlias[d] = path.resolve(__dirname, `src/${d}/`));

// 判断是否为 page 或者 component
function isPageOrComponent(file) {
  return !file;
  // return file.indexOf('components/') !== -1 || file.indexOf('pages/') !== -1;
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

function buildDynamicEntries() {
  let entries = glob.sync(path.join(ENTRY_DIR, '**/*.{js,wxss,wxml,json,local.*}'));
  let result = {};
  entries.map(function(filename) {
    let relativePath = resolvePath(filename);

    result[relativePath] = filename;
  });
  return result;
}

// 注入外部依赖 vendors
class NodeCommonModuleTemplatePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('NodeCommonModuleTemplatePlugin', compilation => {
      const mainTemplate = compilation.mainTemplate;
      mainTemplate.hooks.bootstrap.tap('NodeCommonModuleTemplatePlugin', function(source, chunk) {
        const vendorPath = path.relative(
          path.dirname(chunk.name),
          VENDOR_NAME
        );
        return Template.asString([
          source,
          '',
          '// require common modules',
          '(function loadVendorModules() {',
          Template.indent([
            `var vendors = require('${vendorPath}');`,
            'var extraModules = vendors.modules || {};',
            'for (var name in extraModules) {',
            Template.indent([
              'modules[name] = extraModules[name];'
            ]),
            '}'
          ]),
          '})();'
        ]);
      });
    });
  }
}

// 添加插件
let plugins = [
  new webpack.NamedModulesPlugin(),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new ExtractTextPlugin({ filename: '[name]' }),
  new NodeCommonModuleTemplatePlugin(),
  new CopyWebpackPlugin([
    {
      from: '**/*.{png,jpeg,jpg,gif,svg,ico}',
      to: OUTPUT_DIR,
      context: 'src'
    }
  ])
];

// Loaders
let loaders = [];

if (NODE_ENV === 'development') {
  // do nothing
  loaders.push(
    {
      enforce: 'pre',
      test: /\.js$/,
      include: pathToRegExp(path.join(__dirname, 'src')),
      use: [{
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      }]
    }
  );
}

const config = {
  devtool: NODE_ENV === 'development' ? 'source-map' : '',
  mode: NODE_ENV === 'development' ? 'development' : 'production',
  context: __dirname,
  entry: buildDynamicEntries(),
  target: 'node',
  output: {
    path: OUTPUT_DIR,
    filename: '[name]',
    globalObject: '(function(){var app = getApp(); app.__global = app.__global || {}; return app.__global;})()'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: VENDOR_NAME,
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: loaders.concat([
      // 解析 js 文件
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              'env',
              'stage-2',
              'es2017'
            ],
            plugins: [
              ['transform-runtime', {
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
        test: /\.(scss|sass|wxss)$/,
        use:   ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { minimize: NODE_ENV !== 'development' }
            },
            // PostCSS 配置
            {
              loader: 'postcss-loader',
              options: {
                plugins: function() {
                  let ps = [
                    require('autoprefixer')({ remove: false, browsers: ['> 1%'] })
                  ];

                  if (NODE_ENV !== 'development') {
                    ps = ps.concat(
                      require('cssnano')({
                        preset: ['default', { discardComments: { removeAll: true } }]
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
    ])
  },
  plugins: plugins,
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.coffee', '.html', '.css', '.scss', '.sass'],
    alias: Object.assign(externalAlias, {
      components: path.resolve(__dirname, 'src/components/'),
      assets: path.resolve(__dirname, 'src/assets/'),
      '@': path.resolve(__dirname, 'src/')
    })
  }
};

module.exports = config;
