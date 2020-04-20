'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function tsRule(options) {
  function fsExistsSync(path) {
    try {
      fs.accessSync(path, fs.F_OK);
    } catch(e) {
      return false;
    }
    return path;
  }
  
  let tsconfig;
  
  (() => {
    try {
      tsconfig = fsExistsSync(path.resolve(options.ROOT, './tsconfig.json'));
    } catch(error){
      console.log(error);
    }
  })()
 
  return {
    test: /\.ts$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: tsconfig || path.resolve(__dirname, '../../tsconfig.json')
        }
      }
    ]
  };
};