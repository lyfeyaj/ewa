
const assign = require('lodash.assign');
const buildArgs = require('../utils/buildArgs');

module.exports = function mixin(...args) {
  let mixins = buildArgs(...args);

  let mixes = {};
  let kls = mixins.pop();

  for (let i = 0; i < mixins.length; i++) {
    let item = mixins[i];
    mixes = assign({}, mixes, typeof item === 'function' ? item() : item);
  }

  let newKls = assign({ parent: mixes }, mixes, kls);

  return newKls;
};
