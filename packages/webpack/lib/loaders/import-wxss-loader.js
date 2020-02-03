'use strict';

const path = require('path');
const os = require('os');
const helpers = require('../utils');

const IS_WINDOWS = os.platform() === 'win32';

function importWxssLoader(content, map, meta) {
  let re = /(@import\s*)([^;]+);/gi;

  let callback = this.async();
  const options = this.query || {};

  let urls = [];
  content = content.replace(re, (str, m1, m2) => {
    if (m2 && /.wxss/.test(m2)) {
      urls.push(m2);
      return  `${m1}url(${m2});`;
    } else {
      return str;
    }
  });

  Promise.all(urls.map((url) => {
    let _url = url.replace(/'|"/gi, '').replace(/^~/, '');

    return new Promise((resolve, reject) => {
      this.resolve(this.context, _url, (err, result) => {
        if (err) return reject(err);
        let context = path.dirname(
          helpers.resolveOrSimplifyPath(
            null,
            this.resourcePath,
            options.simplifyPath
          )
        );
        result = helpers.resolveOrSimplifyPath(
          null,
          result,
          options.simplifyPath
        );
        let relativePath = path.relative(context, result);
        // 增加 windows 支持
        if (IS_WINDOWS) relativePath = relativePath.replace(/\\/g, '/');
        content = content.replace(url, `'${relativePath}'`);
        resolve();
      });
    });
  })).then(() => {
    callback(null, content, map, meta);
  }).catch(err => {
    callback(err);
  });
}

module.exports = importWxssLoader;
