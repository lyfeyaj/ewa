"use strict";

var Watcher = require('./Watcher');

var Observer = require('./Observer');

var obInstance = Observer.getInstance();

function noop() {}

function checkExistedMethods(ctx, methodsArr) {
  methodsArr.forEach(function (fn) {
    if (fn in ctx) {
      if (console && console.warn) console.warn("".concat(fn, " \u65B9\u6CD5\u5C06\u88AB\u8986\u76D6\uFF0C\u8BF7\u5C3D\u5FEB\u8C03\u6574"));
    }
  });
}

var injectStoreMethods = function injectStoreMethods(ctx) {
  checkExistedMethods(ctx, ['$set', '$on', '$emit', '$off', '$once']);

  ctx.$set = function (key, value) {
    obInstance.handleUpdate(key, value);
  };

  ctx.$on = function (key, callback) {
    if (this.__watcher && this.__watcher.id) {
      obInstance.onEvent(key, callback, ctx, this.__watcher.id);
    }
  };

  ctx.$emit = function (key, obj) {
    obInstance.emitEvent(key, obj);
  };

  ctx.$off = function (key) {
    if (this.__watcher && this.__watcher.id) {
      obInstance.off(key, this.__watcher.id);
    }
  };

  ctx.$once = function (key, callback) {
    if (this.__watcher && this.__watcher.id) {
      obInstance.once(key, callback, this.__watcher.id);
    }
  };
};

function initStore() {
  try {
    var prePage = Page;

    Page = function Page() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _onLoad = obj.onLoad || noop;

      var _onUnload = obj.onUnload || noop;

      obj.onLoad = function () {
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.__watcher = new Watcher(this);
        }

        injectStoreMethods(this);
        return _onLoad.apply(this, arguments);
      };

      obj.onUnload = function () {
        _onUnload.apply(this, arguments);

        if (this.__watcher && this.__watcher instanceof Watcher) {
          this.__watcher.removeObserver();
        }
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
        if (!this.__watcher || !(this.__watcher instanceof Watcher)) {
          this.$watch = obj.$watch;
          this.__watcher = new Watcher(this);
        }

        injectStoreMethods(this);
        return _attached.apply(this, arguments);
      };

      obj.lifetimes.detached = obj.detached = function () {
        _detached.apply(this, arguments);

        if (this.__watcher && this.__watcher instanceof Watcher) {
          this.__watcher.removeObserver();
        }
      };

      return preComponent(obj);
    };
  } catch (e) {
    console.warn('覆盖小程序 Page 或 Component 出错', e);
  }
}

module.exports = initStore;