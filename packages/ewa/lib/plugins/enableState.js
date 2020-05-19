"use strict";

/* eslint-disable no-console */
var diff = require('deep-diff');

var set = require('lodash.set');

var get = require('lodash.get');

var cloneDeep = require('lodash.clonedeep');

var keys = require('lodash.keys');

var noop = function noop() {}; // 取出 对象中的部分键值，支持 嵌套 key， 如 'user.gender'


function deepPick(obj) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var _obj = {};
  if (!obj) return _obj;

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    _obj[prop] = get(obj, prop);
  }

  return _obj;
} // 日志打印


var logger = function logger(type, name) {
  var stack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var timeConsumption = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var changes = arguments.length > 4 ? arguments[4] : undefined;
  if (!console) return;
  var timeConsumptionMsg = "Diff \u8017\u65F6: ".concat(timeConsumption, "ms");

  try {
    if (console.group) {
      console.group(type, name, '触发更新');
      console.log(timeConsumptionMsg);
      console.log('Diff 结果: ', changes); // 打印调用堆栈

      if (stack && stack.length) {
        var _spaces = '';

        var _stack = stack.reduce(function (res, item, i) {
          if (i === 0) return "".concat(res, "\n    ").concat(item);
          _spaces = '    ' + _spaces;
          return "".concat(res, "\n").concat(_spaces, "\u2514\u2500\u2500 ").concat(item);
        }, '调用栈: ');

        console.log(_stack);
      }

      console.groupEnd();
    } else {
      console.log(type, name, stack, timeConsumptionMsg, 'Diff 结果: ', changes);
    }
  } catch (e) {// Do nothing
  }
}; // 打印 Diff 相关 信息


var printDiffInfo = function printDiffInfo(ctx, debug, time, changes) {
  var timeConsumption = time ? +new Date() - time : 0;
  var type = ctx.__isPage ? '页面:' : '组件:';
  var name = ctx.__isPage ? ctx.route : ctx.is;
  var stack = ctx.__invokeStack || [];
  if (debug === true || debug === 'all') logger(type, name, stack, timeConsumption, changes);
  if (debug === 'page' && ctx.__isPage) logger(type, name, stack, timeConsumption, changes);
  if (debug === 'component' && ctx.__isComponent) logger(type, name, stack, timeConsumption, changes);
}; // 添加调用堆栈属性


var addInvokeStackProp = function addInvokeStackProp(ctx) {
  Object.defineProperty(ctx, '__invokeStack', {
    get: function get() {
      if (this.__invokeStack__) return this.__invokeStack__;
      var stack = [];

      if (typeof this.selectOwnerComponent === 'function') {
        var parent = this.selectOwnerComponent();

        if (parent) {
          if (parent.__isComponent) stack = parent.__invokeStack || [];
          if (parent.__isPage) stack = [parent.route];
        }
      }

      this.__invokeStack__ = stack.concat(this.is);
      return this.__invokeStack__;
    }
  });
}; // 检查并警告 Component 中，data 和 properties 属性冲突


var checkPropertyAndDataConflict = function checkPropertyAndDataConflict(ctx, obj) {
  if (!ctx.__isComponent) return;
  var changedKeys = keys(obj);
  var conflictKeys = [];

  for (var i = 0; i < changedKeys.length; i++) {
    var k = changedKeys[i];

    if (k in ctx.$$properties) {
      conflictKeys.push(k);
    }
  }

  if (conflictKeys.length) {
    console.warn("\u7EC4\u4EF6: ".concat(ctx.is, " \u4E2D, properties \u548C data \u5B58\u5728\u5B57\u6BB5\u51B2\u7A81: ").concat(conflictKeys.join('、'), ", \u8BF7\u5C3D\u5FEB\u8C03\u6574"));
  }
}; // 开启 state 支持


function enableState() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _opts$debug = opts.debug,
      debug = _opts$debug === void 0 ? false : _opts$debug,
      _opts$component = opts.component,
      component = _opts$component === void 0 ? true : _opts$component,
      _opts$page = opts.page,
      page = _opts$page === void 0 ? true : _opts$page,
      _opts$overwriteArrayO = opts.overwriteArrayOnDeleted,
      overwriteArrayOnDeleted = _opts$overwriteArrayO === void 0 ? true : _opts$overwriteArrayO,
      _opts$autoSync = opts.autoSync,
      autoSync = _opts$autoSync === void 0 ? true : _opts$autoSync; // 解析变更内容

  function diffAndMergeChanges(state, obj) {
    var rawChanges = diff(deepPick(state, keys(obj)), obj);
    if (!rawChanges) return null;
    var changes = {};
    var lastArrayDeletedPath = '';
    var hasChanges = false;

    for (var i = 0; i < rawChanges.length; i++) {
      var item = rawChanges[i]; // NOTE: 暂不处理删除对象属性的情况

      if (item.kind !== 'D') {
        // 修复路径 a.b.0.1 => a.b[0][1]
        var path = item.path.join('.').replace(/\.([0-9]+)\./g, '[$1].').replace(/\.([0-9]+)$/, '[$1]'); // 处理数组删除的问题，后续更新如果为数组中的元素，直接跳过

        if (overwriteArrayOnDeleted && lastArrayDeletedPath && path.indexOf(lastArrayDeletedPath) === 0) continue; // 记录变化

        var value = item.rhs; // 对数组特殊处理

        if (item.kind === 'A') {
          // 处理数组元素删除的情况，需要业务代码做支持
          if (item.item.kind === 'D') {
            // 覆盖整个数组
            if (overwriteArrayOnDeleted) {
              // 如果后续变更依然为同一个数组中的操作，直接跳过
              if (lastArrayDeletedPath === path) continue;
              lastArrayDeletedPath = path;
              value = get(obj, path);
            } else {
              // 对特定数组元素置空
              path = "".concat(path, "[").concat(item.index, "]");
              value = null;
            }
          } else {
            // 其他情况如 添加/修改 直接修改值
            // 如果后续变更为数组中的更新，忽略
            if (overwriteArrayOnDeleted && lastArrayDeletedPath === path) continue;
            path = "".concat(path, "[").concat(item.index, "]");
            value = item.item.rhs;
          }
        } // 忽略 undefined


        if (value !== void 0) {
          hasChanges = true; // 深拷贝 value，防止对 this.data 的直接修改影响 diff 算法的结果

          set(state, path, cloneDeep(value));
          changes[path] = value;
        }
      }
    }

    return hasChanges ? changes : null;
  } // 初始化状态函数


  function initState() {
    // 初始化状态
    this.$$state = cloneDeep(this.data);
  } // 给 setData 打补丁,


  function patchSetData() {
    var _this = this;

    // 防止重复打补丁
    if (this.__setDataPatched) return;
    this.__setData = this.setData;

    this.setData = function (obj, callback) {
      // 开启调试
      if (debug) printDiffInfo(_this, debug, null, '手动调用 setData 无法 diff'); // 调用原 setData

      _this.__setData(obj, function () {
        // 如果开启自动同步，则在调用 setData 完成后，自动同步所有数据到 state 中
        if (autoSync) initState.call(this);
        if (typeof callback === 'function') return callback();
      });
    };

    this.__setDataPatched = true;
  } // 设置状态函数


  function setState(obj, callback) {
    // 初始化状态
    if (!this.$$state) this.initState(); // 记录当前时间

    var time = +new Date(); // 输出 debug 信息

    if (debug === 'conflict' || debug === true) checkPropertyAndDataConflict(this, obj); // 计算变更

    var changes = diffAndMergeChanges(this.$$state, obj); // 如果有变更，则触发更新

    if (changes) {
      // 开启调试
      if (debug) printDiffInfo(this, debug, time, changes);

      this.__setData(changes, callback);
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  try {
    if (page) {
      var $Page = Page; // Page 功能扩展

      Page = function Page() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        obj.__isPage = true; // 修改 onLoad 方法，页面载入时打补丁

        var _onLoad = obj.onLoad || noop;

        obj.onLoad = function () {
          initState.call(this);
          patchSetData.call(this);
          return _onLoad.apply(this, arguments);
        }; // 注入 initState 和 setState 方法


        obj.initState = function () {
          initState.call(this);
        };

        obj.setState = function () {
          setState.apply(this, arguments);
        };

        return $Page(obj);
      };
    }

    if (component) {
      var $Component = Component; // Component 功能扩展

      Component = function Component() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var properties = obj.properties || {};
        obj.lifetimes = obj.lifetimes || {};
        obj.methods = obj.methods || {}; // 修改 created 方法，组件创建时打补丁

        var _created = obj.lifetimes.created || obj.created || noop;

        obj.lifetimes.created = obj.created = function () {
          patchSetData.call(this); // 标识组件

          this.__isComponent = true; // 打印调用堆栈

          if (debug) addInvokeStackProp(this); // 保存属性设置

          this.$$properties = properties;
          return _created.apply(this, arguments);
        }; // 修改 attached 方法，组件挂载时初始化 state


        var _attached = obj.lifetimes.attached || obj.attached || noop;

        obj.lifetimes.attached = obj.attached = function () {
          initState.call(this);
          return _attached.apply(this, arguments);
        }; // 注入 initState 和 setState 方法


        obj.methods.initState = function () {
          initState.call(this);
        };

        obj.methods.setState = function () {
          setState.apply(this, arguments);
        };

        return $Component(obj);
      };
    }
  } catch (e) {
    // Page 或者 Component 未定义
    console.log('覆盖小程序 Page 或 Component 出错', e);
  }
}

module.exports = enableState;