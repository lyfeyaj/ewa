"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.watcherInstall = watcherInstall;

var _Watcher = _interopRequireDefault(require("./Watcher"));

var _Observer = _interopRequireDefault(require("./Observer"));

var _reactive = require("./reactive");

var utils = _interopRequireWildcard(require("./utils.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var obInstance = _Observer.default.getInstance();

function watcherInstall() {
  var prePage = Page;

  Page = function Page() {
    var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};

    var _onLoad = obj.onLoad || utils.noop;

    var _onUnload = obj.onUnload || utils.noop;

    obj.onLoad = function () {
      var updateMethod = this.setState || this.setData;
      var data = obj.data || {}; // 页面初始化添加watcher

      if (!this._watcher || !(this._watcher instanceof _Watcher.default)) {
        this._watcher = new _Watcher.default(data, updateMethod.bind(this));
      }

      return _onLoad.apply(this, arguments);
    };

    obj.onUnload = function () {
      // 页面销毁时移除watcher
      this._watcher.removeObserver();

      return _onUnload.apply(this, arguments);
    }; // 注入内置函数


    var store = createStore();
    obj.$set = store.set;
    obj.$on = store.on;
    obj.$emit = store.emit;
    obj.$off = store.off;
    obj.$once = store.once;
    return prePage(obj);
  };

  var preComponent = Component;

  Component = function Component() {
    var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    obj.lifetimes = obj.lifetimes || {};
    obj.methods = obj.methods || {};

    var _attached = obj.lifetimes.attached || obj.attached || utils.noop;

    var _detached = obj.lifetimes.detached || obj.detached || utils.noop;

    obj.lifetimes.attached = obj.attached = function () {
      var updateMethod = this.setState || this.setData;
      var data = obj.data || {}; // 组件初始化添加watcher

      if (!this._watcher || !(this._watcher instanceof _Watcher.default)) {
        this._watcher = new _Watcher.default(data, updateMethod.bind(this));
      }

      return _attached.apply(this, arguments);
    };

    obj.lifetimes.detached = obj.detached = function () {
      // 页面销毁时移除watcher
      this._watcher.removeObserver();

      return _detached.apply(this, arguments);
    }; // 注入内置函数


    var store = createStore();
    obj.methods.$set = store.set;
    obj.methods.$on = store.on;
    obj.methods.$emit = store.emit;
    obj.methods.$off = store.off;
    obj.methods.$once = store.once;
    return preComponent(obj);
  };
} // 提供接口仓库


var createStore = function createStore() {
  // 手动更新全局data
  function set(key, value) {
    (0, _reactive.handleUpdate)(key, value);
  } // 添加注册事件函数


  function on(key, callback) {
    obInstance.onEvent(key, callback, this._watcher.id);
  } // 添加通知更新函数


  function emit(key, obj) {
    obInstance.emitEvent(key, obj);
  } // 添加解绑事件函数


  function off(key) {
    obInstance.off(key, this._watcher.id);
  } // 添加执行一次事件函数


  function once(key, callback) {
    obInstance.once(key, callback, this._watcher.id);
  }

  var store = {
    set: set,
    on: on,
    emit: emit,
    off: off,
    once: once
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