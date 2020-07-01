"use strict";

var isObject = require('lodash.isobject');

var isPlainObject = require('lodash.isplainobject');

var initStore = require('./init');

var Observer = require('./Observer');

var obInstance = Observer.getInstance();
/*
  使obj响应式化，即 obj修改 => 全局data(同字段)更新

  支持默认修改:
    obj.a = 'xxx'
  支持属性嵌套修改:
    obj.a.b.c = 'yyy'
  支持数组下标修改:
    obj.a[3] = 'zzz'
    obj.a.3 = 'zzz'
*/

var hasStore = false; // 创建全局store对象

function createStore(obj) {
  if (hasStore) return;
  hasStore = true;
  initStore();

  if (isPlainObject(obj)) {
    obInstance.reactiveObj = obj;
    reactive(obj);
    return obj;
  } else {
    if (console && console.warn) console.warn('createStore方法只能接收纯对象，请尽快调整');
  }
} // 遍历对象使其响应式化


function reactive(obj, key) {
  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], key);
  }
} // 劫持属性


function defineReactive(obj, key, path) {
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return; // 兼容自定义getter/setter

  var getter = property && property.get;
  var setter = property && property.set;
  var val = obj[key]; // 记录遍历层级

  if (path) path = "".concat(path, ".").concat(key); // 深度遍历

  if (isObject(val)) reactive(val, path || key);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value || newVal !== newVal && value !== value) return;
      if (getter && !setter) return;

      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
        obInstance.emitReactive(path || key, val);
      }
    }
  });
}

module.exports = createStore;