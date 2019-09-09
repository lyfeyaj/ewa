const diff = require('deep-diff');
const set = require('lodash.set');
const cloneDeep = require('lodash.clonedeep');
const pick = require('lodash.pick');
const keys = require('lodash.keys');

const logger = function() {
  // eslint-disable-next-line
  console.log.apply(console, arguments);
};

function enableState(opts = {}) {
  const {
    debug = false,
    component = true,
    page = true
  } = opts;

  // 解析变更内容
  function diffAndMergeChanges(state, obj) {
    let rawChanges = diff(pick(state, keys(obj)), obj);

    if (!rawChanges) return;

    let changes = {};
    let hasChanges = false;

    for (let i = 0; i < rawChanges.length; i++) {
      let item = rawChanges[i];
      if (item.kind !== 'D') {
        // 修复路径 a.b.0.1 => a.b[0][1]
        let path = item.path
          .join('.')
          .replace(/\.([0-9]+)\./g, '[$1].')
          .replace(/\.([0-9]+)$/, '[$1]');

        // 记录变化
        let value = item.rhs;

        // 对数组特殊处理
        if (item.kind === 'A') {
          path = `${path}[${item.index}]`;
          value = item.item.rhs;
        }

        // 忽略 undefined
        if (value !== void 0) {
          hasChanges = true;
          set(state, path, value);

          // 深拷贝 值，防止直接对 this.data 进行修改
          changes[path] = cloneDeep(value);
        }
      }
    }

    return hasChanges ? changes : null;
  }

  // 设置状态函数
  function setState(obj, callback) {
    // 初始化状态
    if (!this.$$state) this.$$state = cloneDeep(this.data);

    // 计算增量更新
    let changes = diffAndMergeChanges(this.$$state, obj);

    if (changes) {
      // 开启调试模式
      if (debug) {
        if (debug === true) logger(this.route || this.is, changes);
        if (debug === 'page' && this.__isPage) logger(this.route, changes);
        if (debug === 'component' && this.__isComponent) logger(this.is, changes);
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
      obj.setState = function() { setState.apply(this, arguments); };
      obj.__isPage = true;
      return $Page(obj);
    };
  }

  // 仅在 Component 开启 setState
  if (component) {
    const $Component = Component;
    Component = function(obj = {}) {
      obj.methods = obj.methods || {};
      obj.methods.setState = function() { setState.apply(this, arguments); };

      // 代替 true
      obj.methods.__isComponent = function(){};
      return $Component(obj);
    };
  }
}

module.exports = enableState;