"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Queue = function () {
  function Queue(concurrency) {
    _classCallCheck(this, Queue);

    this._queue = [];
    this._concurrency = concurrency || 8;
    this._pendingCount = 0;
  }

  _createClass(Queue, [{
    key: "concurrency",
    get: function get() {
      return this._concurrency;
    },
    set: function set(num) {
      this._concurrency = num;

      while (this._canProcessNext()) {
        this._processQueue();
      }
    }
  }, {
    key: "size",
    get: function get() {
      return this._queue.length;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.size === 0;
    }
  }, {
    key: "_canProcessNext",
    value: function _canProcessNext() {
      return this.size > 0 && this._pendingCount < this._concurrency;
    }
  }, {
    key: "_processQueue",
    value: function _processQueue() {
      var _this = this;

      if (!this._canProcessNext()) return Promise.resolve();

      var next = this._queue.shift();

      if (!next) return Promise.resolve();
      this._pendingCount++;

      try {
        return Promise.resolve(next()).then(function () {
          return _this._handleNext();
        }).catch(function (e) {
          _this._handleError(e, next);

          return _this._handleNext();
        });
      } catch (e) {
        this._handleError(e, next);

        return this._handleNext();
      }
    }
  }, {
    key: "_handleNext",
    value: function _handleNext() {
      this._pendingCount--;
      return this._processQueue();
    }
  }, {
    key: "_handleError",
    value: function _handleError(e, fn) {
      var logError = function logError() {
        var err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        console.log("Error on executing ".concat(fn.name, ": ").concat(err.message));
      };

      if (typeof this.onError !== 'function') return logError(e);

      try {
        Promise.resolve(this.onError(e, fn)).catch(logError);
      } catch (err) {
        logError(err);
      }
    }
  }, {
    key: "enqueue",
    value: function enqueue(fn) {
      if (typeof fn !== 'function') throw new Error("".concat(fn, " is not a valid function"));

      this._queue.push(fn);

      this._processQueue();

      return this;
    }
  }, {
    key: "push",
    value: function push(fn) {
      return this.enqueue(fn);
    }
  }, {
    key: "add",
    value: function add(fn) {
      return this.enqueue(fn);
    }
  }]);

  return Queue;
}();

module.exports = Queue;