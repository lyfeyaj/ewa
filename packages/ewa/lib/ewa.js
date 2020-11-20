"use strict";

var apiPromisify = require('./plugins/apiPromisify');

var enableState = require('./plugins/enableState');

var createStore = require('./plugins/createStore');

var mixin = require('./mixins/mixin');

var ewa = {
  mixin: mixin,
  enableState: enableState,
  createStore: createStore
};
apiPromisify(ewa);
module.exports = ewa;