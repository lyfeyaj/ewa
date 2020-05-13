"use strict";

var wxPromisify = require('./plugins/wxPromisify');

var enableState = require('./plugins/enableState');

var mixin = require('./mixins/mixin');

var watcherInstall = require('./observer/install');

var _require = require('./observer/reactive'),
    reactive = _require.reactive;

var ewa = {
  mixin: mixin,
  enableState: enableState,
  watcherInstall: watcherInstall,
  reactive: reactive
};
wxPromisify(ewa);
module.exports = ewa;