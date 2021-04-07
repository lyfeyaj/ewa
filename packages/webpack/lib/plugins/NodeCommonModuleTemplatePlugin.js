'use strict';

const Template = require('webpack/lib/Template');
const path = require('path');

// Constants
const DEFAULT_COMMON_MODULE_NAME = 'vendors.js';

const GLOBAL_CACHED_VAR = 'g.$x$';

const VENDOR_MODULE_NAME = '$EWA_MODULES';

// 判断是否为 js 或 ts 文件
function isJsFile(name) {
  return /\.(js|ts)$/.test(name || '');
}

// Inject common module into entry files
module.exports = class NodeCommonModuleTemplatePlugin {
  constructor(options = {}) {
    this.options = Object.assign({
      commonModuleName: DEFAULT_COMMON_MODULE_NAME
    }, options);
  }

  apply(compiler) {
    const { OUTPUT_GLOBAL_OBJECT } = this.options;

    compiler.hooks.thisCompilation.tap('NodeCommonModuleTemplatePlugin', compilation => {
      const mainTemplate = compilation.mainTemplate;

      // 干预编译的 render 阶段, 在 js 头部插入公共模块引用
      mainTemplate.hooks.render.tap('NodeCommonModuleTemplatePlugin', (source, chunk) => {
        if (!isJsFile(chunk.name)) return source;

        // 计算 vendor 的相对位置
        let vendorPath = path.relative(path.dirname(chunk.name), this.options.commonModuleName);

        // remove js ext for saving dist space
        vendorPath = vendorPath.replace(/\.js$/, '').replace(/\\/g, '/');

        // 转换地址, vendor.js => ./vendor.js
        if (!/^((\.\/)|(\.\.\/))/.test(vendorPath)) vendorPath = `./${vendorPath}`;

        // 插入到 js 文件最前阿敏
        if (source && source.children) source.children.unshift(`var ${VENDOR_MODULE_NAME} = require('${vendorPath}');\n`);

        return source;
      });

      mainTemplate.hooks.bootstrap.tap('NodeCommonModuleTemplatePlugin', (source, chunk) => {
        if (!isJsFile(chunk.name)) return source;

        return Template.asString([
          source,
          '',
          'var freeGlobal = typeof global == "object" && global && global.Object === Object && global;',
          'var freeSelf = typeof self == "object" && self && self.Object === Object && self;',
          `var g = freeGlobal || freeSelf || ${OUTPUT_GLOBAL_OBJECT} || {};`,
          '',
          '// require common modules',
          '(function loadVendorModules() {',
          Template.indent([
            `var extraModules = { __proto__: ${VENDOR_MODULE_NAME}.modules || {} };`,
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
      mainTemplate.hooks.localVars.tap('NodeCommonModuleTemplatePlugin', (source, chunk) => {
        if (!isJsFile(chunk.name)) return source;

        return Template.asString([
          source,
          '// replace with global cache',
          `installedModules = ${GLOBAL_CACHED_VAR} || {};`
        ]);
      });
    });
  }
};
