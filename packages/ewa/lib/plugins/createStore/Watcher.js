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

var Watcher = function () {
  function Watcher(options) {
    _classCallCheck(this, Watcher);

    this.ctx = options;
    this.$data = options.data || {};
    this.$watch = options.$watch || {};
    this.updateFn = options.setState || options.setData;
    this.id = ++uid;
    this.reactiveData = {};
    this.initReactiveData();
    this.createObserver();
    this.setCustomWatcher();
    obInstance.setGlobalWatcher(this);
  }

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
    }
  }, {
    key: "createObserver",
    value: function createObserver() {
      var _this2 = this;

      Object.keys(this.reactiveData).forEach(function (key) {
        obInstance.onReactive(key, _this2);
      });
    }
  }, {
    key: "setCustomWatcher",
    value: function setCustomWatcher() {
      var _this3 = this;

      var watch = this.$watch;
      Object.keys(watch).forEach(function (key) {
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
    }
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
          if (newVal === val) return;

          _this4.handleCallback(cb, newVal, val);

          val = newVal;
          if (deep) _this4.reactiveWatcher(obj, key, cb, deep);
        }
      });
    }
  }, {
    key: "handleCallback",
    value: function handleCallback(cb, newVal, oldVal) {
      if (!isFunction(cb) || !this.ctx) return;

      try {
        cb.call(this.ctx, newVal, oldVal);
      } catch (e) {
        console.warn("[$watch error]: callback for watcher \n ".concat(cb, " \n"), e);
      }
    }
  }, {
    key: "removeObserver",
    value: function removeObserver() {
      obInstance.removeReactive(Object.keys(this.reactiveData), this.id);
      obInstance.removeEvent(this.id);
      obInstance.removeWatcher(this.id);
    }
  }, {
    key: "update",
    value: function update(key, value) {
      if (isFunction(this.updateFn) && this.ctx) {
        this.updateFn.call(this.ctx, _defineProperty({}, key, value));
      }
    }
  }]);

  return Watcher;
}();

module.exports = Watcher;