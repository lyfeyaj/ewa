"use strict";

var Watcher = require('./Watcher');

var Observer = require('./Observer');

var obInstance = Observer.getInstance();

function noop() {} // 初始化store


function initStore() {
  try {
    var prePage = Page;

    Page = function Page() {
      var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};

      var _onLoad = obj.onLoad || noop;

      var _onUnload = obj.onUnload || noop;

      obj.onLoad = function () {
        var updateMethod = this.setState || this.setData;
        var data = obj.data || {}; // 页面初始化添加watcher

        if (!this._watcher || !(this._watcher instanceof Watcher)) {
          this._watcher = new Watcher(data, updateMethod.bind(this));
        }

        return _onLoad.apply(this, arguments);
      };

      obj.onUnload = function () {
        // 页面销毁时移除watcher
        this._watcher.removeObserver();

        return _onUnload.apply(this, arguments);
      }; // 注入内置函数


      injectStoreMethods(obj);
      return prePage(obj);
    };

    var preComponent = Component;

    Component = function Component() {
      var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      obj.lifetimes = obj.lifetimes || {};
      obj.methods = obj.methods || {};

      var _attached = obj.lifetimes.attached || obj.attached || noop;

      var _detached = obj.lifetimes.detached || obj.detached || noop;

      obj.lifetimes.attached = obj.attached = function () {
        var updateMethod = this.setState || this.setData;
        var data = obj.data || {}; // 组件初始化添加watcher

        if (!this._watcher || !(this._watcher instanceof Watcher)) {
          this._watcher = new Watcher(data, updateMethod.bind(this));
        }

        return _attached.apply(this, arguments);
      };

      obj.lifetimes.detached = obj.detached = function () {
        // 页面销毁时移除watcher
        this._watcher.removeObserver();

        return _detached.apply(this, arguments);
      }; // 注入内置函数


      injectStoreMethods(obj.methods);
      return preComponent(obj);
    };
  } catch (e) {
    console.log('覆盖小程序 Page 或 Component 出错', e);
  }
} // 注入接口方法


var injectStoreMethods = function injectStoreMethods(obj) {
  // 手动更新全局data
  obj.$set = function (key, value) {
    obInstance.handleUpdate(key, value);
  }; // 添加注册事件函数


  obj.$on = function (key, callback) {
    obInstance.onEvent(key, callback, this._watcher.id);
  }; // 添加通知更新函数


  obj.$emit = function (key, obj) {
    obInstance.emitEvent(key, obj);
  }; // 添加解绑事件函数


  obj.$off = function (key) {
    obInstance.off(key, this._watcher.id);
  }; // 添加执行一次事件函数


  obj.$once = function (key, callback) {
    obInstance.once(key, callback, this._watcher.id);
  };
};

module.exports = initStore;