'use strict';

const jsParser = require('../parsers/jsParser');

module.exports = function jsTransformLoader(content = '') {
  const { type } = this.query || {};

  // 多端支持
  if (type !== 'weapp') content = jsParser(content, type);

  return content;
};
