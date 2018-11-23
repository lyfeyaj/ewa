'use strict';

const Template = require('webpack/lib/Template');
const path = require('path');

// Constants
const DEFAULT_COMMON_MODULE_NAME = 'vendors.js';

const GLOBAL_CACHED_VAR = 'g.$x$';

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
        let vendorPath = path.relative(
          path.dirname(chunk.name),
          this.options.commonModuleName
        );

        // remove js ext for saving dist space
        vendorPath = vendorPath.replace(/\.js$/, '');

        return Template.asString([
          source,
          '',
          'var g = global;',
          '',
          '// require common modules',
          '(function loadVendorModules() {',
          Template.indent([
            `var vendors = require('${vendorPath}');`,
            'var extraModules = { __proto__: vendors.modules || {} };',
            'for (var name in modules) {',
            Template.indent([
              'if (!extraModules[name]) extraModules[name] = modules[name];'
            ]),
            '}',
            'modules = extraModules;'
          ]),
          '})();',

          // Add global cachedInstalledModules
          '',
          `${GLOBAL_CACHED_VAR} = ${GLOBAL_CACHED_VAR} || {};`
        ]);
      });

      // Add global cachedInstalledModules
      mainTemplate.hooks.localVars.tap('NodeCommonModuleTemplatePlugin', (source) => {
        return Template.asString([
          source,
          '// replace with global cache',
          `installedModules = ${GLOBAL_CACHED_VAR} || {};`
        ]);
      });
    });
  }
};
