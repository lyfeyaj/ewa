'use strict';

const path = require('path');

// 百度小程序组件不支持相对路径，全部转换为相对路径
// 解析 usingComponents 并转换为绝对路径
module.exports = function jsonParser(content, file, type) {
  if (type === 'weapp') return content;

  let json = JSON.parse(content);
  let usingComponents = json.usingComponents || {};
  Object.keys(usingComponents).forEach(function(component) {
    usingComponents[component] = path.resolve(path.dirname(file), usingComponents[component]);
  });

  json.usingComponents = usingComponents;

  return JSON.stringify(json, null, '  ');
};