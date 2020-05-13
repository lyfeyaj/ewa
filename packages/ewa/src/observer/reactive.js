import * as utils from './utils.js';
import Observer from './Observer';
const obInstance = Observer.getInstance();
const get = require('lodash.get');
const set = require('lodash.set');

export function reactive (obj, key) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], key);
  }
  return obj;
}

// 对象响应式化
function defineReactive(obj, key, path) {
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return;
  // 兼容自定义getter/setter
  const getter = property && property.get;
  const setter = property && property.set;
  let val = obj[key];
  // 记录遍历层级
  if (path) path = `${path}.${key}`;
  // 深度遍历
  if (utils.isObject(val)) reactive(val, path || key);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val;
      return value;
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val;
      if (newVal === value || (newVal !== newVal && value !== value)) return;
      if (getter && !setter) return;
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
        trigger(path || key, val);
      }
    }
  });
}

// 自动更新
function trigger(key, value) {
  obInstance.emitReactive(key, value);
}

// 手动更新
export function handleUpdate(key, value) {
  const { globalData } = getApp();
  // key在globalData中 更新globalData
  if (utils.hasKeyByObj(globalData, key)) {
    if (get(globalData, key) !== value) {
      set(globalData, key, value);
    } else {
      trigger(key, value);
    }
  } else {
    // key不在globalData中 手动更新所有watcher中的$data
    obInstance.globalWatchers.forEach(watcher => {
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