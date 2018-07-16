'use strict';

module.exports = function buildArgs() {
  let args = [], len = arguments.length;
  while (len--) args[len] = arguments[len];
  return args;
};
