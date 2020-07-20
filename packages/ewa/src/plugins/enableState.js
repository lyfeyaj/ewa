/* eslint-disable no-console */

const diff = require('deep-diff');
const set = require('lodash.set');
const get = require('lodash.get');
const cloneDeep = require('lodash.clonedeep');
const keys = require('lodash.keys');

const noop = function () {};

// 取出 对象中的部分键值，支持 嵌套 key， 如 'user.gender'
function deepPick(obj, props = []) {
  let _obj = {};
  if (!obj) return _obj;
  for (let i = 0; i < props.length; i++) {
    let prop = props[i];
    _obj[prop] = get(obj, prop);
  }
  return _obj;
}

// 日志打印
const logger = function (type, name, stack = [], timeConsumption = 0, changes) {
  if (!console) return;
  let timeConsumptionMsg = `Diff 耗时: ${timeConsumption}ms`;
  try {
    if (console.group) {
      console.group(type, name, '触发更新');
      console.log(timeConsumptionMsg);
      console.log('Diff 结果: ', changes);
      // 打印调用堆栈
      if (stack && stack.length) {
        let _spaces = '';
        let _stack = stack.reduce((res, item, i) => {
          if (i === 0) return `${res}\n    ${item}`;
          _spaces = `    ${_spaces}`;
          return `${res}\n${_spaces}└── ${item}`;
        }, '调用栈: ');
        console.log(_stack);
      }
      console.groupEnd();
    } else {
      console.log(type, name, stack, timeConsumptionMsg, 'Diff 结果: ', changes);
    }
  } catch (e) {
    // Do nothing
  }
};

// 打印 Diff 相关 信息
const printDiffInfo = function (ctx, debug, time, changes) {
  let timeConsumption = time ? +new Date() - time : 0;
  let type = ctx.__isPage ? '页面:' : '组件:';
  let name = ctx.__isPage ? ctx.route : ctx.is;
  let stack = ctx.__invokeStack || [];
  if (debug === true || debug === 'all') logger(type, name, stack, timeConsumption, changes);
  if (debug === 'page' && ctx.__isPage) logger(type, name, stack, timeConsumption, changes);
  if (debug === 'component' && ctx.__isComponent) logger(type, name, stack, timeConsumption, changes);
};

// 添加调用堆栈属性
const addInvokeStackProp = function (ctx) {
  Object.defineProperty(ctx, '__invokeStack', {
    get() {
      if (this.__invokeStack__) return this.__invokeStack__;

      let stack = [];

      if (typeof this.selectOwnerComponent === 'function') {
        let parent = this.selectOwnerComponent();
        if (parent) {
          if (parent.__isComponent) stack = parent.__invokeStack || [];
          if (parent.__isPage) stack = [parent.route];
        }
      }

      this.__invokeStack__ = stack.concat(this.is);

      return this.__invokeStack__;
    },
  });
};

// 检查并警告 Component 中，data 和 properties 属性冲突
const checkPropertyAndDataConflict = function (ctx, obj) {
  if (!ctx.__isComponent) return;

  let changedKeys = keys(obj);
  let conflictKeys = [];
  for (let i = 0; i < changedKeys.length; i++) {
    let k = changedKeys[i];
    if (k in ctx.$$properties) {
      conflictKeys.push(k);
    }
  }
  if (conflictKeys.length) {
    console.warn(`组件: ${ctx.is} 中, properties 和 data 存在字段冲突: ${conflictKeys.join('、')}, 请尽快调整`);
  }
};

// 开启 state 支持
function enableState(opts = {}) {
  const {
    // 是否开启 debug 模式，支持3种参数： true, 'page', 'component'
    debug = false,

    // 是否开启 component 支持
    component = true,

    // 是否开启 page 支持
    page = true,

    // 数组删除操作： true 或者 false
    overwriteArrayOnDeleted = true,

    // 是否在 调用 setData 时自动同步 state
    autoSync = true,
  } = opts;

  // 解析变更内容
  function diffAndMergeChanges(state, obj) {
    let rawChanges = diff(deepPick(state, keys(obj)), obj);

    if (!rawChanges) return null;

    let changes = {};
    let lastArrayDeletedPath = '';
    let hasChanges = false;

    for (let i = 0; i < rawChanges.length; i++) {
      let item = rawChanges[i];
      // NOTE: 暂不处理删除对象属性的情况
      if (item.kind !== 'D') {
        // 修复路径 a.b.0.1 => a.b[0][1]
        let path = item.path
          .join('.')
          .replace(/\.([0-9]+)\./g, '[$1].')
          .replace(/\.([0-9]+)$/, '[$1]');

        // 处理数组删除的问题，后续更新如果为数组中的元素，直接跳过
        if (
          overwriteArrayOnDeleted
          && lastArrayDeletedPath
          && path.indexOf(lastArrayDeletedPath) === 0
        ) continue;

        // 记录变化
        let value = item.rhs;

        // 对数组特殊处理
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
              path = `${path}[${item.index}]`;
              value = null;
            }
          } else {
            // 其他情况如 添加/修改 直接修改值

            // 如果后续变更为数组中的更新，忽略
            if (overwriteArrayOnDeleted && lastArrayDeletedPath === path) continue;

            path = `${path}[${item.index}]`;
            value = item.item.rhs;
          }
        }

        // 忽略 undefined
        if (value !== void 0) {
          hasChanges = true;
          // 深拷贝 value，防止对 this.data 的直接修改影响 diff 算法的结果
          set(state, path, cloneDeep(value));

          changes[path] = value;
        }
      }
    }

    return hasChanges ? changes : null;
  }

  // 初始化状态函数
  function initState() {
    // 初始化状态
    this.$$state = cloneDeep(this.data);
  }

  // 给 setData 打补丁,
  function patchSetData() {
    // 防止重复打补丁
    if (this.__setDataPatched) return;

    this.__setData = this.setData;

    this.setData = (obj, callback) => {
      // 开启调试
      if (debug) printDiffInfo(this, debug, null, '手动调用 setData 无法 diff');

      // 调用原 setData
      this.__setData(obj, function () {
        // 如果开启自动同步，则在调用 setData 完成后，自动同步所有数据到 state 中
        if (autoSync) initState.call(this);
        if (typeof callback === 'function') return callback();
      });
    };

    this.__setDataPatched = true;
  }

  // 设置状态函数
  function setState(obj, callback) {
    // 初始化状态
    if (!this.$$state) this.initState();

    // 记录当前时间
    let time = +new Date();

    // 输出 debug 信息
    if (debug === 'conflict' || debug === true) checkPropertyAndDataConflict(this, obj);

    // 计算变更
    let changes = diffAndMergeChanges(this.$$state, obj);

    // 如果有变更，则触发更新
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
      let $Page = Page;
      // Page 功能扩展
      Page = function (obj = {}) {
        obj.__isPage = true;

        // 修改 onLoad 方法，页面载入时打补丁
        let _onLoad = obj.onLoad || noop;
        obj.onLoad = function () {
          initState.call(this);
          patchSetData.call(this);
          return _onLoad.apply(this, arguments);
        };

        // 注入 initState 和 setState 方法
        obj.initState = function () { initState.call(this); };
        obj.setState = function () { setState.apply(this, arguments); };

        return $Page(obj);
      };
    }

    if (component) {
      let $Component = Component;
      // Component 功能扩展
      Component = function (obj = {}) {
        let properties = obj.properties || {};
        obj.lifetimes = obj.lifetimes || {};
        obj.methods = obj.methods || {};

        // 修改 created 方法，组件创建时打补丁
        let _created = obj.lifetimes.created || obj.created || noop;
        obj.lifetimes.created = obj.created = function () {
          patchSetData.call(this);

          // 标识组件
          this.__isComponent = true;

          // 打印调用堆栈
          if (debug) addInvokeStackProp(this);

          // 保存属性设置
          this.$$properties = properties;
          return _created.apply(this, arguments);
        };

        // 修改 attached 方法，组件挂载时初始化 state
        let _attached = obj.lifetimes.attached || obj.attached || noop;
        obj.lifetimes.attached = obj.attached = function () {
          initState.call(this);
          return _attached.apply(this, arguments);
        };

        // 注入 initState 和 setState 方法
        obj.methods.initState = function () { initState.call(this); };
        obj.methods.setState = function () { setState.apply(this, arguments); };

        return $Component(obj);
      };
    }
  } catch (e) {
    // Page 或者 Component 未定义
    console.log('覆盖小程序 Page 或 Component 出错', e);
  }
}

module.exports = enableState;
