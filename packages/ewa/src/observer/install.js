import Watcher from './Watcher';
import Observer from './Observer';
import { handleUpdate } from './reactive';
import * as utils from './utils.js';

const obInstance = Observer.getInstance();

export function watcherInstall() {
  const prePage = Page;
  Page = function() {
    const obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const _onLoad = obj.onLoad || utils.noop;
    const _onUnload = obj.onUnload || utils.noop;

    obj.onLoad = function () {
      const updateMethod = this.setState || this.setData;
      const data = obj.data || {};
      // 页面初始化添加watcher
      if (!this._watcher || !(this._watcher instanceof Watcher)) {
        this._watcher = new Watcher(data, updateMethod.bind(this));
      }
      return _onLoad.apply(this, arguments);
    };
    obj.onUnload = function () {
      // 页面销毁时移除watcher
      this._watcher.removeObserver();
      return _onUnload.apply(this, arguments);
    };
    // 注入内置函数
    let store = createStore();
    obj.$set = store.set;
    obj.$on = store.on;
    obj.$emit = store.emit;
    obj.$off = store.off;
    obj.$once = store.once;
    
    return prePage(obj);
  };

  const preComponent = Component;
  Component = function() {
    const obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    obj.lifetimes = obj.lifetimes || {};
    obj.methods = obj.methods || {};
    const _attached = obj.lifetimes.attached || obj.attached || utils.noop;
    const _detached = obj.lifetimes.detached || obj.detached || utils.noop;

    obj.lifetimes.attached = obj.attached = function () {
      const updateMethod = this.setState || this.setData;
      const data = obj.data || {};
      // 组件初始化添加watcher
      if (!this._watcher || !(this._watcher instanceof Watcher)) {
        this._watcher = new Watcher(data, updateMethod.bind(this));
      }
      return _attached.apply(this, arguments);
    };
    obj.lifetimes.detached = obj.detached = function () {
      // 页面销毁时移除watcher
      this._watcher.removeObserver();
      return _detached.apply(this, arguments);
    };
    // 注入内置函数
    const store = createStore();
    obj.methods.$set = store.set;
    obj.methods.$on = store.on;
    obj.methods.$emit = store.emit;
    obj.methods.$off = store.off;
    obj.methods.$once = store.once;

    return preComponent(obj);
  };
}

// 提供接口仓库
const createStore = () => {
  // 手动更新全局data
  function set(key, value) { 
    handleUpdate(key, value);
  }
  // 添加注册事件函数
  function on(key, callback) {
    obInstance.onEvent(key, callback, this._watcher.id);
  }
  // 添加通知更新函数
  function emit(key, obj) { 
    obInstance.emitEvent(key, obj);
  }
  // 添加解绑事件函数
  function off(key) { 
    obInstance.off(key, this._watcher.id);
  }
  // 添加执行一次事件函数
  function once(key, callback) { 
    obInstance.once(key, callback, this._watcher.id);
  }
  const store = {
    set,
    on,
    emit,
    off,
    once
  };
  return store;
};

/*
  注入全局方法 使用示例:
  this.$on('test', (val) => { console.log(val) })
  this.$emit('test', 'value') // 'value'

  this.$once 使用方法同this.$on 只会触发一次

  this.$off('test') 解绑当前实例通过this.$on(...)注册的事件

  以上方法适用于 1.页面与页面 2.页面与组件 3.组件与组件
  注: 所有页面或组件销毁时会自动解绑所有的事件(无需使用this.$off(...))

  另: this.$set('coinName', '金币') 更新所有页面和组件data中'coinName'的值为'金币' 如果globalData中含此字段 一并更新 （支持嵌套属性和数组下标修改）
*/