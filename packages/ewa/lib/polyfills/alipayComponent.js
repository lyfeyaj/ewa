"use strict";

var keys = require('lodash.keys');

var assign = require('lodash.assign');

function alipayComponent() {
  var __Component = Component;

  Component = function Component(obj) {
    obj.onInit = function () {
      obj.attached.apply(this);
      obj.created.apply(this);
      this.properties = this.props || {};
    };

    var props = {};
    obj.properties = obj.properties || {};
    keys(obj.properties).forEach(function (key) {
      var prop = obj.properties[key] || {};
      if ('value' in prop) props[key] = prop.value;
    });
    obj.props = props;

    obj.deriveDataFromProps = function () {
      var _this = this;

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
              observer.call(_this, _this.properties[key]);
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