'use strict';

/* eslint no-console: "off" */

const chalk = require('chalk');

function escapeRegExpString(str) {
  // eslint-disable-next-line
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function pathToRegExp(p) {
  return new RegExp('^' + escapeRegExpString(p));
}

const DEBUG_TYPES = {
  error: 'red',
  info: 'blue',
  warning: 'yellow',
  success: 'green'
};

function log(msg, type = 'info') {
  let color = DEBUG_TYPES[type] || 'blue';
  console.log(
    `[${new Date().toString().split(' ')[4]}]`,
    chalk[color]('[ewa] ' + msg)
  );
}

module.exports = {
  escapeRegExpString,
  pathToRegExp,
  log
};
