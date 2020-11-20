'use strict';

const wxssParser = require('../parsers/wxssParser');

function fixImportWxssLoader(content, map, meta) {
  let re = /(@import\s*)url\(([^;)]+)\)(\s*;)/gi;
  content = content.replace(re, '$1$2$3');

  const { type } = this.query || {};

  // 多端支持
  if (type !== 'weapp') content = wxssParser(content, type);

  this.callback(null, content, map, meta);
}

module.exports = fixImportWxssLoader;
