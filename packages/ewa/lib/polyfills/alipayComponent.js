"use strict";

var keys = require('lodash.keys');

var assign = require('lodash.assign');

function alipayComponent() {
  var __Component = Component;

  Component = function Component(obj) {
    obj.onInit = function () {
      var _this = this;

      this.properties = this.props || {};

      this.triggerEvent = function (name, params) {
        name = name.replace(/^[a-zA-Z]{1}/, function (s) {
          return s.toUpperCase();
        });

        _this.props['on' + name]({
          detail: params
        });
      };

      obj.created.apply(this);
      obj.attached.apply(this);
      obj.didMount = obj.ready && obj.ready.bind(this);
      obj.didUnmount = obj.detached && obj.detached.bind(this);
    };

    var props = {};
    obj.properties = obj.properties || {};
    keys(obj.properties).forEach(function (key) {
      var prop = obj.properties[key] || {};
      if ('value' in prop) props[key] = prop.value;
    });
    obj.props = props;

    obj.deriveDataFromProps = function () {
      var _this2 = this;

      var nextProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.properties = assign(this.properties, nextProps || {});
      keys(nextProps).forEach(function (key) {
        var prop = obj.properties[key] || {};

        if (prop.observer) {
          var observer;

          if (typeof prop.observer === 'string') {
            observer = obj.methods[prop.observer];
          } else if (typeof prop.observer === 'function') {
            observer = prop.observer;
          }

          if (observer) {
            try {
              observer.call(_this2, _this2.properties[key]);
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