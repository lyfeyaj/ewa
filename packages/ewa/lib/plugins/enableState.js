"use strict";

var diff = require('deep-diff');

var set = require('lodash.set');

var get = require('lodash.get');

var cloneDeep = require('lodash.clonedeep');

var keys = require('lodash.keys');

var noop = function noop() {};

function deepPick(obj) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var _obj = {};
  if (!obj) return _obj;

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    _obj[prop] = get(obj, prop);
  }

  return _obj;
}

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
      console.log('Diff 结果: ', changes);

      if (stack && stack.length) {
        var _spaces = '';

        var _stack = stack.reduce(function (res, item, i) {
          if (i === 0) return "".concat(res, "\n    ").concat(item);
          _spaces = "    ".concat(_spaces);
          return "".concat(res, "\n").concat(_spaces, "\u2514\u2500\u2500 ").concat(item);
        }, '调用栈: ');

        console.log(_stack);
      }

      console.groupEnd();
    } else {
      console.log(type, name, stack, timeConsumptionMsg, 'Diff 结果: ', changes);
    }
  } catch (e) {}
};

var printDiffInfo = function printDiffInfo(ctx, debug, time, changes) {
  var timeConsumption = time ? +new Date() - time : 0;
  var type = ctx.__isPage ? '页面:' : '组件:';
  var name = ctx.__isPage ? ctx.route : ctx.is;
  var stack = ctx.__invokeStack || [];
  if (debug === true || debug === 'all') logger(type, name, stack, timeConsumption, changes);
  if (debug === 'page' && ctx.__isPage) logger(type, name, stack, timeConsumption, changes);
  if (debug === 'component' && ctx.__isComponent) logger(type, name, stack, timeConsumption, changes);
};

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
};

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
};

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
      autoSync = _opts$autoSync === void 0 ? true : _opts$autoSync;

  function diffAndMergeChanges(state, obj) {
    var rawChanges = diff(deepPick(state, keys(obj)), obj);
    if (!rawChanges) return null;
    var changes = {};
    var lastArrayDeletedPath = '';
    var hasChanges = false;

    for (var i = 0; i < rawChanges.length; i++) {
      var item = rawChanges[i];

      if (item.kind !== 'D') {
        var path = item.path.join('.').replace(/\.([0-9]+)\./g, '[$1].').replace(/\.([0-9]+)$/, '[$1]');
        if (overwriteArrayOnDeleted && lastArrayDeletedPath && path.indexOf(lastArrayDeletedPath) === 0) continue;
        var value = item.rhs;

        if (item.kind === 'A') {
          if (item.item.kind === 'D') {
            if (overwriteArrayOnDeleted) {
              if (lastArrayDeletedPath === path) continue;
              lastArrayDeletedPath = path;
              value = get(obj, path);
            } else {
              path = "".concat(path, "[").concat(item.index, "]");
              value = null;
            }
          } else {
            if (overwriteArrayOnDeleted && lastArrayDeletedPath === path) continue;
            path = "".concat(path, "[").concat(item.index, "]");
            value = item.item.rhs;
          }
        }

        if (value !== void 0) {
          hasChanges = true;
          set(state, path, cloneDeep(value));
          changes[path] = value;
        }
      }
    }

    return hasChanges ? changes : null;
  }

  function initState() {
    this.$$state = cloneDeep(this.data);
  }

  function patchSetData() {
    var _this = this;

    if (this.__setDataPatched) return;
    this.__setData = this.setData;

    try {
      this.setData = function (obj, callback) {
        if (debug) printDiffInfo(_this, debug, null, '手动调用 setData 无法 diff');

        _this.__setData(obj, function () {
          if (autoSync) initState.call(this);
          if (typeof callback === 'function') return callback();
        });
      };

      this.__setDataPatched = true;
    } catch (error) {
      if (!patchSetData.warningPrinted && console && console.warn) {
        console.warn('注意: setData 补丁失败, 如在 Page 或 Component 中混用 setData 和 setState, ' + '请在每次调用 setData 之后, 手动调用 syncState 以保持 data 和 state 数据同步');
      }

      patchSetData.warningPrinted = true;
    }
  }

  function setState(obj, callback) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      if (!_this2.$$state) _this2.initState();
      var time = +new Date();
      if (debug === 'conflict' || debug === true) checkPropertyAndDataConflict(_this2, obj);
      var changes = diffAndMergeChanges(_this2.$$state, obj);
      var cb;

      if (typeof callback === 'function') {
        cb = function cb() {
          try {
            callback();
            resolve();
          } catch (error) {
            reject(error);
          }
        };
      } else {
        cb = function cb() {
          return resolve();
        };
      }

      if (changes) {
        if (debug) printDiffInfo(_this2, debug, time, changes);

        _this2.__setData(changes, cb);
      } else {
        cb();
      }
    });
  }

  try {
    if (page) {
      var $Page = Page;

      Page = function Page() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        obj.__isPage = true;

        var _onLoad = obj.onLoad || noop;

        obj.onLoad = function () {
          initState.call(this);
          patchSetData.call(this);
          return _onLoad.apply(this, arguments);
        };

        obj.initState = function () {
          initState.call(this);
        };

        obj.syncState = function () {
          initState.call(this);
        };

        obj.setState = function () {
          return setState.apply(this, arguments);
        };

        return $Page(obj);
      };
    }

    if (component) {
      var $Component = Component;

      Component = function Component() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var properties = obj.properties || {};
        obj.lifetimes = obj.lifetimes || {};
        obj.methods = obj.methods || {};

        var _created = obj.lifetimes.created || obj.created || noop;

        obj.lifetimes.created = obj.created = function () {
          patchSetData.call(this);
          this.__isComponent = true;
          if (debug) addInvokeStackProp(this);
          this.$$properties = properties;
          return _created.apply(this, arguments);
        };

        var _attached = obj.lifetimes.attached || obj.attached || noop;

        obj.lifetimes.attached = obj.attached = function () {
          initState.call(this);
          return _attached.apply(this, arguments);
        };

        obj.methods.initState = function () {
          initState.call(this);
        };

        obj.methods.setState = function () {
          return setState.apply(this, arguments);
        };

        return $Component(obj);
      };
    }
  } catch (e) {
    console.log('覆盖小程序 Page 或 Component 出错', e);
  }
}

module.exports = enableState;