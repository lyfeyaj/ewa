'use strict';

function fixImportWxssLoader(content, map, meta) {
  let re = /(@import\s*)url\(([^;)]+)\)(\s*;)/gi;
  content = content.replace(re, '$1$2$3');
  this.callback(null, content, map, meta);
}

module.exports = fixImportWxssLoader;
