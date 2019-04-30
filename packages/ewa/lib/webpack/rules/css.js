'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 解析并抽离 wxss 文件
module.exports = function cssRule(options = {}) {
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
  } else if (options.cssParser === 'less') {
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

  const cssRule = {
    test: cssPattern,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [{
        loader: 'css-loader',
        options: {
          minimize: !options.IS_DEV,
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

            if (!options.IS_DEV) {
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
  };

  return { cssRule, cssExtensions };
};