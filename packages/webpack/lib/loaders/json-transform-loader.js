'use strict';

// let A = 1;
const path = require('path');
const jsonParser = require('../parsers/jsonParser');

module.exports = function jsonTransformLoader(content) {
  let { type, ENTRY_DIR } = this.query || {};

  if (type !== 'weapp') {
    let file = '/' + path.relative(ENTRY_DIR, this.resourcePath);
    content = jsonParser(content, file, type);
  }

  return content;
};