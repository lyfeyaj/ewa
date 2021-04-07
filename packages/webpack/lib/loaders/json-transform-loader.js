'use strict';

const path = require('path');
const jsonParser = require('../parsers/jsonParser');
const EXCLUDE_URL_MATCHER = /dynamicLib:\/\//;

module.exports = function jsonTransformLoader(content) {
  let { type, ENTRY_DIR, GLOBAL_COMPONENTS } = this.query || {};

  // 1.包含需要删除的组件路径，需要删除
  // 2.在swan中，替换相对路径为绝对路径
  // 3.在alipay中，将app.json中的全局组件写入各个页面的json文件
  if (EXCLUDE_URL_MATCHER.test(content) || type === 'swan' || type === 'alipay') {
    let file = '/' + path.relative(ENTRY_DIR, this.resourcePath);
    content = jsonParser(content, file, type, GLOBAL_COMPONENTS, ENTRY_DIR);
  }

  return content;
};
