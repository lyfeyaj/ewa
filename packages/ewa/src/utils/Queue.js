module.exports = class Queue {
  constructor(maxConcurrency) {
    // 队列
    this._queue = [];

    // 并发数
    this._maxConcurrency = maxConcurrency || 8;

    // 当前并发数
    this._currentConcurrency = 0;
  }

  isEmpty() {
    return !!this._queue.length;
  }

  shift() {
    // 当前并发数大于最大并发数时, 不做任何操作
    if (this._currentConcurrency >= this._maxConcurrency) {
      return Promise.resolve();
    }

    // 执行队列下一个请求
    let next = this._queue.shift();

    if (next) {
      this._currentConcurrency++;

      // 处理下一个请求
      let _handleNext = (e) => {
        // eslint-disable-next-line
        if (e) console.log(e.message, e.stack);
        this._currentConcurrency--;
        return this.shift();
      };

      try {
        return Promise.resolve(next()).then(() => _handleNext()).catch(_handleNext);
      } catch (e) {
        return _handleNext(e);
      }
    } else {
      return Promise.resolve();
    }
  }

  push(item) {
    this._queue.push(item);
    this.shift();
    return this;
  }
};
