"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reactive = reactive;
exports.handleUpdate = handleUpdate;

var utils = _interopRequireWildcard(require("./utils.js"));

var _Observer = _interopRequireDefault(require("./Observer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var obInstance = _Observer.default.getInstance();

var get = require('lodash.get');

var set = require('lodash.set');

function reactive(obj, key) {
  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], key);
  }

  return obj;
} // 对象响应式化


function defineReactive(obj, key, path) {
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return; // 兼容自定义getter/setter

  var getter = property && property.get;
  var setter = property && property.set;
  var val = obj[key]; // 记录遍历层级

  if (path) path = "".concat(path, ".").concat(key); // 深度遍历

  if (utils.isObject(val)) reactive(val, path || key);
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
        trigger(path || key, val);
      }
    }
  });
} // 自动更新


function trigger(key, value) {
  obInstance.emitReactive(key, value);
} // 手动更新


function handleUpdate(key, value) {
  var _getApp = getApp(),
      globalData = _getApp.globalData; // key在globalData中 更新globalData


  if (utils.hasKeyByObj(globalData, key)) {
    if (get(globalData, key) !== value) {
      set(globalData, key, value);
    } else {
      trigger(key, value);
    }
  } else {
    // key不在globalData中 手动更新所有watcher中的$data
    obInstance.globalWatchers.forEach(function (watcher) {
      if (utils.hasKeyByObj(watcher.$data, key)) {
        watcher.update(key, value);
      }
    });
  }
}
/* 
  使globalData响应式化，即 globalData修改 => 全局data(同字段)更新

  支持默认修改:     
    App().globalData.a = 'xxx'
  支持属性嵌套修改:
    App().globalData.a.b.c = 'yyy'
  支持数组下标修改:   
    App().globalData.a[3] = 'zzz'
    App().globalData.a.3 = 'zzz'
*/