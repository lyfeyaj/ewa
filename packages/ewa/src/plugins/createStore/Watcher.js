const isFunction = require('lodash.isfunction');
const isObject = require('lodash.isobject');
const get = require('lodash.get');
const Observer = require('./Observer');
const obInstance = Observer.getInstance();

let uid = 0;
let ctx

class Watcher {
  constructor(options) {
    // 上下文环境
    ctx = options
    // data数据
    this.$data = options.data || {};
    // $watch数据
    this.$watch = options.$watch || {};
    // 更新函数
    this.updateFn = options.setState || options.setData;
    // watcherId
    this.id = ++uid;
    // 收集data和globalData的交集作为响应式对象
    this.reactiveData = {};
    // 初始化数据
    this.initReactiveData();
    this.createObserver();
    this.setUserWatcher();
    // 收集watcher
    obInstance.setGlobalWatcher(this);
  }

  // 初始化数据并首次更新
  initReactiveData() {
    const props = Object.keys(this.$data);
    const { reactiveObj } = obInstance;
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (prop in reactiveObj) {
        this.reactiveData[prop] = reactiveObj[prop];
        this.update(prop, reactiveObj[prop]);
      }
    }
  }

  // 添加订阅
  createObserver() {
    const props = Object.keys(this.reactiveData);
    if (props.length > 0) {
      props.forEach(prop => {
        obInstance.onReactive(prop, this);
      });
    }
  }

  // 初始化收集自定义watcher
  setUserWatcher() {
    const props = Object.keys(this.$watch);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (prop in this.$data) {
        const cb = get(this, ['$watch', prop, 'handler']) || get(this, ['$watch', prop])
        const deep = get(this, ['$watch', prop, 'deep'])
        const immediate = get(this, ['$watch', prop, 'immediate'])
        this.reactiveUserWatcher(this.$data, prop, cb, deep);
        // 首次触发回调
        if (immediate) {
          this.handleCallback(cb, this.$data[prop])
        }
      }
    }
  }

  // 响应式化自定义watcher
  reactiveUserWatcher(obj, key, cb, deep) {
    let val = obj[key];
    if (isObject(val) && deep) {
      Object.keys(val).forEach(childKey => {
        this.reactiveUserWatcher(val, childKey, cb, deep);
      })
    }
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: () => {
        return val;
      },
      set: newVal => {
        if (newVal === val || (newVal !== newVal && val !== val)) return;
        this.handleCallback(cb, newVal, val)
        val = newVal;
        if (deep) this.reactiveUserWatcher(obj, key, cb, deep);
      }
    });
  }

  // 执行回调
  handleCallback(cb, newVal, oldVal) {
    if (!isFunction(cb)) return
    try {
      cb.call(ctx, newVal, oldVal)
    } catch (e) {
      console.warn(`[$watch error]: callback for watcher \n ${cb} \n`, e);
    }
  }

  // 移除订阅
  removeObserver() {
    const props = Object.keys(this.reactiveData);
    if (props.length > 0) obInstance.removeReactive(props, this.id);
    // 移除相关事件及全局watcher
    obInstance.removeEvent(this.id);
    obInstance.removeWatcher(this.id);
  }

  // 更新数据和视图
  update(key, value) {
    if (isFunction(this.updateFn)) {
      this.updateFn.call(ctx, { [key]: value });
    }
  }
}

module.exports = Watcher;