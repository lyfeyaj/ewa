'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {
  require('./run.dev');
} else {
  require('./run.prod');
}
