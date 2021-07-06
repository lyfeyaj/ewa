'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';

let webpackBin = require.resolve('webpack-cli');

// Support windows and *nix like os
webpackBin = `node "${webpackBin}"`;

if (NODE_ENV === 'development') {
  require('./run.dev')(webpackBin);
} else {
  require('./run.prod')(webpackBin);
}
