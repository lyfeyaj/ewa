const Watcher = require('./Watcher');
const Observer = require('./Observer');

const obInstance = Observer.getInstance();

function noop() {}

// 检查方法名是否冲突
function checkExistedMethods(ctx, methodsArr) {
  methodsArr.forEach((fn) => {
    if (fn in ctx) {
      if (console && console.warn) console.warn(`${fn} 方法将被覆盖，请尽快调整`);
    }
  });
}

// 注入接口方法
const injectStoreMethods = (ctx) => {
  // 检查方法
  checkExistedMethods(ctx, ['$set', '$on', '$emit', '$off', '$once']);
  // 手动更新全局data
  ctx.$set = function (key, value) {
    obInstance.handleUpdate(key, value);
  };
  // 添加注册事件函数
  ctx.$on = function (key, callback) {
    if (this.__watcher && this.__watcher.id) obInstance.onEvent(key, callback, ctx, this.__watcher.id);
  };
  // 添加通知更新函数
  ctx.$emit = function (key, obj) {
    obInstance.emitEvent(key, obj);
  };
  // 添加解绑事件函数
  ctx.$off = function (key) {
    if (this.__watcher && this.__watcher.id) obInstance.off(key, this.__watcher.id);
  };
  // 添加执行一次事件函数
  ctx.$once = function (key, callback) {
    if (this.__watcher && this.__watcher.id) obInstance.once(key, callback, this.__watcher.id);
  };
};

// 初始化store
function initStore() {
  try {
    const prePage = Page;
    Page = function (obj = {}) {
      const _onLoad = obj.onLoad || noop;
      const _onUnload = obj.onUnload || noop;

      obj.onLoad = function () {
        // 页面初始化添加watcher
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.__watcher = new Watcher(this);
        }
        // 注入内置函数
        injectStoreMethods(this);
        return _onLoad.apply(this, arguments);
      };
      obj.onUnload = function () {
        // 页面销毁时移除watcher
        if (this.__watcher && (this.__watcher instanceof Watcher)) {
          this.__watcher.removeObserver();
        }
        return _onUnload.apply(this, arguments);
      };

      return prePage(obj);
    };

    const preComponent = Component;
    Component = function (obj = {}) {
      obj.lifetimes = obj.lifetimes || {};
      const _attached = obj.lifetimes.attached || obj.attached || noop;
      const _detached = obj.lifetimes.detached || obj.detached || noop;

      obj.lifetimes.attached = obj.attached = function () {
        // 组件初始化添加watcher 兼容$watch属性
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.$watch = obj.$watch;
          this.__watcher = new Watcher(this);
        }
        // 注入内置函数
        injectStoreMethods(this);
        return _attached.apply(this, arguments);
      };
      obj.lifetimes.detached = obj.detached = function () {
        // 页面销毁时移除watcher
        if (this.__watcher && (this.__watcher instanceof Watcher)) {
          this.__watcher.removeObserver();
        }
        return _detached.apply(this, arguments);
      };

      return preComponent(obj);
    };
  } catch (e) {
    console.log('覆盖小程序 Page 或 Component 出错', e);
  }
}

module.exports = initStore;
