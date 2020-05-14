
const wxPromisify = require('./plugins/wxPromisify');
const enableState = require('./plugins/enableState');
const createStore = require('./plugins/reactiveStore');
const mixin = require('./mixins/mixin');

const ewa = {
  mixin,
  enableState,
  createStore
};

wxPromisify(ewa);

module.exports = ewa;
