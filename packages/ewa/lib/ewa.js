"use strict";

var wxPromisify = require('./plugins/wxPromisify');

var enableState = require('./plugins/enableState');

var createStore = require('./plugins/createStore');

var mixin = require('./mixins/mixin');

var ewa = {
  mixin: mixin,
  enableState: enableState,
  createStore: createStore
};
wxPromisify(ewa);
module.exports = ewa;