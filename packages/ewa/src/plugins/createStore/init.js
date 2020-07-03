const Watcher = require('./Watcher');
const Observer = require('./Observer');
const obInstance = Observer.getInstance();

function noop() {}

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
        return _onLoad.apply(this, arguments);
      };
      obj.onUnload = function () {
        // 页面销毁时移除watcher
        this.__watcher.removeObserver();
        return _onUnload.apply(this, arguments);
      };
      // 注入内置函数
      injectStoreMethods(obj);

      return prePage(obj);
    };

    const preComponent = Component;
    Component = function (obj = {}) {
      obj.lifetimes = obj.lifetimes || {};
      obj.methods = obj.methods || {};
      const _attached = obj.lifetimes.attached || obj.attached || noop;
      const _detached = obj.lifetimes.detached || obj.detached || noop;

      obj.lifetimes.attached = obj.attached = function () {
        // 组件初始化添加watcher 兼容$watch
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.$watch = obj.$watch
          this.__watcher = new Watcher(this);
        }
        return _attached.apply(this, arguments);
      };
      obj.lifetimes.detached = obj.detached = function () {
        // 页面销毁时移除watcher
        this.__watcher.removeObserver();
        return _detached.apply(this, arguments);
      };
      // 注入内置函数
      injectStoreMethods(obj.methods);

      return preComponent(obj);
    };
  } catch (e) {
    console.log('覆盖小程序 Page 或 Component 出错', e);
  }
}

// 注入接口方法
const injectStoreMethods = obj => {
  // 检查方法
  checkExistedMethods(obj, ['$set', '$on', '$emit', '$off', '$once']);
  // 手动更新全局data
  obj.$set = function (key, value) {
    obInstance.handleUpdate(key, value);
  };
  // 添加注册事件函数
  obj.$on = function (key, callback) {
    obInstance.onEvent(key, callback, this.__watcher.id);
  };
  // 添加通知更新函数
  obj.$emit = function (key, obj) {
    obInstance.emitEvent(key, obj);
  };
  // 添加解绑事件函数
  obj.$off = function (key) {
    obInstance.off(key, this.__watcher.id);
  };
  // 添加执行一次事件函数
  obj.$once = function (key, callback) {
    obInstance.once(key, callback, this.__watcher.id);
  };
};

// 检查方法名是否冲突
function checkExistedMethods(obj, methodsArr) {
  methodsArr.forEach(fn => {
    if (fn in obj) {
      if (console && console.warn) console.warn(`${fn} 方法将被覆盖，请尽快调整`);
    }
  });
}

module.exports = initStore;