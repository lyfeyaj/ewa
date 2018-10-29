'use strict';

const Template = require('webpack/lib/Template');
const path = require('path');

// Constants
const DEFAULT_COMMON_MODULE_NAME = 'vendors.js';

// Inject common module into entry files
module.exports = class NodeCommonModuleTemplatePlugin {
  constructor(options = {}) {
    this.options = Object.assign({
      commonModuleName: DEFAULT_COMMON_MODULE_NAME
    }, options);
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('NodeCommonModuleTemplatePlugin', compilation => {
      const mainTemplate = compilation.mainTemplate;
      mainTemplate.hooks.bootstrap.tap('NodeCommonModuleTemplatePlugin', (source, chunk) => {
        const vendorPath = path.relative(
          path.dirname(chunk.name),
          this.options.commonModuleName
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
};
