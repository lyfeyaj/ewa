'use strict';

const path = require('path');
const alipayJsonParser = require('./alipayJsonParser')

// 组件引用路径中，匹配到以下字符串，百度中不需要替换为绝对路径，其他平台直接删除此引用
const EXCLUDE_URL_MATCHER = /dynamicLib\:\/\//;

// 百度小程序组件不支持相对路径，全部转换为绝对路径
// 解析 usingComponents 并转换为绝对路径
module.exports = function jsonParser(content, file, type, GLOBAL_COMPONENTS, ENTRY_DIR) {

  if (!EXCLUDE_URL_MATCHER.test(content) && type !== 'swan' && type !== 'alipay') return content;

  let json = JSON.parse(content);
  let usingComponents = json.usingComponents || {};
  Object.keys(usingComponents).forEach(function (component) {
    if (requireDelete(usingComponents[component], type)) {
      // 检测是否需要删除
      delete usingComponents[component]
    } else if (requireReplace(usingComponents[component], type)) {
      // 检测是否需要替换为绝对路径
      usingComponents[component] = path.resolve(path.dirname(file), usingComponents[component]);
    }
  });

  json.usingComponents = usingComponents;

  if (type === 'alipay') {
    // 将app.json中的全局组件 写入每个的page.json
    Object.keys(GLOBAL_COMPONENTS || {}).forEach(name => {
      json.usingComponents[name] = '/' + path.relative(ENTRY_DIR, path.resolve(ENTRY_DIR, GLOBAL_COMPONENTS[name]))
    })
    // 处理支付宝平台json文件中字段不一致的问题
    json = alipayJsonParser(json, type)
  }

  return JSON.stringify(json, null, '  ');
};

// 组件引用url是否包含特殊字符串， 如果包含，则在非百度小程序删除此组件引用
function requireDelete(url, type) {
  return type !== 'swan' && EXCLUDE_URL_MATCHER.test(url)
}

// 百度平台 匹配不到特殊字符串， 需要替换为绝对路径
function requireReplace(url, type) {
  return type === 'swan' && !EXCLUDE_URL_MATCHER.test(url)
}
