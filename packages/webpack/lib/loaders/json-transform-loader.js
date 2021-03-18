'use strict';

const path = require('path');
const jsonParser = require('../parsers/jsonParser');
const EXCLUDE_URL_MATCHER = /dynamicLib\:\/\//;

module.exports = function jsonTransformLoader(content) {
  let { type, ENTRY_DIR } = this.query || {};

  // 包含需要删除的组件路径 或 在百度平台中，需要对json文件处理
  if (EXCLUDE_URL_MATCHER.test(content) || type === 'swan') {
    let file = '/' + path.relative(ENTRY_DIR, this.resourcePath);
    content = jsonParser(content, file, type);
  }

  return content;
};
