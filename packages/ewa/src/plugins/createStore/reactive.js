const isObject = require('lodash.isobject');
const Observer = require('./Observer');

const obInstance = Observer.getInstance();

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
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      if (newVal === value) return;
      if (getter && !setter) return;
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
        obInstance.emitReactive(path || key, val);
      }
    },
  });
}

/**
 * 使 obj 响应式化
 * @param {Object} obj - 数据对象
 * @param {string} key - 属性 key
 * @example
 * 使obj响应式化，即 obj 修改 => 全局 data (同字段)更新
 * 支持默认修改:
 *   obj.a = 'xxx'
 * 支持属性嵌套修改:
 *   obj.a.b.c = 'yyy'
 * 支持数组下标修改:
 *   obj.a[3] = 'zzz'
 *   obj.a.3 = 'zzz'
 */
function reactive(obj, key) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], key);
  }
}

module.exports = reactive;
