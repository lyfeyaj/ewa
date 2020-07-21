"use strict";

var isObject = require('lodash.isobject');

var isPlainObject = require('lodash.isplainobject');

var initStore = require('./init');

var Observer = require('./Observer');

var obInstance = Observer.getInstance();
var hasStore = false;

function createStore(obj) {
  if (hasStore) return;
  hasStore = true;
  initStore();

  if (isPlainObject(obj)) {
    obInstance.reactiveObj = obj;
    reactive(obj);
    return obj;
  }

  if (console && console.warn) console.warn('createStore方法只能接收纯对象，请尽快调整');
}

function reactive(obj, key) {
  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], key);
  }
}

function defineReactive(obj, key, path) {
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return;
  var getter = property && property.get;
  var setter = property && property.set;
  var val = obj[key];
  if (path) path = "".concat(path, ".").concat(key);
  if (isObject(val)) reactive(val, path || key);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) return;
      if (getter && !setter) return;

      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
        obInstance.emitReactive(path || key, val);
      }
    }
  });
}

module.exports = createStore;