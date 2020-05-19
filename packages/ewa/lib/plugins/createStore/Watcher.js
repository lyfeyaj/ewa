"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var isFunction = require('lodash.isfunction');

var cloneDeep = require('lodash.clonedeep');

var Observer = require('./Observer');

var obInstance = Observer.getInstance();
var uid = 0;

var Watcher =
/*#__PURE__*/
function () {
  function Watcher() {
    var argsData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var updateFn = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, Watcher);

    // 备份data数据
    this.$data = cloneDeep(argsData); // 更新函数

    this.updateFn = updateFn; // watcherId

    this.id = ++uid; // 收集data和globalData的交集作为响应式对象

    this.reactiveData = {}; // 初始化

    this.initReactiveData();
    this.createObserver(); // 收集watcher

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
      if (isFunction(this.updateFn)) this.updateFn(_defineProperty({}, key, value));
    }
  }]);

  return Watcher;
}();

module.exports = Watcher;