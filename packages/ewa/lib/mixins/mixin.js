'use strict';

const buildArgs = require('./utils/buildArgs');

module.exports = function mixin() {
  let mixins = buildArgs.apply(null, arguments);

  let mixes = {};
  let kls = mixins.pop();

  for (let i = 0; i < mixins.length; i++) {
    let _mixin = mixins[i];
    mixes = Object.assign({}, mixes, typeof _mixin === 'function' ? _mixin() : _mixin);
  }

  let newKls = Object.assign({}, mixes, kls);

  newKls.__proto__ = {
    parent: mixes
  };

  return newKls;
};
