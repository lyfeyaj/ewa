'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function tsRule(options) {
  const defaultConfigPath = path.resolve(__dirname, '../../tsconfig.json')
  const userConfigPath = path.resolve(options.ROOT, './tsconfig.json')

  function fetchTsConfigFile(path) {
    try {
      fs.accessSync(path);
    } catch(err) {
      return defaultConfigPath;
    }
    return path;
  }
  
  const configFile = fetchTsConfigFile(userConfigPath);
  
  return {
    test: /\.ts$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          configFile
        }
      }
    ]
  };
};