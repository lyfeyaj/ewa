'use strict';

const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

let webpackBin = require.resolve('webpack').replace(
  path.normalize('webpack/lib/webpack.js'),
  path.normalize('webpack/bin/webpack.js')
);

if (NODE_ENV === 'development') {
  require('./run.dev')(webpackBin);
} else {
  require('./run.prod')(webpackBin);
}
