'use strict';

const path = require('path');
const fs = require('fs');
const ROOT = process.cwd();

function isFileExisted(url) {
  return new Promise(function(resolve, reject) {
    fs.access(url, (err) => {
        if (err) {
            reject(err.message);
        } else {
            resolve('existed');
        }
    })
  })
}

let tsconfig;

(async() => {
  try {
    tsconfig = await isFileExisted(path.resolve(ROOT, './tsconfig.json'));
  } catch(error){
    console.log(error);
  }
})()

module.exports = function tsRule() {
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