const isFunction = require('lodash.isfunction');
const get = require('lodash.get');
const set = require('lodash.set');
const has = require('lodash.has');
const { trigger } = require('./reactive');

class Observer {
  constructor() {
    // 初始化响应式对象
    this.reactiveObj = {};
    // 响应式对象集合
    this.reactiveBus = {};
    // 自定义事件集合
    this.eventBus = {};
    // 全局watcher集合
    this.globalWatchers = [];
  }

  // 获取唯一实例
  static getInstance() {
    if (!this.instance) {
      this.instance = new Observer();
    }
    return this.instance;
  }
  
  // 收集全局watcher
  setGlobalWatcher(obj) {
    if (!this.isExistSameId(this.globalWatchers, obj.id)) this.globalWatchers.push(obj);
  }

  // 收集响应式数据
  onReactive(key, obj) {
    if (!this.reactiveBus[key]) this.reactiveBus[key] = [];
    if (!this.isExistSameId(this.reactiveBus[key], obj.id)) this.reactiveBus[key].push(obj);
  }

  // 收集自定义事件 
  onEvent(key, obj, watcherId) {
    if (!this.eventBus[key]) this.eventBus[key] = [];
    if (this.isExistSameId(this.eventBus[key], watcherId)) {
      if (console && console.warn) console.warn(`自定义事件 '${key}' 无法重复添加，请尽快调整`);
    } else {
      this.eventBus[key].push(this.toEventObj(watcherId, obj));
    }
  }

  // 收集仅执行一次事件
  once(key, callback, watcherId) {
    //创建一个调用后立即解绑函数
    const wrapFanc = (args) => {
      callback(args);
      this.off(key, watcherId);
    };
    this.onEvent(key, wrapFanc, watcherId);
  }

  // 转为eventBus对象
  toEventObj(id, callback) {
    return { id, callback };
  }

  // 解绑自定义事件
  off(key, watcherId) {
    if (!has(this.eventBus, key)) return;
    this.eventBus[key] = this.removeById(this.eventBus[key], watcherId);
    this.removeEmptyArr(this.eventBus, key);
  }

  // 移除reactiveBus
  removeReactive(watcherKeys, id) {
    watcherKeys.forEach(key => {
      this.reactiveBus[key] = this.removeById(this.reactiveBus[key], id);
      this.removeEmptyArr(this.reactiveBus, key);
    });
  }

  // 移除eventBus
  removeEvent(id) {
    const eventKeys = Object.keys(this.eventBus);
    eventKeys.forEach(key => {
      this.eventBus[key] = this.removeById(this.eventBus[key], id);
      this.removeEmptyArr(this.eventBus, key);
    });
  }

  // 移除全局watcher
  removeWatcher(id) {
    this.globalWatchers = this.removeById(this.globalWatchers, id);
  }

  // 触发响应式数据更新
  emitReactive(key, value) {
    const mergeKey = key.indexOf('.') > -1 ? key.split('.')[0] : key;
    if (!has(this.reactiveBus, mergeKey)) return;
    this.reactiveBus[mergeKey].forEach(obj => {
      if (isFunction(obj.update)) obj.update(key, value);
    });
  }

  // 触发自定义事件更新
  emitEvent(key, value) {
    if (!has(this.eventBus, key)) return;
    this.eventBus[key].forEach(obj => {
      if (isFunction(obj.callback)) obj.callback(value);
    });
  }

  // 手动更新
  handleUpdate(key, value) {
    // key在reactiveObj中 更新reactiveObj
    if (has(this.reactiveObj, key)) {
      if (get(this.reactiveObj, key) !== value) {
        set(this.reactiveObj, key, value);
      } else {
        trigger(key, value);
      }
    } else {
      // key不在reactiveObj中 手动更新所有watcher中的$data
      this.globalWatchers.forEach(watcher => {
        if (has(watcher.$data, key)) {
          watcher.update(key, value);
        }
      });
    }
  }

  // 判断数组中是否存在相同id的元素
  isExistSameId(arr, id) {
    if (Array.isArray(arr) && arr.length) {
      return arr.findIndex(item => item.id === id) > -1;
    }
    return false;
  }

  // 根据id删除数组中元素
  removeById(arr, id) {
    if (Array.isArray(arr) && arr.length) {
      return arr.filter(item => item.id !== id);
    }
    return arr;
  }
  
  // 删除对象中空数组的属性
  removeEmptyArr(obj, key) {
    if (!obj || !Array.isArray(obj[key])) return;
    if (obj[key].length === 0) delete obj[key];
  }
}

module.exports = Observer;