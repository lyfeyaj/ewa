/* eslint-disable no-console */

const diff = require('deep-diff');
const set = require('lodash.set');
const get = require('lodash.get');
const cloneDeep = require('lodash.clonedeep');
const pick = require('lodash.pick');
const keys = require('lodash.keys');

const noop = function () {};

// 日志打印
const logger = function(type, name, changes) {
  if (!console) return;
  try {
    if (console.group) {
      console.group(type, name);
      console.log(changes);
      console.groupEnd();
    } else {
      console.log(type, name, changes);
    }
  } catch (e) {
    // Do nothing
  }
};

// 开启 state 支持
function enableState(opts = {}) {
  const {
    debug = false,
    component = true,
    page = true,

    // 数组删除操作： true 或者 false
    overwriteArrayOnDeleted = true
  } = opts;



  // 解析变更内容
  function diffAndMergeChanges(state, obj) {
    let rawChanges = diff(pick(state, keys(obj)), obj);

    if (!rawChanges) return;

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
          overwriteArrayOnDeleted &&
          lastArrayDeletedPath &&
          path.indexOf(lastArrayDeletedPath) === 0
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
            }

            // 对特定数组元素置空
            else {
              path = `${path}[${item.index}]`;
              value = null;
            }
          }
          // 其他情况如 添加/修改 直接修改值
          else {
            // 如果后续变更为数组中的更新，忽略
            if (overwriteArrayOnDeleted && lastArrayDeletedPath === path) continue;

            path = `${path}[${item.index}]`;
            value = item.item.rhs;
          }
        }

        // 忽略 undefined
        if (value !== void 0) {
          hasChanges = true;
          set(state, path, value);

          // 深拷贝 value，防止对 this.data 的直接修改影响 diff 算法的结果
          changes[path] = cloneDeep(value);
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

  // 设置状态函数
  function setState(obj, callback) {
    // 初始化状态
    if (!this.$$state) this.initState();

    // 计算增量更新
    let changes = diffAndMergeChanges(this.$$state, obj);

    if (changes) {
      // 开启调试模式
      if (debug) {
        let type = this.__isPage ? 'Page:' : 'Component:';
        if (debug === true) logger(type, this.route || this.is, changes);
        if (debug === 'page' && this.__isPage) logger(type, this.route, changes);
        if (debug === 'component' && this.__isComponent) logger(type, this.is, changes);
      }

      this.setData(changes, callback);
    } else {
      if (typeof callback === 'function') callback();
    }
  }

  // 仅在 Page 开启 setState
  if (page) {
    const $Page = Page;
    Page = function(obj = {}) {

      let originOnload = obj.onLoad || noop;
      obj.onLoad = function () {
        initState.call(this);
        return originOnload.apply(this, arguments);
      };

      obj.initState = function() { initState.call(this); };
      obj.setState = function() { setState.apply(this, arguments); };
      obj.__isPage = true;
      return $Page(obj);
    };
  }

  // 仅在 Component 开启 setState
  if (component) {
    const $Component = Component;
    Component = function(obj = {}) {

      let originCreated = obj.created || noop;
      obj.created = function () {
        initState.call(this);
        return originCreated.apply(this, arguments);
      };

      obj.methods = obj.methods || {};
      obj.methods.initState = function() { initState.call(this); };
      obj.methods.setState = function() { setState.apply(this, arguments); };

      // 代替 true
      obj.methods.__isComponent = function(){};
      return $Component(obj);
    };
  }
}

module.exports = enableState;