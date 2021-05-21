const isPlainObject = require('lodash.isplainobject');
const injectStore = require('./injectStore');
const reactive = require('./reactive');
const observer = require('./Observer').getInstance();

// 确保仅初始化一次
let hasStore = false;

/**
 * 创建响应式 Store
 *
 * @param {Object} obj - store 对象
 * @param {Object} propNames - 自定义属性或方法名称
 * @param {string} propNames.$set - 自定义 $set 方法名称
 * @param {string} propNames.$on - 自定义 $on 方法名称
 * @param {string} propNames.$emit - 自定义 $emit 方法名称
 * @param {string} propNames.$off - 自定义 $off 方法名称
 * @param {string} propNames.$once - 自定义 $once 方法名称
 * @param {string} propNames.$watch - 自定义 $watch 属性名称
 * @returns {Object} 响应式 store 对象
 * @example
 *   使用方法:
 *   1. 创建store:对任意纯对象调用 createStore 使其响应式化（以 app.js 中 globalData 为例）
 *   // app.js
 *   const { createStore } = require('ewa');
 *   ...
 *   App({
 *     ...
 *     globalData: createStore ({
 *       a: 'old1',
 *       b: {
 *         c: 'old2'
 *       }
 *     }, {
 *       $set: 'yourCustomSet',
 *       $on: 'yourCustomOn',
 *       $emit: 'yourCustomEmit',
 *       $off: 'yourCustomOff',
 *       $once: 'yourCustomOnce',
 *       $watch: 'yourCustomWatch'
 *     })
 *   })
 *
 *   如果使用了自定义的属性名称，则下方示例中对应的方法名称需要做相应的修改
 *
 *   2. 改变 globalData, globalData 以及全局状态更新（支持嵌套属性和数组下标修改）
 *   // pageA.js
 *   Page({
 *     data: {
 *       a: '',
 *       b: {
 *         c: ''
 *       }
 *     }
 *   })
 *
 *   onLoad() {
 *     App().globalData.a = 'new1'
 *     console.log(this.data.a === 'new1')  // true
 *
 *     App().globalData.b.c = 'new2'
 *     console.log(this.data.b.c === 'new2') // true
 *   }
 *
 *   3. 注入全局方法 使用示例:
 *   this.$on('test', (val) => { console.log(val) })
 *
 *   this.$emit('test', 'value') // 'value'
 *
 *   this.$once 使用方法同 this.$on 只会触发一次
 *
 *   this.$off('test') 解绑当前实例通过 this.$on(...) 注册的事件
 *
 *   以上方法适用于 1.页面与页面 2.页面与组件 3.组件与组件
 *   注: 所有页面或组件销毁时会自动解绑所有的事件(无需使用this.$off(...))
 *
 *   this.$set('coinName', '金币') 更新所有页面和组件data中'coinName'的值为'金币'（支持嵌套属性和数组下标修改）
 *
 *   2020/07 更新
 *   $watch 监听页面或组件data中属性 支持监听属性路径形式如'a[1].b'  使用示例：
 *
 *   data: {
 *     prop: '',
 *     obj: {
 *       key: ''
 *     }
 *   },
 *   ...
 *   $watch: {
 *     // 方式一
 *     'prop': function(newVal, oldVal) {
 *       ...
 *     },
 *     // 方式二
 *     'obj': {
 *       handler: function(newVal, oldVal) {
 *         ...
 *       },
 *       deep: Boolean, // 深度遍历
 *       immediate: Boolean // 立即触发
 *     }
 *   }
 */
function createStore(obj, propNames = {}) {
  if (hasStore) return;
  hasStore = true;

  // 初始化
  injectStore(propNames);

  if (isPlainObject(obj)) {
    observer.reactiveObj = obj;
    reactive(obj);
    return obj;
  }

  if (console && console.warn) console.warn('createStore 方法只能接收纯对象，请尽快调整');
}

module.exports = createStore;
