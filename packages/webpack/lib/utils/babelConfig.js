'use strict';

module.exports = {
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
    [
      require('@babel/plugin-proposal-decorators'),
      { decoratorsBeforeExport: true }
    ],
    require('@babel/plugin-proposal-function-sent'),
    require('@babel/plugin-proposal-throw-expressions'),
    require('@babel/plugin-syntax-import-meta'),
    require('@babel/plugin-proposal-do-expressions'),
    require('@babel/plugin-proposal-export-default-from'),
    [require('@babel/plugin-proposal-pipeline-operator'), { 'proposal': 'minimal' }],
  ]
}