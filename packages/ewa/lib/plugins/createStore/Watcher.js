"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var isFunction = require('lodash.isfunction');

var isObject = require('lodash.isobject');

var get = require('lodash.get');

var Observer = require('./Observer');

var obInstance = Observer.getInstance();
var uid = 0;
var ctx;

var Watcher = /*#__PURE__*/function () {
  function Watcher(options) {
    _classCallCheck(this, Watcher);

    // 执行环境
    ctx = options; // data数据

    this.$data = options.data || {}; // $watch数据

    this.$watch = options.$watch || {}; // 更新函数

    this.updateFn = options.setState || options.setData; // watcherId

    this.id = ++uid; // 收集data和globalData的交集作为响应式对象

    this.reactiveData = {}; // 初始化操作

    this.initReactiveData();
    this.createObserver();
    this.setCustomWatcher(); // 收集watcher

    obInstance.setGlobalWatcher(this);
  } // 初始化数据并首次更新


  _createClass(Watcher, [{
    key: "initReactiveData",
    value: function initReactiveData() {
      var _this = this;

      var reactiveObj = obInstance.reactiveObj;
      Object.keys(this.$data).forEach(function (key) {
        if (key in reactiveObj) {
          _this.reactiveData[key] = reactiveObj[key];

          _this.update(key, reactiveObj[key]);
        }
      });
    } // 添加订阅

  }, {
    key: "createObserver",
    value: function createObserver() {
      var _this2 = this;

      Object.keys(this.reactiveData).forEach(function (key) {
        obInstance.onReactive(key, _this2);
      });
    } // 初始化收集自定义watcher

  }, {
    key: "setCustomWatcher",
    value: function setCustomWatcher() {
      var _this3 = this;

      var watch = this.$watch;
      Object.keys(watch).forEach(function (key) {
        // 记录参数路径
        var keyArr = key.split('.');
        var obj = _this3.$data;

        for (var i = 0; i < keyArr.length - 1; i++) {
          if (!obj) return;
          obj = get(obj, keyArr[i]);
        }

        if (!obj) return;
        var property = keyArr[keyArr.length - 1];
        var cb = watch[key].handler || watch[key];
        var deep = watch[key].deep;

        _this3.reactiveWatcher(obj, property, cb, deep);

        if (watch[key].immediate) _this3.handleCallback(cb, obj[property]);
      });
    } // 响应式化自定义watcher

  }, {
    key: "reactiveWatcher",
    value: function reactiveWatcher(obj, key, cb, deep) {
      var _this4 = this;

      var val = obj[key];

      if (isObject(val) && deep) {
        Object.keys(val).forEach(function (childKey) {
          _this4.reactiveWatcher(val, childKey, cb, deep);
        });
      }

      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function get() {
          return val;
        },
        set: function set(newVal) {
          if (newVal === val || newVal !== newVal && val !== val) return;

          _this4.handleCallback(cb, newVal, val);

          val = newVal;
          if (deep) _this4.reactiveWatcher(obj, key, cb, deep);
        }
      });
    } // 执行自定义watcher回调

  }, {
    key: "handleCallback",
    value: function handleCallback(cb, newVal, oldVal) {
      if (!isFunction(cb)) return;

      try {
        cb.call(ctx, newVal, oldVal);
      } catch (e) {
        console.warn("[$watch error]: callback for watcher \n ".concat(cb, " \n"), e);
      }
    } // 移除订阅

  }, {
    key: "removeObserver",
    value: function removeObserver() {
      // 移除相关依赖并释放内存
      obInstance.removeReactive(Object.keys(this.reactiveData), this.id);
      obInstance.removeEvent(this.id);
      obInstance.removeWatcher(this.id);
      ctx = null;
    } // 更新数据和视图

  }, {
    key: "update",
    value: function update(key, value) {
      if (isFunction(this.updateFn)) {
        this.updateFn.call(ctx, _defineProperty({}, key, value));
      }
    }
  }]);

  return Watcher;
}();

module.exports = Watcher;