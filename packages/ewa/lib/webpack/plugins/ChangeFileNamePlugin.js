'use strict';

const path = require('path');
const del = require('del');
const fs = require('fs');
const utils = require('../../utils');
const wxmlToAxml = require('../../baidu/wxml/index');
const wxssToAcss = require('../../baidu/wxss/index');
const jsTobaidu = require('../../baidu/js/index');
// const jsonTobaidu = require('../../baidu/json/index');


// 重命名文件
module.exports = class ChangeFileNamePlugin {
  constructor(options) {
    this.options = Object.assign({
      info: true,
      exclude: [],
      include: ['**']
    }, options || {});
  }

  apply(compiler) {
    const opts = this.options;

    const outputPath = compiler.options.output.path;

    compiler.hooks.done.tapPromise('ChangeFileNamePlugin', stats => {
      // no clean on errors
      if (stats.hasErrors()) {
        utils.log('');
        utils.log('ChangeFileNamePlugin skipped due to errors.');
        return Promise.resolve();
      }

      // collect compiled files
      const assetNames = stats.toJson().assets.map(asset => asset.name);

      // include files, default is all files (**) under working folder
      const includePatterns = opts.include.map(n => path.join(outputPath, n));

      // exclude files
      const excludePatterns = [
        outputPath
      ].concat(
        opts.exclude.map(name => path.join(outputPath, name))
      ).concat(
        assetNames.map(name => path.join(outputPath, name))
      );
      return new Promise((resolve, reject) => {
        excludePatterns.map((item) => {
          if (item.match("wxml")) {
            let oldname = item.split(".")[0]
            let newname= oldname+".swan"
            try {
              fs.readFile(item, 'utf8', (err, data) => {
                let transformData= wxmlToAxml(data.toString())
                fs.writeFile(item, transformData, 'utf8', (err) => {
                  if (err) {
                    console.log('写文件失败');
                  } else {
                    fs.rename(item, oldname + '.swan', function(err) {
                      if (err) {
                        throw err;
                      }
                      console.log('done!');
                      reject("失败")
                    })
                  }
                })
              })
            } catch (err) {
              console.log('读取文件时发生错误');
            }
            //open是ReadStream对象中表示文件打开时事件，
            resolve("重名成功")
          }
          else if (item.match("wxss")) {
            let oldname = item.split(".")[0]
            let newname= oldname+".css"

            try {
              fs.readFile(item, 'utf8', (err, data) => {
                let transformData= wxssToAcss(data.toString())
                fs.writeFile(item, transformData, 'utf8', (err) => {
                  if (err) {
                  } else {
                    fs.rename(item,  newname, function(err) {
                      if (err) {
                        throw err;
                      }
                      reject("失败")
                    })
                  }
                })
              })
            } catch (err) {
              console.log('读取文件时发生错误');
            }
          }
          else if (item.match('.js')) {
            try {
              fs.readFile(item, 'utf8', (err, data) => {
                let transformData= jsTobaidu(data.toString())
                fs.writeFile(item, transformData, 'utf8', (err) => {
                  if (err) {
                    console.log('写文件失败');
                  } else {
                  }
                })
              })
            } catch (err) {
              console.log('读取文件时发生错误');
            }
          }
          else if (item.match('.json')) {
            if (item.match('project.config.json')) {
              utils.log(`配置文件生成`, 'success');
            }
          }
        })

      })


      // run delete
      // return del(includePatterns, {
      //   ignore: excludePatterns,
      //   nodir: true
      // }).then(paths => {
      //   if (opts.info && paths && paths.length) {
      //     utils.log(`Auto cleaned files: (${paths.length})`, 'warning');
      //     paths.map(name => utils.log(`  ${path.relative(outputPath, name)}`, 'warning'));
      //   } else {
      //     utils.log('Nothing to clean.');
      //   }
      // });
    });
  }
};
