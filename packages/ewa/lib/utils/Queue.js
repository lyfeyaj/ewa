"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

module.exports = /*#__PURE__*/function () {
  function Queue(maxCocurrency) {
    _classCallCheck(this, Queue);

    // 队列
    this._queue = []; // 并发数

    this._maxCocurrency = maxCocurrency || 10; // 当前并发数

    this._currentCocurrency = 0;
  }

  _createClass(Queue, [{
    key: "isEmpty",
    value: function isEmpty() {
      return !!this._queue.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      var _this = this;

      // 当前并发数大于最大并发数时, 不做任何操作
      if (this._currentCocurrency >= this._maxCocurrency) {
        return Promise.resolve();
      } // 执行队列下一个请求


      var next = this._queue.shift();

      if (next) {
        this._currentCocurrency++; // 处理下一个请求

        var _handleNext = function _handleNext(e) {
          // eslint-disable-next-line
          if (e) console.log(e.message, e.stack);
          _this._currentCocurrency--;
          return _this.shift();
        };

        try {
          return Promise.resolve(next()).then(function () {
            return _handleNext();
          }).catch(_handleNext);
        } catch (e) {
          return _handleNext(e);
        }
      } else {
        return Promise.resolve();
      }
    }
  }, {
    key: "push",
    value: function push(item) {
      this._queue.push(item);

      this.shift();
      return this;
    }
  }]);

  return Queue;
}();