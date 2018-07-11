'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';

let webpackBin = require.resolve('webpack').replace(
  'webpack/lib/webpack.js',
  '.bin/webpack'
);

if (NODE_ENV === 'development') {
  require('./run.dev')(webpackBin);
} else {
  require('./run.prod')(webpackBin);
}
