"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var isFunction = require('lodash.isfunction');

var get = require('lodash.get');

var set = require('lodash.set');

var has = require('lodash.has');

var _require = require('./reactive'),
    trigger = _require.trigger;

var isExistSameId = require('../../utils/isExistSameId');

var removeEmptyArr = require('../../utils/removeEmptyArr');

var removeById = require('../../utils/removeById');

var Observer = /*#__PURE__*/function () {
  function Observer() {
    _classCallCheck(this, Observer);

    // 初始化响应式对象
    this.reactiveObj = new Object(); // 响应式对象集合

    this.reactiveBus = new Object(); // 自定义事件集合

    this.eventBus = new Object(); // 全局watcher集合

    this.globalWatchers = new Array();
  } // 获取唯一实例


  _createClass(Observer, [{
    key: "setGlobalWatcher",
    // 收集全局watcher
    value: function setGlobalWatcher(obj) {
      if (!isExistSameId(this.globalWatchers, obj.id)) this.globalWatchers.push(obj);
    } // 收集响应式数据

  }, {
    key: "onReactive",
    value: function onReactive(key, obj) {
      if (!this.reactiveBus[key]) this.reactiveBus[key] = new Array();
      if (!isExistSameId(this.reactiveBus[key], obj.id)) this.reactiveBus[key].push(obj);
    } // 收集自定义事件 

  }, {
    key: "onEvent",
    value: function onEvent(key, obj, watcherId) {
      if (!this.eventBus[key]) this.eventBus[key] = new Array();

      if (isExistSameId(this.eventBus[key], watcherId)) {
        if (console && console.warn) console.warn("\u81EA\u5B9A\u4E49\u4E8B\u4EF6 '".concat(key, "' \u65E0\u6CD5\u91CD\u590D\u6DFB\u52A0\uFF0C\u8BF7\u5C3D\u5FEB\u8C03\u6574"));
      } else {
        this.eventBus[key].push(this.toEventObj(watcherId, obj));
      }
    } // 收集仅执行一次事件

  }, {
    key: "once",
    value: function once(key, callback, watcherId) {
      var _this = this;

      //创建一个调用后立即解绑函数
      var wrapFanc = function wrapFanc(args) {
        callback(args);

        _this.off(key, watcherId);
      };

      this.onEvent(key, wrapFanc, watcherId);
    } // 转为eventBus对象

  }, {
    key: "toEventObj",
    value: function toEventObj(id, callback) {
      return {
        id: id,
        callback: callback
      };
    } // 解绑自定义事件

  }, {
    key: "off",
    value: function off(key, watcherId) {
      if (!has(this.eventBus, key)) return;
      this.eventBus[key] = removeById(this.eventBus[key], watcherId);
      removeEmptyArr(this.eventBus, key);
    } // 移除reactiveBus

  }, {
    key: "removeReactive",
    value: function removeReactive(watcherKeys, id) {
      var _this2 = this;

      watcherKeys.forEach(function (key) {
        _this2.reactiveBus[key] = removeById(_this2.reactiveBus[key], id);
        removeEmptyArr(_this2.reactiveBus, key);
      });
    } // 移除eventBus

  }, {
    key: "removeEvent",
    value: function removeEvent(id) {
      var _this3 = this;

      var eventKeys = Object.keys(this.eventBus);
      eventKeys.forEach(function (key) {
        _this3.eventBus[key] = removeById(_this3.eventBus[key], id);
        removeEmptyArr(_this3.eventBus, key);
      });
    } // 移除全局watcher

  }, {
    key: "removeWatcher",
    value: function removeWatcher(id) {
      this.globalWatchers = removeById(this.globalWatchers, id);
    } // 触发响应式数据更新

  }, {
    key: "emitReactive",
    value: function emitReactive(key, value) {
      var mergeKey = key.indexOf('.') > -1 ? key.split('.')[0] : key;
      if (!has(this.reactiveBus, mergeKey)) return;
      this.reactiveBus[mergeKey].forEach(function (obj) {
        if (obj.update && isFunction(obj.update)) obj.update(key, value);
      });
    } // 触发自定义事件更新

  }, {
    key: "emitEvent",
    value: function emitEvent(key, value) {
      if (!has(this.eventBus, key)) return;
      this.eventBus[key].forEach(function (obj) {
        if (obj.callback && isFunction(obj.callback)) obj.callback(value);
      });
    } // 手动更新

  }, {
    key: "handleUpdate",
    value: function handleUpdate(key, value) {
      // key在reactiveObj中 更新reactiveObj
      if (has(this.reactiveObj, key)) {
        if (get(this.reactiveObj, key) !== value) {
          set(this.reactiveObj, key, value);
        } else {
          trigger(key, value);
        }
      } else {
        // key不在reactiveObj中 手动更新所有watcher中的$data
        this.globalWatchers.forEach(function (watcher) {
          if (has(watcher.$data, key)) {
            watcher.update(key, value);
          }
        });
      }
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!this.instance) {
        this.instance = new Observer();
      }

      return this.instance;
    }
  }]);

  return Observer;
}();

module.exports = Observer;