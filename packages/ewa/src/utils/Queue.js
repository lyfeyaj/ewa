
module.exports = class Queue {
  constructor(maxCocurrency) {
    // 队列
    this._queue = [];

    // 并发数
    this._maxCocurrency = maxCocurrency || 10;

    // 当前并发数
    this._currentCocurrency = 0;
  }

  isEmpty() {
    return !!this._queue.length;
  }

  shift() {
    // 当前并发数大于最大并发数时, 不做任何操作
    if (this._currentCocurrency >= this._maxCocurrency) {
      return Promise.resolve();
    }

    // 执行队列下一个请求
    let next = this._queue.shift();

    if (next) {
      this._currentCocurrency++;

      // 处理下一个请求
      let _handleNext = (e) => {
        // eslint-disable-next-line
        if (e) console.log(e.message, e.stack);
        this._currentCocurrency--;
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
