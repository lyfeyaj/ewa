/* eslint-disable no-console */

const keys = require('lodash.keys');
const assign = require('lodash.assign');

function alipayComponent() {
  const __Component = Component;

  // 覆盖 Component 以支持微信 Component 转换为 支付宝 的 Component
  Component = function (obj) {
    // NOTE: 需要更加精确的控制生命周期函数, 兼容性未测试
    obj.onInit = function () {
      this.properties = this.props || {};

      // 兼容微信组件中的 triggerEvent
      this.triggerEvent = (name, params) => {
        name = name.replace(/^[a-zA-Z]{1}/, function (s) {
          return s.toUpperCase()
        })
        // 支付宝组件传递函数时 必须以on开头并且on后的第一个字母必须大写（微信必须全小写）
        this.props['on' + name]({ detail: params })
      }

      obj.created.apply(this);
      obj.attached.apply(this);
      obj.didMount = obj.ready.bind(this)
      obj.didUnmount = obj.detached.bind(this)
    };

    // obj.didMount = obj.created;

    // 遍历 properties
    // properties: { name: { type: String, value: '', observer: 'handleNameChange' } }
    // 转换为
    // props: { name: '' }
    let props = {};
    obj.properties = obj.properties || {};
    keys(obj.properties).forEach((key) => {
      let prop = obj.properties[key] || {};
      if ('value' in prop) props[key] = prop.value;
    });
    obj.props = props;

    // 接收变更，需要开启 component2 支持
    obj.deriveDataFromProps = function (nextProps = {}) {
      // 更新 properties
      this.properties = assign(this.properties, nextProps || {});

      // 遍历所有更新的 prop 并触发更新
      keys(nextProps).forEach((key) => {
        let prop = obj.properties[key] || {};
        if (prop.observer) {
          let observer;
          if (typeof prop.observer === 'string') {
            observer = obj.methods[prop.observer];
          } else if (typeof prop.observer === 'function') {
            observer = prop.observer;
          }

          // 执行更新
          if (observer) {
            try {
              observer.call(this, this.properties[key]);
            } catch (e) {
              console.log(e);
            }
          }
        }
      });
    };

    return __Component(obj);
  };
}

module.exports = alipayComponent;
