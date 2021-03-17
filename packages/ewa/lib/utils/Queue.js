"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
    value: function () {
      var _handleError2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(e, fn) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(typeof this.onError === 'function')) {
                  _context.next = 11;
                  break;
                }

                _context.prev = 1;
                _context.next = 4;
                return Promise.resolve(this.onError(e, fn));

              case 4:
                _context.next = 9;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context["catch"](1);
                console.log("Error: ".concat(_context.t0.message));

              case 9:
                _context.next = 12;
                break;

              case 11:
                if (e) console.log("Error on executing ".concat(fn.name, ": ").concat(e.message));

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 6]]);
      }));

      function _handleError(_x, _x2) {
        return _handleError2.apply(this, arguments);
      }

      return _handleError;
    }()
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