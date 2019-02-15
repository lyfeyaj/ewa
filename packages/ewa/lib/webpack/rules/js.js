'use strict';

// 解析 js 文件
module.exports = function jsRule() {
  return {
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
  };
};