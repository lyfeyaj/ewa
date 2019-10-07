"use strict";

var wxPromisify = require('./plugins/wxPromisify');

var enableState = require('./plugins/enableState');

var mixin = require('./mixins/mixin');

var ewa = {
  mixin: mixin,
  enableState: enableState
};
wxPromisify(ewa);
module.exports = ewa;