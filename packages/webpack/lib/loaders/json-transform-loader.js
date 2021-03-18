'use strict';

const path = require('path');
const jsonParser = require('../parsers/jsonParser');

module.exports = function jsonTransformLoader(content) {
  let { type, ENTRY_DIR } = this.query || {};

  let file = '/' + path.relative(ENTRY_DIR, this.resourcePath);
  content = jsonParser(content, file, type);

  return content;
};
