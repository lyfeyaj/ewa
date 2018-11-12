'use strict';

const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils');

const SUPPORT_TYPES = ['page', 'component', 'template'];
const ROOT = process.cwd();
const BASE_GENERATOR_DIR = path.resolve(__dirname, '../../templates/generators');

module.exports = function generate(type, name, dest) {
  utils.ensureEwaProject();

  if (SUPPORT_TYPES.indexOf(type) === -1) {
    utils.log(
      `无法生成此类型: \`${type}\` 的文件, 允许的值为 ${SUPPORT_TYPES.join(', ')}`,
      'error'
    );
    process.exit(0);
  }

  name = (name || '').trim();

  if (!name) {
    utils.log(`缺少名称, 无法生成 ${type}`, 'error');
    process.exit(0);
  }

  const baseDir = path.resolve(ROOT, 'src');

  dest = (dest || '').trim() || `${type}s`;
  dest = path.resolve(baseDir, dest);
  let fileDir = path.resolve(dest, name);

  // 生成文件夹
  fs.ensureDirSync(fileDir);

  let fileMappings = {
    [`${type}/${type}.wxml`]: `${name}/${name}.wxml`,
    [`${type}/${type}.wxss`]: `${name}/${name}.wxss`
  };

  if (type === 'component' || type === 'page') {
    fileMappings = Object.assign(fileMappings, {
      [`${type}/${type}.js`]: `${name}/${name}.js`,
      [`${type}/${type}.json`]: `${name}/${name}.json`
    });
  }

  for (let source in fileMappings) {
    let target =  path.resolve(dest, fileMappings[source]);

    if (fs.existsSync(target)) {
      utils.log(` 跳过, 文件 ${target} 已存在`, 'warning');
    } else {
      fs.copySync(
        path.resolve(BASE_GENERATOR_DIR, source),
        target
      );
      utils.log(`已生成文件: ${target}`);
    }
  }
};
