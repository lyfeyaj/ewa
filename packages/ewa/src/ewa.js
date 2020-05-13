
const wxPromisify = require('./plugins/wxPromisify');
const enableState = require('./plugins/enableState');
const mixin = require('./mixins/mixin');
const watcherInstall = require('./observer/install');
const { reactive } = require('./observer/reactive');

const ewa = {
  mixin,
  enableState,
  watcherInstall,
  reactive
};

wxPromisify(ewa);

module.exports = ewa;
