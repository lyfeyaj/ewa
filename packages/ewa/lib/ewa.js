"use strict";

var wxPromisify = require('./plugins/wxPromisify');

var enableState = require('./plugins/enableState');

var mixin = require('./mixins/mixin');

var _require = require('./observer/install'),
    watcherInstall = _require.watcherInstall;

var _require2 = require('./observer/reactive'),
    reactive = _require2.reactive;

var ewa = {
  mixin: mixin,
  enableState: enableState,
  watcherInstall: watcherInstall,
  reactive: reactive
};
wxPromisify(ewa);
module.exports = ewa;