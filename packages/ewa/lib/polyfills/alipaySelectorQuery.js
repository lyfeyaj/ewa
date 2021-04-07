"use strict";

function alipaySelectorQuery() {
  var query = my.createSelectorQuery();
  var overrideQueryFns = ['in', 'select', 'selectAll', 'selectViewport'];
  overrideQueryFns.forEach(function (name) {
    var _cacheFn = query.__proto__[name];

    query.__proto__[name] = function (selector) {
      var node = _cacheFn.call(this, selector);

      if (!node.__query) {
        node.__query = this;
        this.cacheCallbacks = [];
      }

      return node;
    };
  });
  var node = query.selectViewport();
  var overrideNodeFns = ['boundingClientRect', 'scrollOffset'];
  overrideNodeFns.forEach(function (name) {
    var _cacheFn = node.__proto__[name];

    node.__proto__[name] = function (cb) {
      this.__query && this.__query.cacheCallbacks.push(cb);
      return _cacheFn.call(this, cb);
    };
  });
  var _exec = query.__proto__.exec;

  query.__proto__.exec = function (cb) {
    var _this = this;

    return _exec.call(this, function (rects) {
      cb && cb.call(this, rects);

      if (_this.cacheCallbacks && _this.cacheCallbacks.length) {
        _this.cacheCallbacks.forEach(function (cacheCallback, i) {
          cacheCallback && cacheCallback(rects[i]);
        });
      }

      _this.cacheCallbacks = null;
    });
  };
}

module.exports = alipaySelectorQuery;