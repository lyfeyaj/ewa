
const wxPromisify = require('./plugins/wxPromisify');
const enableState = require('./plugins/enableState');
const mixin = require('./mixins/mixin');

const ewa = {
  mixin,
  enableState,
};

wxPromisify(ewa);

module.exports = ewa;
