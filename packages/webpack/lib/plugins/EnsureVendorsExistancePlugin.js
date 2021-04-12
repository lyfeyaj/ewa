'use strict';

const path = require('path');
const fs = require('fs');

module.exports = class EnsureVendorsExistancePlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const { commonModuleName } = this.options;

    const outputPath = compiler.options.output.path;

    compiler.hooks.done.tap('EnsureVendorsExistancePlugin', () => {
      const vendorsOutputPath = path.join(outputPath, commonModuleName);

      // 检查 公共文件是否存在，如果存在则跳过，如果不存在，则新建一个
      if (!fs.existsSync(vendorsOutputPath)) {
        fs.writeFileSync(vendorsOutputPath, this.buildCommonModuleTemplate());
      }
    });
  }

  buildCommonModuleTemplate() {
    const { commonModuleName } = this.options;
    return `exports.ids = ["${commonModuleName}"];\nexports.modules = {};`;
  }
};
