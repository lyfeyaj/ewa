'use strict';

const path = require('path');
const wxmlParser = require('../parsers/wxmlParser');

module.exports = function wxssTransformLoader(content) {
  let { type, ENTRY_DIR } = this.query || {};

  let file = path.relative(ENTRY_DIR, this.resourcePath);

  // 多端支持
  if (type !== 'weapp') return wxmlParser(content, file, type);

  // 如果是 微信小程序，不做转换
  return content;

};
