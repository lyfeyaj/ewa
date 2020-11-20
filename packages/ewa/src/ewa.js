const apiPromisify = require('./plugins/apiPromisify');
const enableState = require('./plugins/enableState');
const createStore = require('./plugins/createStore');
const mixin = require('./mixins/mixin');

const ewa = {
  mixin,
  enableState,
  createStore,
};

apiPromisify(ewa);

module.exports = ewa;
