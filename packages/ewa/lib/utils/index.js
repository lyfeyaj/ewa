'use strict';

function escapeRegExpString(str) {
  // eslint-disable-next-line
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function pathToRegExp(p) {
  return new RegExp('^' + escapeRegExpString(p));
}

module.exports = {
  escapeRegExpString,
  pathToRegExp
};
