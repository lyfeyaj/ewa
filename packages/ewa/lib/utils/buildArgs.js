"use strict";

module.exports = function buildArgs() {
  var args = [],
      len = arguments.length;

  while (len--) {
    args[len] = arguments[len];
  }

  return args;
};