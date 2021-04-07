"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function alipayStorage() {
  ['setStorageSync', 'removeStorageSync'].forEach(function (methodName) {
    var _cacheFn = my[methodName];

    my[methodName] = function (key, data) {
      if (_typeof(key) === 'object') return _cacheFn(key);
      return _cacheFn({
        key: key,
        data: data
      });
    };
  });
  var _getStorageSync = my.getStorageSync;

  my.getStorageSync = function (key) {
    var res = null;

    if (_typeof(key) === 'object') {
      res = _getStorageSync(key);
    } else {
      res = _getStorageSync({
        key: key
      });
    }

    if (res.success) return res.data;
  };
}

module.exports = alipayStorage;