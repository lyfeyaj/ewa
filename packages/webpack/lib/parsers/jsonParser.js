'use strict';

const path = require('path');

// 百度小程序组件不支持相对路径，全部转换为绝对路径
// 解析 usingComponents 并转换为绝对路径
// NOTE: 支付宝不支持全局组件，需要分析全局组件, 并将其添加到各个页面和组件的 json 中
module.exports = function jsonParser(content, file, type) {
  if (type !== 'swan' && type !== 'alipay') return content;

  let json = JSON.parse(content);
  let usingComponents = json.usingComponents || {};
  Object.keys(usingComponents).forEach(function (component) {
    usingComponents[component] = path.resolve(path.dirname(file), usingComponents[component]);
  });

  json.usingComponents = usingComponents;

  return JSON.stringify(json, null, '  ');
};
