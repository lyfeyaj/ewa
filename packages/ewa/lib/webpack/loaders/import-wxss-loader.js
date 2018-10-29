'use strict';

const path = require('path');

function importWxssLoader(content, map, meta) {
  let re = /(@import\s*)([^;]+);/gi;

  let callback = this.async();

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
        let relativePath = path.relative(this.context, result);
        content = content.replace(url, `'${relativePath}'`);
        resolve();
      });
    });
  })).then(() => {
    callback(null, content, map, meta);
  });
}

module.exports = importWxssLoader;
