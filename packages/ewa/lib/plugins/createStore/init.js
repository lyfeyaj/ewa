"use strict";

var Watcher = require('./Watcher');

var Observer = require('./Observer');

var obInstance = Observer.getInstance();

function noop() {} // 初始化store


function initStore() {
  try {
    var prePage = Page;

    Page = function Page() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _onLoad = obj.onLoad || noop;

      var _onUnload = obj.onUnload || noop;

      obj.onLoad = function () {
        // 页面初始化添加watcher
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.__watcher = new Watcher(this);
        } // 注入内置函数


        injectStoreMethods(this);
        return _onLoad.apply(this, arguments);
      };

      obj.onUnload = function () {
        // 页面销毁时移除watcher
        this.__watcher.removeObserver();

        return _onUnload.apply(this, arguments);
      };

      return prePage(obj);
    };

    var preComponent = Component;

    Component = function Component() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      obj.lifetimes = obj.lifetimes || {};

      var _attached = obj.lifetimes.attached || obj.attached || noop;

      var _detached = obj.lifetimes.detached || obj.detached || noop;

      obj.lifetimes.attached = obj.attached = function () {
        // 组件初始化添加watcher 兼容$watch
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.$watch = obj.$watch;
          this.__watcher = new Watcher(this);
        } // 注入内置函数


        injectStoreMethods(this);
        return _attached.apply(this, arguments);
      };

      obj.lifetimes.detached = obj.detached = function () {
        // 页面销毁时移除watcher
        this.__watcher.removeObserver();

        return _detached.apply(this, arguments);
      };

      return preComponent(obj);
    };
  } catch (e) {
    console.log('覆盖小程序 Page 或 Component 出错', e);
  }
} // 注入接口方法


var injectStoreMethods = function injectStoreMethods(ctx) {
  // 检查方法
  checkExistedMethods(ctx, ['$set', '$on', '$emit', '$off', '$once']); // 手动更新全局data

  ctx.$set = function (key, value) {
    obInstance.handleUpdate(key, value);
  }; // 添加注册事件函数


  ctx.$on = function (key, callback) {
    obInstance.onEvent(key, callback, ctx, this.__watcher.id);
  }; // 添加通知更新函数


  ctx.$emit = function (key, obj) {
    obInstance.emitEvent(key, obj);
  }; // 添加解绑事件函数


  ctx.$off = function (key) {
    obInstance.off(key, this.__watcher.id);
  }; // 添加执行一次事件函数


  ctx.$once = function (key, callback) {
    obInstance.once(key, callback, this.__watcher.id);
  };
}; // 检查方法名是否冲突


function checkExistedMethods(ctx, methodsArr) {
  methodsArr.forEach(function (fn) {
    if (fn in ctx) {
      if (console && console.warn) console.warn("".concat(fn, " \u65B9\u6CD5\u5C06\u88AB\u8986\u76D6\uFF0C\u8BF7\u5C3D\u5FEB\u8C03\u6574"));
    }
  });
}

module.exports = initStore;