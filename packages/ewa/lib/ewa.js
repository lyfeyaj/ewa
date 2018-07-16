'use strict';

const wxPromisify = require('./wxPromisify');
const mixin = require('./mixins/mixin');

const ewa = {
  mixin
};

wxPromisify(ewa);

module.exports = ewa;
