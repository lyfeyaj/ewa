const isObject = require('lodash.isobject');
const isPlainObject = require('lodash.isplainobject');
const initStore = require('./init');
const Observer = require('./Observer');
const obInstance = Observer.getInstance();

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
let hasStore = false;
// 创建全局store对象
function createStore (obj) {
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
}

// 遍历对象使其响应式化
function reactive (obj, key) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], key);
  }
}

// 劫持属性
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
  if (isObject(val)) reactive(val, path || key);
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

module.exports = { 
  createStore,
  trigger
};
