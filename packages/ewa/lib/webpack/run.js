'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = process.cwd();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PLATFORM = process.env.platform || 'wechat'

let webpackBin = require.resolve('webpack').replace(
  path.normalize('webpack/lib/webpack.js'),
  path.normalize('.bin/webpack')
);
console.log('webapck信息',webpackBin);
if (NODE_ENV === 'development') {
  require('./run.dev')(webpackBin);
  console.log(path.resolve(ROOT, 'dist'),"文件夹");

  fileDisplay(path.resolve(ROOT, 'src'));
  // fs.rename('c:\\a', 'c:\\a2', function(err) {
  //   if (err)
  //     console.log('error:' + err);
  // });
} else {
  require('./run.prod')(webpackBin);
}


//文件遍历方法
function fileDisplay(filePath) {
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function(err, files) {
    if (err) {
      console.warn(err)
    } else {
      //遍历读取到的文件列表
      files.forEach(function(filename) {
        //获取当前文件的绝对路径
        var filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir, function(eror, stats) {
          if (eror) {
            console.warn('获取文件stats失败');
          } else {
            var isFile = stats.isFile(); //是文件
            var isDir = stats.isDirectory(); //是文件夹
            if (isFile) {
              console.log(filedir);
              // 读取文件内容
              var content = fs.readFileSync(filedir, 'utf-8');
              // console.log(content);
            }
            if (isDir) {
              fileDisplay(filedir); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        })
      });
    }
  });
}
