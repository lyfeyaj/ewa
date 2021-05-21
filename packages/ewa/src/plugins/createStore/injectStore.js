'use strict';

const Watcher = require('./Watcher');
const Observer = require('./Observer');

const obInstance = Observer.getInstance();

function noop() {}

// 警告日志打印
function warn(...messages) {
  if (console && console.warn) console.warn(...messages);
}

// 检查方法名是否冲突
function checkExistedProps(ctx, methodsArr) {
  let noConflicts = true;
  methodsArr.forEach((fn) => {
    if (fn in ctx) {
      hasConflicts = false;
      warn(`${fn} 属性或方法将被覆盖, 请尽快调整。`);
    }
    if (noConflicts) return;
    warn(`
也可以通过指定属性或函数名称，如下:

createStore({}, {
  $set: 'yourCustomSet',
  $on: 'yourCustomOn',
  $emit: 'yourCustomEmit',
  $off: 'yourCustomOff',
  $once: 'yourCustomOnce',
  $watch: 'yourCustomWatch'
})

来避免冲突。
    `);
  });
}

// 注入接口方法
const DEFAULT_PROP_NAMES = {
  $set: '$set',
  $on: '$on',
  $emit: '$emit',
  $off: '$off',
  $once: '$once',
  $watch: '$watch'
};

// 注入方法和属性, 支持自定义方法名称
const injectStoreMethods = (ctx, propNames = {}) => {
  // 获取自定义属性名称
  const _propNames = { ...DEFAULT_PROP_NAMES, ...propNames };

  // 检查方法
  checkExistedProps(ctx, Object.keys(_propNames));

  // 手动更新全局data
  ctx[_propNames['$set']] = function (key, value) {
    obInstance.handleUpdate(key, value);
  };

  // 添加注册事件函数
  ctx[_propNames['$on']] = function (key, callback) {
    if (this.__watcher && this.__watcher.id) {
      obInstance.onEvent(key, callback, ctx, this.__watcher.id);
    }
  };

  // 添加通知更新函数
  ctx[_propNames['$emit']] = function (key, obj) {
    obInstance.emitEvent(key, obj);
  };

  // 添加解绑事件函数
  ctx[_propNames['$off']] = function (key) {
    if (this.__watcher && this.__watcher.id) {
      obInstance.off(key, this.__watcher.id);
    }
  };

  // 添加执行一次事件函数
  ctx[_propNames['$once']] = function (key, callback) {
    if (this.__watcher && this.__watcher.id) {
      obInstance.once(key, callback, this.__watcher.id);
    }
  };
};

// 初始化 store
function initStore(propNames = {}) {
  // 获取自定义 $watch 名称
  const watchPropName = propNames['$watch'];

  // 注入方法和属性到 Page 和 Component 中
  // NOTE: 优化运行时，避免使用这种覆盖的方式，会导致污染
  try {
    const oPage = Page;
    Page = function (obj = {}) {
      const _onLoad = obj.onLoad || noop;
      const _onUnload = obj.onUnload || noop;

      obj.onLoad = function () {
        // 页面初始化添加watcher
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.__watcher = new Watcher(this, { watchPropName });
        }
        // 注入内置函数
        injectStoreMethods(this, propNames);
        return _onLoad.apply(this, arguments);
      };
      obj.onUnload = function () {
        _onUnload.apply(this, arguments);
        // 页面销毁时移除 watcher
        if (this.__watcher && (this.__watcher instanceof Watcher)) {
          this.__watcher.removeObserver();
        }
      };

      return oPage(obj);
    };

    const oComponent = Component;
    Component = function (obj = {}) {
      obj.lifetimes = obj.lifetimes || {};
      const _attached = obj.lifetimes.attached || obj.attached || noop;
      const _detached = obj.lifetimes.detached || obj.detached || noop;

      obj.lifetimes.attached = obj.attached = function () {
        // 组件初始化添加 watcher 兼容 $watch 属性
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this[watchPropName] = obj[watchPropName];
          this.__watcher = new Watcher(this, { watchPropName });
        }
        // 注入内置函数
        injectStoreMethods(this, propNames);
        return _attached.apply(this, arguments);
      };
      obj.lifetimes.detached = obj.detached = function () {
        _detached.apply(this, arguments);
        // 页面销毁时移除watcher
        if (this.__watcher && (this.__watcher instanceof Watcher)) {
          this.__watcher.removeObserver();
        }
      };

      return oComponent(obj);
    };
  } catch (e) {
    warn('覆盖小程序 Page 或 Component 出错', e.message, e.stack);
  }
}

module.exports = initStore;
