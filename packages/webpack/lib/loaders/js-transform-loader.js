'use strict';

const jsParser = require('../parsers/jsParser');

module.exports = function jsTransformLoader(content = '') {
  const { type } = this.query || {};

  if (type === 'alipay' && /src\/app\.js$/.test(this.resourcePath)) {
    content = `
      var alipayComponent = require('ewa/lib/polyfills/alipayComponent');
      var alipaySelectorQuery = require('ewa/lib/polyfills/alipaySelectorQuery');
      var alipayStorage = require('ewa/lib/polyfills/alipayStorage');
      alipayComponent();
      alipaySelectorQuery();
      alipayStorage();
      ${content}`
  }

  // 多端支持
  if (type !== 'weapp') content = jsParser(content, type);

  return content;
};
