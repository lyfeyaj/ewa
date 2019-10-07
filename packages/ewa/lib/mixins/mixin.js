"use strict";

var assign = require('lodash.assign');

var buildArgs = require('../utils/buildArgs');

module.exports = function mixin() {
  var mixins = buildArgs.apply(void 0, arguments);
  var mixes = {};
  var kls = mixins.pop();

  for (var i = 0; i < mixins.length; i++) {
    var item = mixins[i];
    mixes = assign({}, mixes, typeof item === 'function' ? item() : item);
  }

  var newKls = assign({
    parent: mixes
  }, mixes, kls);
  return newKls;
};