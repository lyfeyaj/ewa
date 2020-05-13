"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _Observer = _interopRequireDefault(require("./Observer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var obInstance = _Observer.default.getInstance();

var uid = 0;

var Watcher = /*#__PURE__*/function () {
  function Watcher() {
    _classCallCheck(this, Watcher);

    var argsData = arguments[0] ? arguments[0] : {}; // 备份data数据

    this.$data = JSON.parse(JSON.stringify(argsData)); // 更新函数

    this.updateFn = arguments[1] ? arguments[1] : {}; // watcherId

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

      var _getApp = getApp(),
          globalData = _getApp.globalData;

      for (var i = 0; i < props.length; i++) {
        var prop = props[i];

        if (prop in globalData) {
          this.reactiveData[prop] = globalData[prop];
          this.update(prop, globalData[prop]);
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
      if (utils.isFunction(this.updateFn)) this.updateFn(_defineProperty({}, key, value));
    }
  }]);

  return Watcher;
}();

exports.default = Watcher;
module.exports = exports.default;
module.exports.default = exports.default;