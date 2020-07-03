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

    // 上下文环境
    ctx = options; // data数据

    this.$data = options.data || {}; // $watch数据

    this.$watch = options.$watch || {}; // 更新函数

    this.updateFn = options.setState || options.setData; // watcherId

    this.id = ++uid; // 收集data和globalData的交集作为响应式对象

    this.reactiveData = {}; // 初始化数据

    this.initReactiveData();
    this.createObserver();
    this.setUserWatcher(); // 收集watcher

    obInstance.setGlobalWatcher(this);
  } // 初始化数据并首次更新


  _createClass(Watcher, [{
    key: "initReactiveData",
    value: function initReactiveData() {
      var props = Object.keys(this.$data);
      var reactiveObj = obInstance.reactiveObj;

      for (var i = 0; i < props.length; i++) {
        var prop = props[i];

        if (prop in reactiveObj) {
          this.reactiveData[prop] = reactiveObj[prop];
          this.update(prop, reactiveObj[prop]);
        }
      }
    } // 添加订阅

  }, {
    key: "createObserver",
    value: function createObserver() {
      var _this = this;

      var props = Object.keys(this.reactiveData);

      if (props.length > 0) {
        props.forEach(function (prop) {
          obInstance.onReactive(prop, _this);
        });
      }
    } // 初始化收集自定义watcher

  }, {
    key: "setUserWatcher",
    value: function setUserWatcher() {
      var props = Object.keys(this.$watch);

      for (var i = 0; i < props.length; i++) {
        var prop = props[i];

        if (prop in this.$data) {
          var cb = get(this, ['$watch', prop, 'handler']) || get(this, ['$watch', prop]);
          var deep = get(this, ['$watch', prop, 'deep']);
          var immediate = get(this, ['$watch', prop, 'immediate']); // 收集依赖

          this.reactiveUserWatcher(this.$data, prop, cb, deep); // 首次触发回调

          if (immediate) this.handleCallback(cb, this.$data[prop]);
        }
      }
    } // 响应式化自定义watcher

  }, {
    key: "reactiveUserWatcher",
    value: function reactiveUserWatcher(obj, key, cb, deep) {
      var _this2 = this;

      var val = obj[key];

      if (isObject(val) && deep) {
        Object.keys(val).forEach(function (childKey) {
          _this2.reactiveUserWatcher(val, childKey, cb, deep);
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

          _this2.handleCallback(cb, newVal, val);

          val = newVal;
          if (deep) _this2.reactiveUserWatcher(obj, key, cb, deep);
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
      var props = Object.keys(this.reactiveData);
      if (props.length > 0) obInstance.removeReactive(props, this.id); // 移除相关事件及全局watcher

      obInstance.removeEvent(this.id);
      obInstance.removeWatcher(this.id);
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