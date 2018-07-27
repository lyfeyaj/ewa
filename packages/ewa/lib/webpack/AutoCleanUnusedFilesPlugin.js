'use strict';

const path = require('path');
const del = require('del');
const utils = require('../utils');

// 自动清理无用的文件
module.exports = class AutoCleanUnusedFilesPlugin {
  constructor(options) {
    this.options = Object.assign({
      info: true,
      exclude: [],
      include: ['**']
    }, options || {});
  }

  apply(compiler) {
    const opts = this.options;

    const outputPath = compiler.options.output.path;

    compiler.hooks.done.tapPromise('AutoCleanUnusedFilesPlugin', stats => {
      // no clean on errors
      if (stats.hasErrors()) {
        utils.log('');
        utils.log('AutoCleanUnusedFilesPlugin skipped due to errors.');
        return Promise.resolve();
      }

      // collect compiled files
      const assetNames = stats.toJson().assets.map(asset => asset.name);

      // include files, default is all files (**) under working folder
      const includePatterns = opts.include.map(n => path.join(outputPath, n));

      // exclude files
      const excludePatterns = [
        outputPath
      ].concat(
        opts.exclude.map(name => path.join(outputPath, name))
      ).concat(
        assetNames.map(name => path.join(outputPath, name))
      );

      // run delete
      return del(includePatterns, {
        ignore: excludePatterns,
        nodir: true
      }).then(paths => {
        if (opts.info && paths && paths.length) {
          utils.log(`Auto cleaned files: (${paths.length})`, 'warning');
          paths.map(name => utils.log(`  ${path.relative(outputPath, name)}`, 'warning'));
        } else {
          utils.log('Nothing to clean.');
        }
      });
    });
  }
};
